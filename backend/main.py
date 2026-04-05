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
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from openai import OpenAI

from bots import get_bot, get_all_bots
from search_utils import search_courses, search_jobs_news

# Import agentic system components
from agents.agent_manager import AgentManager
from orchestrator.router import AgenticRouter
from orchestrator.dashboard import DashboardService

# Import authentication system
from auth import (
    UserRegistration,
    UserCredentials,
    SocialAuthRequest,
    AuthResponse,
    ProfileUpdateRequest,
    UserProfile,
    register_user,
    login_user,
    social_auth,
    update_profile,
    get_current_user,
    user_db,
)


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

# Initialize agentic system (v2 architecture)
agent_manager = AgentManager(groq_client=client, model_priority=MODEL_PRIORITY)
agentic_router = AgenticRouter()
dashboard_service = DashboardService(agent_manager=agent_manager)


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

            # DETAILED ERROR LOGGING
            print(f"\n{'='*60}")
            print(f"[ERROR] Model '{model}' FAILED for bot_id='{request.bot_id}'")
            print(f"[ERROR] Exception type: {error_type}")
            print(f"[ERROR] Full error: {e}")
            print(f"{'='*60}\n")

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

            # If it's not the last model, try the next one regardless
            if i < len(MODEL_PRIORITY) - 1:
                print(f"[MODEL] Trying next model...")
                continue

            # If we're on the last model, handle the error
            print(f"[ERROR] ALL MODELS FAILED for bot_id={request.bot_id}")

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
# V2 API Endpoints (Agentic Architecture)
# =============================================================================


class AgentChatRequest(BaseModel):
    """Request for direct agent interaction (v2)."""
    
    user_id: Optional[str] = Field(default=None, description="User identifier")
    message: str = Field(..., min_length=1, max_length=2000, description="User's message")
    history: Optional[list[ChatMessage]] = Field(default=[], description="Conversation history")


class AgentChatResponse(BaseModel):
    """Response from agent (v2)."""
    
    reply: str = Field(..., description="Agent's response")
    agent: str = Field(..., description="Agent that responded")
    memory_updated: bool = Field(..., description="Whether memory was updated")


class AgenticChatRequest(BaseModel):
    """Request for agentic auto-routing (v2)."""
    
    user_id: Optional[str] = Field(default=None, description="User identifier")
    message: str = Field(..., min_length=1, max_length=2000, description="User's message")
    history: Optional[list[ChatMessage]] = Field(default=[], description="Conversation history")


class AgenticChatResponse(BaseModel):
    """Response from agentic system (v2)."""
    
    reply: str = Field(..., description="Unified response")
    agents_activated: list[str] = Field(..., description="Agents that responded")
    routing_confidence: dict = Field(..., description="Confidence scores per agent")


@app.post(
    "/api/v2/agent/{agent_name}",
    response_model=AgentChatResponse,
    summary="Chat with specific agent (v2)",
    description="Direct interaction with a specific agent. Agent uses memory and context."
)
async def chat_with_agent(agent_name: str, request: AgentChatRequest):
    """
    Chat directly with a specific agent.
    
    The agent will:
    1. Recall relevant memories
    2. Generate contextual response
    3. Update its memory
    """
    # Get agent
    agent = agent_manager.get_agent(agent_name)
    
    if not agent:
        raise HTTPException(
            status_code=404,
            detail={
                "error": f"Agent '{agent_name}' not found. Available: wellness, planner, finance, safety, career",
                "code": "AGENT_NOT_FOUND"
            }
        )
    
    # Validate message
    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail={"error": "Message cannot be empty", "code": "EMPTY_MESSAGE"}
        )
    
    try:
        # Convert history to dict format
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history] if request.history else []
        
        # Generate response (agent handles memory automatically)
        response = agent.generate_response(
            user_message=request.message,
            user_id=request.user_id,
            conversation_history=history_dicts
        )
        
        return AgentChatResponse(
            reply=response,
            agent=agent_name,
            memory_updated=True
        )
    
    except Exception as e:
        import traceback
        print(f"\n{'='*60}")
        print(f"[ERROR] Agent '{agent_name}' chat failed:")
        print(f"[ERROR] {type(e).__name__}: {e}")
        traceback.print_exc()
        print(f"{'='*60}\n")
        raise HTTPException(
            status_code=500,
            detail={"error": f"Agent error: {str(e)}", "code": "AGENT_ERROR"}
        )


@app.post(
    "/api/v2/agentic-chat",
    response_model=AgenticChatResponse,
    summary="Agentic auto-routing chat (v2)",
    description="System automatically routes to appropriate agents based on message content"
)
async def agentic_chat(request: AgenticChatRequest):
    """
    Smart chat that automatically activates relevant agents.
    
    The system will:
    1. Analyze user message
    2. Route to appropriate agent(s)
    3. Collect responses
    4. Return unified reply
    """
    # Validate message
    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail={"error": "Message cannot be empty", "code": "EMPTY_MESSAGE"}
        )
    
    try:
        # Route to appropriate agents
        routing_scores = agentic_router.route_with_scores(request.message)
        active_agents = agentic_router.route(request.message, threshold=0.5)
        
        # Convert history
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history] if request.history else []
        
        # Collect responses from active agents
        responses = []
        for agent_name in active_agents[:2]:  # Limit to top 2 agents
            agent = agent_manager.get_agent(agent_name)
            if agent:
                response = agent.generate_response(
                    user_message=request.message,
                    user_id=request.user_id,
                    conversation_history=history_dicts
                )
                responses.append(f"**{agent.title}**: {response}")
        
        # Unify responses
        if len(responses) > 1:
            unified_reply = "\n\n".join(responses)
        elif responses:
            unified_reply = responses[0]
        else:
            unified_reply = "I'm not sure how to help with that. Could you rephrase?"
        
        return AgenticChatResponse(
            reply=unified_reply,
            agents_activated=active_agents,
            routing_confidence=routing_scores
        )
    
    except Exception as e:
        print(f"Error in agentic chat: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to generate response", "code": "ROUTING_ERROR"}
        )


@app.get(
    "/api/v2/dashboard",
    summary="Get personalized dashboard (v2)",
    description="Aggregated intelligence from all agents"
)
async def get_dashboard(user_id: Optional[str] = None):
    """
    Get personalized dashboard powered by agent memory.
    
    Returns metrics from all agents:
    - Wellness score
    - Task progress
    - Savings goal
    - Safety alerts
    - Career growth
    """
    try:
        dashboard_data = dashboard_service.get_dashboard_data(user_id)
        return dashboard_data
    
    except Exception as e:
        print(f"Error generating dashboard: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to generate dashboard", "code": "DASHBOARD_ERROR"}
        )


@app.get(
    "/api/v2/greeting",
    summary="Get personalized greeting (v2)",
    description="Dynamic greeting with agent insights"
)
async def get_greeting(user_id: Optional[str] = None):
    """
    Get personalized greeting based on agent intelligence.
    
    Returns greeting with insights like:
    - "FitHer noticed your stress is improving"
    - "PlanPal helped you complete 8 tasks today"
    """
    try:
        greeting_data = dashboard_service.get_personalized_greeting(user_id)
        return greeting_data
    
    except Exception as e:
        print(f"Error generating greeting: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to generate greeting", "code": "GREETING_ERROR"}
        )


@app.get(
    "/api/v2/agent/{agent_name}/summary",
    summary="Get agent summary (v2)",
    description="Get status and memory summary for specific agent"
)
async def get_agent_summary(agent_name: str):
    """
    Get detailed summary of agent's state and memory.
    
    Returns:
    - Interaction count
    - Last interaction time
    - Memory size
    - Recent memories
    """
    try:
        summary = dashboard_service.get_agent_status(agent_name)
        
        if "error" in summary:
            raise HTTPException(
                status_code=404,
                detail={"error": summary["error"], "code": "AGENT_NOT_FOUND"}
            )
        
        return summary
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting agent summary: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to get agent summary", "code": "SUMMARY_ERROR"}
        )


@app.get(
    "/api/v2/agents",
    summary="List all agents (v2)",
    description="Get summaries of all available agents"
)
async def list_agents():
    """
    Get summaries of all agents in the system.
    
    Returns status, memory count, and activity for each agent.
    """
    try:
        summaries = agent_manager.get_agent_summaries()
        return summaries
    
    except Exception as e:
        print(f"Error listing agents: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to list agents", "code": "LIST_ERROR"}
        )

# =============================================================================
# Authentication Endpoints
# =============================================================================

@app.post(
    "/api/auth/register",
    response_model=AuthResponse,
    summary="Register new user",
    description="Create new user account with email and password"
)
async def register(registration: UserRegistration):
    """
    Register a new user account.
    
    Returns JWT token and user profile on success.
    """
    return register_user(registration)


@app.post(
    "/api/auth/login",
    response_model=AuthResponse,
    summary="Login user",
    description="Login with email and password, returns JWT token"
)
async def login(credentials: UserCredentials):
    """
    Login existing user.
    
    Returns JWT token and user profile on success.
    """
    return login_user(credentials)


@app.post(
    "/api/auth/social",
    response_model=AuthResponse,
    summary="Google authentication",
    description="Login or register with Google OAuth"
)
async def social_login(social_request: SocialAuthRequest):
    """
    Authenticate with Google OAuth.
    
    Verifies Google ID token and creates account if needed.
    Returns JWT token and user profile.
    """
    return social_auth(social_request)


@app.get(
    "/api/auth/profile",
    response_model=UserProfile,
    summary="Get current user profile",
    description="Get profile of authenticated user (requires JWT token)"
)
async def get_profile(user: UserProfile = Depends(get_current_user)):
    """
    Get current user's profile.
    
    Requires: Authorization header with Bearer token
    """
    return user


@app.put(
    "/api/auth/profile",
    response_model=UserProfile,
    summary="Update user profile",
    description="Update name or preferences (requires JWT token)"
)
async def update_user_profile(
    updates: ProfileUpdateRequest,
    user: UserProfile = Depends(get_current_user)
):
    """
    Update current user's profile.
    
    Requires: Authorization header with Bearer token
    """
    return update_profile(user, updates)


@app.post(
    "/api/auth/logout",
    summary="Logout user",
    description="Logout current user (client should discard token)"
)
async def logout():
    """
    Logout user.
    
    Since JWT is stateless, client should discard the token.
    This endpoint is here for API completeness.
    """
    return {"message": "Logged out successfully. Please discard your token."}


# =============================================================================
# Dashboard Endpoints (user-specific)
# =============================================================================

@app.get(
    "/api/dashboard",
    summary="Get personalized dashboard",
    description="Get user-specific dashboard data from all agents"
)
async def get_dashboard(user: UserProfile = Depends(get_current_user)):
    """
    Get personalized dashboard data for authenticated user.
    
    Returns agent metrics specific to this user.
    """
    try:
        dashboard_data = dashboard_service.get_dashboard_data(user_id=user.user_id)
        dashboard_data["user_name"] = user.name
        dashboard_data["user_id"] = user.user_id
        return dashboard_data
    except Exception as e:
        print(f"Dashboard error: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to load dashboard", "code": "DASHBOARD_ERROR"}
        )


@app.get(
    "/api/greeting",
    summary="Get personalized greeting",
    description="Get personalized greeting with user name and agent insights"
)
async def get_greeting(user: UserProfile = Depends(get_current_user)):
    """
    Get personalized greeting for authenticated user.
    
    Returns greeting with user's actual name and agent insights.
    """
    try:
        greeting_data = dashboard_service.get_personalized_greeting(user_id=user.user_id)
        
        # Replace generic name with actual user name
        time_of_day = greeting_data.get("time_of_day", "afternoon")
        greeting_texts = {
            "morning": f"Good morning, {user.name}",
            "afternoon": f"Good afternoon, {user.name}",
            "evening": f"Good evening, {user.name}"
        }
        greeting_data["greeting"] = greeting_texts.get(time_of_day, f"Hello, {user.name}")
        greeting_data["user_name"] = user.name
        
        return greeting_data
    except Exception as e:
        print(f"Greeting error: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to load greeting", "code": "GREETING_ERROR"}
        )


# =============================================================================
# Protected Agent Endpoints (with user tracking)
# =============================================================================

@app.post(
    "/api/v2/agent/{agent_name}/protected",
    summary="Chat with agent (protected)",
    description="Send message to agent with user authentication"
)
async def chat_with_agent_protected(
    agent_name: str,
    request: AgenticChatRequest,
    user: UserProfile = Depends(get_current_user)
):
    """
    Chat with specific agent (requires authentication).
    
    Tracks user interactions for personalized experience.
    """
    try:
        # Get agent
        agent = agent_manager.get_agent(agent_name)
        if not agent:
            raise HTTPException(
                status_code=404,
                detail={"error": f"Agent '{agent_name}' not found", "code": "AGENT_NOT_FOUND"}
            )
        
        # Track interaction
        user_db.increment_agent_interaction(user.email, agent_name)
        
        # Generate response with memory
        reply = agent.generate_response(
            user_input=request.message,
            conversation_history=request.history or []
        )
        
        return {
            "agent": agent_name,
            "reply": reply,
            "memory_updated": True,
            "user_id": user.user_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in protected chat: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": f"Agent error: {str(e)}", "code": "AGENT_ERROR"}
        )

# =============================================================================
# Run (for development)
# =============================================================================

if __name__ == "__main__":
    import uvicorn

    print("🚀 Starting HerSpace Backend Server...")
    print("📍 API: http://127.0.0.1:8000")
    print("📖 Docs: http://127.0.0.1:8000/docs")
    print("🔐 Auth endpoints ready!")
    print("")
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
