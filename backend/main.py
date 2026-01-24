"""
AI Support Platform - Backend Server
-------------------------------------
FastAPI server wrapping Groq API for multi-bot chat.

Endpoints:
- GET  /               → Health check
- GET  /api/v1/bots    → List available bots
- POST /api/v1/chat    → Send message, get reply

Run with: uvicorn main:app --reload
"""

import os
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from openai import OpenAI

from bots import get_bot, get_all_bots
from search_utils import search_courses, search_jobs_news


# =============================================================================
# Configuration
# =============================================================================

# Load environment variables from .env file
load_dotenv()

# Get API key (required)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY not found. " "Create a .env file with: GROQ_API_KEY=your_key_here"
    )

# Configure Groq client using OpenAI SDK
client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=GROQ_API_KEY)

# Model priority list for automatic fallback (try in order)
# Total capacity: 16,400 requests/day with graceful degradation
MODEL_PRIORITY = [
    "llama-3.3-70b-versatile",  # 1,000/day - smartest, try first
    "qwen/qwen3-32b",  # 1,000/day - smart backup
    "llama-3.1-8b-instant",  # 14,400/day - fast fallback, always available
]


# =============================================================================
# FastAPI App Setup
# =============================================================================

app = FastAPI(
    title="AI Support Platform API",
    description="Backend API for multi-bot chat supporting working women in India",
    version="0.1.0",
)

# CORS middleware - allow all origins for MVP simplicity
# In production, restrict to specific frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Request/Response Models
# =============================================================================


class ChatMessage(BaseModel):
    """Single message in conversation history."""

    role: str = Field(..., description="Either 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    """Request body for POST /chat endpoint."""

    bot_id: str = Field(..., description="Bot identifier (e.g., 'wellness', 'finance')")
    message: str = Field(
        ..., min_length=1, max_length=2000, description="User's message"
    )
    history: Optional[list[ChatMessage]] = Field(
        default=[], description="Previous conversation turns (optional, default empty)"
    )


class ChatResponse(BaseModel):
    """Response body for POST /chat endpoint."""

    reply: str = Field(..., description="Bot's response")
    bot_id: str = Field(..., description="Bot that responded")
    search_results: Optional[list[dict]] = Field(
        default=None,
        description="Optional search results (used by GrowthGuru for courses/jobs)",
    )


class BotInfo(BaseModel):
    """Bot metadata for selector UI."""

    bot_id: str
    title: str
    description: str
    icon_emoji: str


class ErrorResponse(BaseModel):
    """Standard error response."""

    error: str = Field(..., description="Human-readable error message")
    code: str = Field(..., description="Machine-readable error code")


# =============================================================================
# Endpoints
# =============================================================================


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "women-support-ai-backend"}


@app.get(
    "/api/v1/bots",
    response_model=list[BotInfo],
    summary="List available bots",
    description="Returns metadata for all bots to populate the selector UI",
)
async def list_bots():
    """Return list of available bots for the selector UI."""
    return get_all_bots()


@app.post(
    "/api/v1/chat",
    response_model=ChatResponse,
    summary="Send a chat message",
    description="Send a message to a specific bot and receive a response",
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def chat(request: ChatRequest):
    """
    Process a chat message and return bot response.

    Steps:
    1. Validate bot_id exists
    2. Validate message is not empty
    3. Build conversation with system instruction + history + new message
    4. Call Gemini API
    5. Return response

    Errors:
    - 400: Invalid bot_id or empty message
    - 500: Gemini API failure or internal error
    """

    # --- Validate bot_id ---
    bot = get_bot(request.bot_id)
    if not bot:
        raise HTTPException(
            status_code=400,
            detail={
                "error": f"Invalid bot_id: '{request.bot_id}'. Valid options: wellness, planner, speakup, upskill, finance",
                "code": "INVALID_BOT_ID",
            },
        )

    # --- Validate message ---
    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail={"error": "Message cannot be empty", "code": "EMPTY_MESSAGE"},
        )

    # --- Web Search for GrowthGuru (upskill bot only) ---
    search_results = None
    enhanced_message = request.message

    if request.bot_id == "upskill":
        # Keywords that trigger search
        search_triggers = [
            "course",
            "learn",
            "certification",
            "skill",
            "job",
            "hiring",
            "career switch",
            "upskill",
            "training",
        ]

        if any(trigger in request.message.lower() for trigger in search_triggers):
            # Determine search type based on keywords
            course_keywords = [
                "course",
                "learn",
                "certification",
                "skill",
                "training",
                "tutorial",
            ]

            if any(word in request.message.lower() for word in course_keywords):
                search_results = search_courses(request.message)
            else:
                search_results = search_jobs_news(request.message)

            # Add search context to message if we got results
            if search_results:
                search_context = (
                    "\n\nRECENT SEARCH RESULTS (reference these if relevant):\n"
                )
                for i, r in enumerate(search_results, 1):
                    search_context += (
                        f"{i}. {r['title']} - {r['url']}\n   {r['snippet'][:100]}...\n"
                    )
                enhanced_message = request.message + search_context

    # --- Build conversation messages for Groq ---
    # Build messages array: system message + history + new user message
    messages = [{"role": "system", "content": bot["system_instruction"]}]

    # Add conversation history if provided
    if request.history:
        for msg in request.history:
            messages.append({"role": msg.role, "content": msg.content})

    # Add current user message (enhanced with search results if available)
    messages.append({"role": "user", "content": enhanced_message})

    # --- Call Groq API with automatic model fallback ---
    last_exception = None

    for i, model in enumerate(MODEL_PRIORITY):
        try:
            # Log which model we're trying
            if i == 0:
                print(f"[MODEL] Using {model}")
            else:
                print(f"[MODEL] Fallback to {model}")

            response = client.chat.completions.create(
                model=model, messages=messages, max_tokens=500, temperature=0.7
            )

            # Extract reply from response
            reply_text = response.choices[0].message.content

            return ChatResponse(
                reply=reply_text, bot_id=request.bot_id, search_results=search_results
            )

        except Exception as e:
            last_exception = e
            error_type = type(e).__name__
            error_msg = str(e).lower()

            # Check if it's a 429 rate limit error
            is_rate_limit = (
                "429" in error_msg
                or "rate" in error_msg
                or "limit" in error_msg
                or "quota" in error_msg
            )

            # If rate limited and we have more models to try, continue to next model
            if is_rate_limit and i < len(MODEL_PRIORITY) - 1:
                print(f"[MODEL] Rate limit hit on {model}, trying next model...")
                continue

            # If not a rate limit error, or it's the last model, handle the error
            print(f"[ERROR] Groq API failed for bot_id={request.bot_id}: {error_type}")

            # Content moderation errors
            if "content" in error_msg and "filter" in error_msg:
                raise HTTPException(
                    status_code=400,
                    detail={
                        "error": "Your message couldn't be processed. Please try rephrasing.",
                        "code": "CONTENT_BLOCKED",
                    },
                )

            # If we're on the last model and it's a rate limit, return specific error
            if is_rate_limit:
                raise HTTPException(
                    status_code=500,
                    detail={
                        "error": "Service is temporarily busy. Please try again in a moment.",
                        "code": "RATE_LIMITED",
                    },
                )

            # Generic API error
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "Something went wrong while processing your message. Please try again.",
                    "code": "API_ERROR",
                },
            )


# =============================================================================
# Run (for development)
# =============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
