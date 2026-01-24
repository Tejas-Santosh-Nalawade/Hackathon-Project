"""
Web Search Utilities for GrowthGuru Bot

Uses DuckDuckGo search (free, no API key needed) to find:
- Online courses and learning resources
- Job market news and hiring trends
- Career certifications and skill development

This version focuses on better relevance by:
- Extracting a cleaner topic from user messages (filters stopwords/fillers)
- Using DDG search options (region + safesearch + recency)
- Scoring/ranking results against the topic and preferred domains
- Dropping obviously irrelevant or non-English results
"""

import re
import time
from urllib.parse import urlparse
from duckduckgo_search import DDGS


# =============================================================================
# Topic Extraction
# =============================================================================

# Common phrases to strip from user messages when extracting topic
STRIP_PHRASES = [
    # Intent phrases (ordered longer to shorter for best matching)
    r"i would like to learn about",
    r"i would like to learn",
    r"i'd like to learn about",
    r"i'd like to learn",
    r"i want to learn about",
    r"i want to learn",
    r"can you teach me about",
    r"can you teach me",
    r"help me learn about",
    r"help me learn",
    r"how do i learn about",
    r"how do i learn",
    r"how can i learn about",
    r"how can i learn",
    r"i'm interested in learning about",
    r"i'm interested in learning",
    r"i'm interested in",
    r"i am interested in learning about",
    r"i am interested in learning",
    r"i am interested in",
    r"looking for courses on",
    r"looking for courses in",
    r"any courses on",
    r"any courses for",
    r"any courses in",
    r"courses on",
    r"courses for",
    r"courses in",
    r"what are the recent",
    r"what are recent",
    r"what are the latest",
    r"tell me about",
    r"learn about",
    r"know about",
    r"show me",
    r"find me",
    r"search for",
    r"looking for",
    r"recommend",
    r"suggest",
    # Filler words at end
    r"please$",
    r"thanks$",
    r"thank you$",
    # Question marks
    r"\?$",
]

# Words to remove (common filler words that don't add search value)
FILLER_WORDS = [
    "certification",
    "certifications",
    "certificate",
    "course",
    "courses",
    "tutorial",
    "tutorials",
    "training",
    "class",
    "classes",
    "online",
    "free",
    "best",
    "good",
    "top",
    "latest",
    "recent",
    "new",
    "beginner",
    "advanced",
    "intermediate",
]

# Broader stopwords for better topic extraction
STOPWORDS = {
    "can",
    "you",
    "me",
    "please",
    "with",
    "about",
    "for",
    "some",
    "any",
    "show",
    "give",
    "find",
    "recommend",
    "suggest",
    "links",
    "link",
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "at",
    "how",
    "do",
    "i",
    "would",
    "like",
    "want",
    "looking",
    "search",
    "need",
    "get",
    "please",
    "hey",
    "hi",
    "hello",
}

# Prefer reputable learning/career domains when scoring results
PREFERRED_COURSE_DOMAINS = [
    "coursera.org",
    "edx.org",
    "udemy.com",
    "pluralsight.com",
    "udacity.com",
    "khanacademy.org",
    "codecademy.com",
    "datacamp.com",
    "freecodecamp.org",
    "linkedin.com/learning",
    "greatlearning.in",
    "simplilearn.com",
    "harvard.edu",
    "mit.edu",
    "stanford.edu",
    "youtube.com",
]

PREFERRED_JOB_DOMAINS = [
    "linkedin.com",
    "indeed.com",
    "naukri.com",
    "glassdoor.com",
    "timesofindia.com",
    "moneycontrol.com",
    "techcrunch.com",
    "economictimes.indiatimes.com",
]

NON_ASCII_THRESHOLD = 0.35


def _strip_urls(text: str) -> str:
    """Remove URLs to avoid polluting topic extraction."""
    return re.sub(r"https?://\S+", " ", text)


def _is_mostly_ascii(text: str) -> bool:
    """Filter out non-English results that often come back as noise."""
    if not text:
        return True
    non_ascii = sum(1 for ch in text if ord(ch) > 127)
    return non_ascii / max(len(text), 1) <= NON_ASCII_THRESHOLD


def _tokenize_keywords(text: str) -> list[str]:
    """Return lowercased keywords without common stopwords."""
    tokens = re.findall(r"[A-Za-z0-9#+\.]+", text.lower())
    keywords = [t for t in tokens if t and t not in STOPWORDS]
    return keywords


def _rank_results(
    results: list[dict],
    topic_keywords: list[str] | None,
    preferred_domains: list[str] | None,
) -> list[dict]:
    """Score results for relevance and dedupe by domain."""
    if topic_keywords is None:
        topic_keywords = []
    ranked: list[tuple[int, dict]] = []
    seen_domains: set[str] = set()

    for r in results:
        title = r.get("title", "") or ""
        snippet = r.get("snippet", "") or ""
        url = r.get("url", "") or ""
        combined = f"{title} {snippet}".lower()

        # Skip obvious junk
        if topic_keywords and not any(kw in combined for kw in topic_keywords):
            continue
        if not _is_mostly_ascii(combined):
            continue

        domain = urlparse(url).netloc.lower().replace("www.", "")
        if domain in seen_domains and domain:
            continue

        keyword_hits = sum(1 for kw in topic_keywords if kw in combined)
        score = keyword_hits * 3

        if preferred_domains and any(dom in domain for dom in preferred_domains):
            score += 4

        # Longer snippets with more context are generally better
        if len(snippet) > 80:
            score += 1

        ranked.append((score, r))
        if domain:
            seen_domains.add(domain)

    ranked.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in ranked]


def extract_topic(user_message: str) -> str:
    """
    Extract the actual topic/subject from a natural language user message.

    Examples:
        "I want to learn Python" → "Python"
        "Any courses on data science?" → "data science"
        "What are the recent certification courses in Unreal engine 5" → "Unreal engine 5"
        "help me learn machine learning please" → "machine learning"

    Args:
        user_message: The raw user message

    Returns:
        Extracted topic string, cleaned up for search
    """
    print(f"[TOPIC EXTRACTION] Input: '{user_message}'")

    # Start with the message
    topic = _strip_urls(user_message.strip())

    # Apply strip phrases (case insensitive)
    for phrase in STRIP_PHRASES:
        topic = re.sub(phrase, " ", topic, flags=re.IGNORECASE)

    # Remove filler words (but be careful not to remove if they ARE the topic)
    words = topic.split()

    # Only remove filler words if there are other meaningful words left
    meaningful_words = [w for w in words if w.lower() not in FILLER_WORDS]

    if meaningful_words:
        # Keep meaningful words
        topic = " ".join(meaningful_words)
    else:
        # All words were "filler" - they might actually be the topic
        # e.g., "courses" could mean the user wants to learn about course creation
        topic = " ".join(words)

    # Further clean and trim using stopwords
    keywords = _tokenize_keywords(topic)
    if keywords:
        topic = " ".join(keywords[:6])  # Keep it concise for search

    # Clean up extra whitespace
    topic = " ".join(topic.split())

    # If we ended up with empty string, use original message (fallback)
    if not topic.strip():
        topic = user_message.strip()

    print(f"[TOPIC EXTRACTION] Output: '{topic}'")
    return topic


def search_web(
    query: str,
    max_results: int = 3,
    topic_keywords: list[str] | None = None,
    preferred_domains: list[str] | None = None,
    timelimit: str | None = "y",
) -> list[dict]:
    """
    Search DuckDuckGo and return results.

    Args:
        query: Search query string
        max_results: Maximum number of results to return (default: 3)

    Returns:
        List of dicts with {title, url, snippet}
    """
    try:
        # Short pause to avoid hammering the free endpoint
        time.sleep(0.75)

        ddgs = DDGS()
        results = []

        # Fetch extra results so we can filter aggressively
        search_results = ddgs.text(
            keywords=query,
            max_results=max_results * 3,
            region="in-en",
            safesearch="moderate",
            timelimit=timelimit,
            backend="api",
        )

        for r in search_results:
            results.append(
                {
                    "title": (r.get("title") or "").strip(),
                    "url": (r.get("href") or "").strip(),
                    "snippet": (r.get("body") or "").strip(),
                }
            )

        ranked = _rank_results(results, topic_keywords, preferred_domains)
        filtered_results = ranked[:max_results] if ranked else results[:max_results]

        print(
            f"[SEARCH SUCCESS] Found {len(filtered_results)} filtered results (raw: {len(results)}) for: {query}"
        )
        return filtered_results

    except Exception as e:
        print(f"[SEARCH ERROR] {e}")
        return []


def search_courses(user_message: str) -> list[dict]:
    """
    Search for free courses on a topic.

    Args:
        user_message: The raw user message (topic will be extracted)

    Returns:
        List of course results with title, url, snippet
    """
    # Extract the actual topic from natural language
    topic = extract_topic(user_message)
    topic_keywords = _tokenize_keywords(topic)

    # Build a focused search query
    query = f"{topic} online course syllabus 2024"

    print(f"[SEARCH_COURSES] User said: '{user_message}'")
    print(f"[SEARCH_COURSES] Extracted topic: '{topic}'")
    print(f"[SEARCH_COURSES] Final query: '{query}'")

    results = search_web(
        query,
        max_results=3,
        topic_keywords=topic_keywords,
        preferred_domains=PREFERRED_COURSE_DOMAINS,
        timelimit="y",
    )

    # Fallback with a broader query if we got nothing useful
    if not results:
        fallback_query = f"{topic} best course certification online"
        print(f"[SEARCH_COURSES] Fallback query: '{fallback_query}'")
        results = search_web(
            fallback_query,
            max_results=3,
            topic_keywords=topic_keywords,
            preferred_domains=PREFERRED_COURSE_DOMAINS,
            timelimit=None,
        )

    return results


def search_jobs_news(user_message: str) -> list[dict]:
    """
    Search for job market news and hiring trends.

    Args:
        user_message: The raw user message (topic will be extracted)

    Returns:
        List of job market news with title, url, snippet
    """
    # Extract the actual topic from natural language
    topic = extract_topic(user_message)
    topic_keywords = _tokenize_keywords(topic)

    # Build a focused search query
    query = f"{topic} jobs India hiring trends 2024"

    print(f"[SEARCH_JOBS] User said: '{user_message}'")
    print(f"[SEARCH_JOBS] Extracted topic: '{topic}'")
    print(f"[SEARCH_JOBS] Final query: '{query}'")

    results = search_web(
        query,
        max_results=3,
        topic_keywords=topic_keywords,
        preferred_domains=PREFERRED_JOB_DOMAINS,
        timelimit="m",
    )

    if not results:
        fallback_query = f"{topic} career news India jobs"
        print(f"[SEARCH_JOBS] Fallback query: '{fallback_query}'")
        results = search_web(
            fallback_query,
            max_results=3,
            topic_keywords=topic_keywords,
            preferred_domains=PREFERRED_JOB_DOMAINS,
            timelimit=None,
        )

    return results
