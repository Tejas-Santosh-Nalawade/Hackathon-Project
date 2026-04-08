"""
Career Agent (GrowthGuru)
-------------------------
Specialized agent for career development and upskilling.
"""

from typing import Dict, Optional, List
from datetime import datetime, timedelta

from agents.base_agent import BaseAgent


# Keywords that trigger a live search for courses/jobs
COURSE_TRIGGER_KEYWORDS = [
    "course", "learn", "skill", "training", "certification", "tutorial",
    "how to", "study", "upskill", "resources", "where can i"
]
JOB_TRIGGER_KEYWORDS = [
    "job", "hiring", "salary", "market", "trend", "demand", "career",
    "interview", "resume", "promotion", "switch"
]


class CareerAgent(BaseAgent):
    """
    GrowthGuru - Career Development Assistant
    
    Tracks:
    - Skill interests
    - Career goals
    - Learning activities
    """
    
    def __init__(self, groq_client, model_priority, system_instruction: str):
        super().__init__(
            name="career",
            title="GrowthGuru",
            role_description="Your career guide — upskill, grow, advance your career",
            system_instruction=system_instruction,
            groq_client=groq_client,
            model_priority=model_priority
        )
        
        # Track career data
        self.skill_interests = []
        self.learning_activities = []
    
    def store_memory(
        self,
        user_message: str,
        agent_response: str,
        user_id: Optional[str] = None
    ) -> None:
        """Override to extract career insights."""
        super().store_memory(user_message, agent_response, user_id)
        
        # Track skill interests
        skill_keywords = ["learn", "skill", "course", "training", "career", "job", "promotion"]
        if any(keyword in user_message.lower() for keyword in skill_keywords):
            self.skill_interests.append(datetime.now())
        
        # Track learning activities
        learning_keywords = ["studying", "practicing", "completed", "certification"]
        if any(keyword in user_message.lower() for keyword in learning_keywords):
            self.learning_activities.append(datetime.now())

    def _build_search_context(self, user_message: str) -> str:
        """Run live search and format results as context for the LLM."""
        try:
            from search_utils import search_courses, search_jobs_news
        except ImportError:
            return ""

        msg_lower = user_message.lower()
        want_courses = any(k in msg_lower for k in COURSE_TRIGGER_KEYWORDS)
        want_jobs = any(k in msg_lower for k in JOB_TRIGGER_KEYWORDS)

        parts = []

        if want_courses:
            results = search_courses(user_message)
            if results:
                parts.append("=== LIVE COURSE SEARCH RESULTS ===")
                for r in results:
                    parts.append(f"- {r['title']}: {r['url']}\n  {r['snippet']}")

        if want_jobs:
            results = search_jobs_news(user_message)
            if results:
                parts.append("=== LIVE JOB MARKET NEWS ===")
                for r in results:
                    parts.append(f"- {r['title']}: {r['url']}\n  {r['snippet']}")

        return "\n".join(parts)

    def generate_response(
        self,
        user_message: str,
        user_id: Optional[str] = None,
        conversation_history: Optional[List] = None
    ) -> str:
        """Override to inject live search results before calling LLM."""
        conversation_history = conversation_history or []

        # Build memory context
        context = self.build_context(user_message, conversation_history, user_id=user_id)

        # Build live search context
        search_context = self._build_search_context(user_message)

        messages = [{"role": "system", "content": self.system_instruction}]

        if context:
            messages.append({"role": "system", "content": f"Context from memory:\n{context}"})

        if search_context:
            messages.append({
                "role": "system",
                "content": (
                    f"{search_context}\n\n"
                    "Use the above real-time search results to give specific, "
                    "up-to-date recommendations with actual links where relevant."
                )
            })

        for msg in conversation_history[-5:]:
            messages.append(msg)
        messages.append({"role": "user", "content": user_message})

        response_text = None
        for model in self.model_priority:
            try:
                response = self.groq_client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=600
                )
                response_text = response.choices[0].message.content
                break
            except Exception as e:
                print(f"Model {model} failed: {e}")
                continue

        if not response_text:
            response_text = "I'm having trouble responding right now. Please try again."

        self.store_memory(user_message, response_text, user_id)
        self.last_interaction = datetime.now()
        self.interaction_count += 1
        self._save_state()

        return response_text

    def calculate_metrics(self, user_id: Optional[str] = None) -> Dict:
        """Calculate career development metrics."""
        # Recent activity (last 30 days)
        month_ago = datetime.now() - timedelta(days=30)
        recent_interests = len([d for d in self.skill_interests if d > month_ago])
        recent_learning = len([d for d in self.learning_activities if d > month_ago])
        
        # Calculate growth score
        growth_score = min(50 + recent_interests * 10 + recent_learning * 15, 100)
        
        # Status
        if growth_score >= 80:
            status = "Actively growing"
        elif growth_score >= 60:
            status = "On the path"
        else:
            status = "Ready to start"
        
        return {
            "growth_score": round(growth_score, 1),
            "status": status,
            "skills_explored": recent_interests,
            "learning_activities": recent_learning,
            "total_interactions": self.interaction_count
        }
