# 🔷 HerSpace - Agentic AI Architecture

**Complete System Documentation & Implementation Guide**

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Agent System](#agent-system)
4. [Data Flow](#data-flow)
5. [API Reference](#api-reference)
6. [Frontend Integration](#frontend-integration)
7. [Installation & Setup](#installation--setup)
8. [Demo Script](#demo-script)
9. [Technical Highlights](#technical-highlights)

---

## 🎯 System Overview

### What is HerSpace?

**HerSpace is an agentic AI support platform where multiple autonomous AI agents continuously learn about a working woman's life and collaboratively power a personalized dashboard and guidance system.**

### Key Innovation

❌ **Not a Chatbot** → Multiple agents remember, learn, and collaborate  
✅ **Living System** → Dashboard reflects real agent intelligence  
✅ **Autonomous** → Each agent operates independently with own memory  
✅ **Personalized** → Metrics derived from continuous learning, not static data  

### The Transformation

| Old System | New Agentic System |
|------------|-------------------|
| User selects bot → One-time response | User interacts naturally → Agents learn |
| No memory across sessions | Long-term vector memory per agent |
| Dashboard is static/mocked | Dashboard powered by agent intelligence |
| No personalization | Continuous personalization |

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Frontend      │  React + TypeScript + Vite
│   (Web App)     │
└────────┬────────┘
         │ REST APIs (v2)
         │
┌────────▼────────┐
│   FastAPI       │  API Gateway + Orchestration
│   Backend       │
└────────┬────────┘
         │
┌────────▼─────────────────────────────────┐
│        Agentic Core                       │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Wellness │  │ Planner  │  │ Finance │ │
│  │  Agent   │  │  Agent   │  │  Agent  │ │
│  │ (FitHer) │  │(PlanPal) │  │(PaisaWise)│
│  └──────────┘  └──────────┘  └─────────┘ │
│  ┌──────────┐  ┌──────────┐              │
│  │  Safety  │  │  Career  │              │
│  │  Agent   │  │  Agent   │              │
│  │(SpeakUp) │  │(GrowthGuru)             │
│  └──────────┘  └──────────┘              │
└────────┬─────────────────────────────────┘
         │
┌────────▼────────────────┐
│  Vector Memory Store    │  FAISS + Embeddings
│  (Per-Agent Storage)    │
└─────────────────────────┘
         │
┌────────▼────────────────┐
│   Groq LLM API          │  Llama 3.3 70B
│   (Inference)           │
└─────────────────────────┘
```

### Directory Structure

```
backend/
├── main.py                      # FastAPI app + v2 routes
├── bots.py                      # Bot registry (system prompts)
├── requirements.txt             # Dependencies
│
├── agents/                      # Agent implementations
│   ├── base_agent.py           # Base agent class
│   ├── agent_manager.py        # Agent initialization
│   ├── wellness_agent.py       # FitHer (wellness)
│   ├── planner_agent.py        # PlanPal (time management)
│   ├── finance_agent.py        # PaisaWise (finance)
│   ├── safety_agent.py         # SpeakUp (safety)
│   └── career_agent.py         # GrowthGuru (career)
│
├── memory/                      # Memory system
│   ├── embedding.py            # Text-to-vector conversion
│   └── vector_store.py         # FAISS-based memory
│
├── orchestrator/                # Coordination layer
│   ├── router.py               # Intent detection & routing
│   └── dashboard.py            # Dashboard aggregation
│
└── storage/                     # Persisted agent memories
    ├── wellness_memory.pkl
    ├── planner_memory.pkl
    ├── finance_memory.pkl
    ├── safety_memory.pkl
    └── career_memory.pkl
```

---

## 🤖 Agent System

### Agent Architecture

Each agent is **autonomous** with:

1. **Identity** → Role, title, description
2. **Memory** → Vector store for semantic recall
3. **Intelligence** → System prompt + LLM
4. **Metrics** → Domain-specific calculations
5. **Learning** → Continuous memory updates

### The 5 Agents

| Agent | Name | Role | Tracks |
|-------|------|------|--------|
| 💪 Wellness | FitHer | Fitness & mental health | Stress, mood, activities |
| 📅 Planner | PlanPal | Time & task management | Tasks, deadlines, productivity |
| 💰 Finance | PaisaWise | Financial planning | Savings, budgets, goals |
| 🛡️ Safety | SpeakUp | Safety & support | Alerts, concerns, harassment |
| 🚀 Career | GrowthGuru | Career growth | Skills, courses, jobs |

### How Agents Learn

```python
User: "I'm stressed about work"
        ↓
Wellness Agent:
1. Recalls past stress mentions
2. Generates empathetic response
3. Stores: "User: stressed | Agent: suggested breathing"
4. Updates wellness score: -5 points
        ↓
Dashboard automatically reflects change
```

### Agent Metrics (Examples)

**Wellness Agent:**
```python
wellness_score = 70 (base)
  - (stress_mentions × 5)  # Penalty for stress
  + (positive_activities × 3)  # Bonus for wellness
  = Final score (0-100)
```

**Planner Agent:**
```python
tasks_done = 8
tasks_total = 11
progress = (8/11) × 100 = 72.7%
status = "Almost there!"
```

**Finance Agent:**
```python
savings_progress = 50 (base)
  + (savings_discussions × 5)
  + (budget_discussions × 3)
  = Final progress (0-99%)
```

---

## 🔄 Data Flow

### User Journey Flow

```
1️⃣ User Opens App
   Frontend → GET /api/v2/dashboard
   Backend → Aggregates all agent metrics
   UI → Renders live dashboard

2️⃣ User Chats with Agent
   User types: "I feel exhausted"
   Frontend → POST /api/v2/agent/wellness
   
   Wellness Agent:
   ├─ Recalls: "User mentioned exhaustion twice this week"
   ├─ Generates: "I hear you. Let's find 10 min for rest..."
   └─ Stores: New memory with embedding
   
   Response → Frontend updates UI

3️⃣ Dashboard Auto-Updates
   Next dashboard fetch →
   Wellness score adjusted based on new memory
   UI shows: "Wellness: 82/100 (improving ↗️)"
```

### Memory System Flow

```
User Message
     ↓
Embedding Service (sentence-transformers)
     ↓
Vector Embedding (384-dim)
     ↓
Stored in Agent's Memory (FAISS)
     ↓
Later: Semantic search recalls relevant memories
```

---

## 📡 API Reference

### V2 Endpoints (Agentic)

#### 1. Get Dashboard
```http
GET /api/v2/dashboard
```

**Response:**
```json
{
  "wellness": {
    "score": 85,
    "status": "Feeling great",
    "trend": "improving",
    "agent": "FitHer"
  },
  "planner": {
    "tasks_done": 8,
    "tasks_total": 11,
    "progress": 72.7,
    "status": "Almost there!",
    "agent": "PlanPal"
  },
  "finance": {
    "savings_goal": 72.5,
    "status": "On track",
    "agent": "PaisaWise"
  },
  "safety": {
    "alerts": 0,
    "priority": "low",
    "status": "All clear",
    "agent": "SpeakUp"
  },
  "career": {
    "growth_score": 78,
    "status": "Actively growing",
    "agent": "GrowthGuru"
  }
}
```

#### 2. Chat with Agent
```http
POST /api/v2/agent/{agent_name}
```

**Request:**
```json
{
  "user_id": "u123",
  "message": "I need help managing my time",
  "history": []
}
```

**Response:**
```json
{
  "reply": "I hear you! Let's break down your day...",
  "agent": "planner",
  "memory_updated": true
}
```

#### 3. Agentic Auto-Routing
```http
POST /api/v2/agentic-chat
```

**Request:**
```json
{
  "message": "I'm stressed and worried about money"
}
```

**Response:**
```json
{
  "reply": "**FitHer**: Let's address that stress...\n\n**PaisaWise**: Let's look at your budget...",
  "agents_activated": ["wellness", "finance"],
  "routing_confidence": {
    "wellness": 0.85,
    "finance": 0.75
  }
}
```

#### 4. Get Personalized Greeting
```http
GET /api/v2/greeting
```

**Response:**
```json
{
  "greeting": "Good afternoon, Priya",
  "insights": [
    "FitHer noticed your stress levels are improving this week 💜",
    "PlanPal helped you complete 8 tasks today!"
  ],
  "time_of_day": "afternoon"
}
```

#### 5. Agent Summary
```http
GET /api/v2/agent/{agent_name}/summary
```

**Response:**
```json
{
  "name": "wellness",
  "title": "FitHer",
  "memory_count": 47,
  "last_interaction": "2026-01-27T14:30:00",
  "interaction_count": 23,
  "status": "active",
  "recent_memories": [
    {
      "content": "User: stressed | Agent: breathing exercise",
      "timestamp": "2026-01-27T14:30:00"
    }
  ]
}
```

---

## 💻 Frontend Integration

### Import New APIs

```typescript
import {
  fetchDashboard,
  fetchGreeting,
  chatWithAgent,
  type DashboardData
} from "@/lib/api"
```

### Use Agentic Dashboard Component

```tsx
import { AgenticDashboard } from "@/components/agentic-dashboard"

function HomePage() {
  return <AgenticDashboard />
}
```

### The Component

- ✅ Fetches live data from `/api/v2/dashboard`
- ✅ Displays personalized greeting
- ✅ Shows agent-powered metrics
- ✅ Auto-refreshes on interaction
- ✅ Fallback to mock data if offline

---

## 🚀 Installation & Setup

### 1. Install Backend Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

**New dependencies added:**
- `sentence-transformers` → Text embeddings
- `numpy` → Vector operations

### 2. Start Backend

```powershell
cd backend
python -m uvicorn main:app --reload
```

Backend runs on: `http://localhost:8000`

### 3. Test v2 APIs

```powershell
# Test dashboard
curl http://localhost:8000/api/v2/dashboard

# Test greeting
curl http://localhost:8000/api/v2/greeting

# Test agent chat
curl -X POST http://localhost:8000/api/v2/agent/wellness \
  -H "Content-Type: application/json" \
  -d '{"message": "I feel tired"}'
```

### 4. Start Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🎬 Demo Script (For Judges)

### Opening Statement

> "HerSpace uses an agentic AI architecture where each domain assistant operates as an independent learning agent with its own vector memory. These agents continuously analyze user interactions, update long-term memory, and collectively power a personalized dashboard that evolves over time."

### Live Demo Flow

1. **Show Dashboard**
   - "Notice these metrics aren't hardcoded—they're calculated from agent memory"
   - Point out: Wellness score, task progress, savings goal

2. **Interact with Agent**
   - Chat with FitHer: "I've been feeling stressed this week"
   - Show response with contextual recall

3. **Show Dashboard Update**
   - Refresh dashboard
   - "See how the wellness score adjusted? That's the agent's memory at work"

4. **Show Agent Memory**
   - Call `/api/v2/agent/wellness/summary`
   - "The agent remembers our conversation"

5. **Show Auto-Routing**
   - Type: "I'm stressed and need to save money"
   - Both Wellness + Finance agents respond

### Key Talking Points

✅ **Multi-Agent System** → Not one chatbot, but 5 specialized agents  
✅ **Vector Memory** → Semantic search using embeddings  
✅ **Living Dashboard** → Metrics derived from agent intelligence  
✅ **Autonomous Learning** → Each agent independently learns  
✅ **Scalable** → Add new agents without rewriting code  

---

## 🔥 Technical Highlights (For Technical Judges)

### 1. Vector Memory Architecture

```python
# Semantic recall using FAISS-like similarity search
query_embedding = embed("I feel tired")
memories = memory_store.search(query_embedding, top_k=5, threshold=0.6)
# Returns: [(memory_1, 0.89), (memory_2, 0.76), ...]
```

### 2. Agent Autonomy

- Each agent has **isolated memory**
- **No cross-contamination** of data
- **Parallel processing** capability
- **Stateful across sessions**

### 3. Intent-Based Routing

```python
router.route("I'm stressed about work and money")
# Returns: ["wellness", "finance"]
# Activates multiple agents automatically
```

### 4. Metric Derivation

Dashboard metrics are **computed, not stored**:

```python
def calculate_wellness_score():
    recent_stress = count_stress_mentions(last_7_days)
    positive_activities = count_wellness_activities(last_7_days)
    score = 70 - (recent_stress × 5) + (positive_activities × 3)
    return clamp(score, 0, 100)
```

### 5. Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + TypeScript | Type-safe, component-based |
| Backend | FastAPI | Async, fast, modern Python |
| AI Inference | Groq (Llama 3.3 70B) | Fast, capable LLM |
| Embeddings | sentence-transformers | Local, fast, no API costs |
| Vector Store | Custom FAISS-like | Simple, effective, file-based |
| Memory | Pickle (file-based) | Persistent, simple, portable |

---

## 🎯 What Makes This "Agentic"?

### Not Agentic ❌
- One bot per conversation
- No memory
- Static responses
- Hardcoded dashboard

### Truly Agentic ✅
- **Independent agents** with own goals
- **Long-term memory** that persists
- **Semantic recall** of past context
- **Autonomous decision-making** (routing)
- **Emergent behavior** from agent collaboration
- **Continuous learning** without retraining

---

## 📈 Future Enhancements

1. **Multi-User Support** → Per-user memory isolation
2. **Agent Collaboration** → Agents consult each other
3. **Proactive Agents** → Agents initiate conversations
4. **Emotion Detection** → Deeper sentiment analysis
5. **Voice Integration** → Audio interactions
6. **Mobile App** → React Native companion

---

## 🏆 Hackathon Advantages

### Why Judges Will Love This

✅ **Novel Architecture** → Not a typical chatbot  
✅ **Technical Depth** → Vector memory, multi-agent, routing  
✅ **Real Problem** → Supports working women in India  
✅ **Production-Ready** → Persistent memory, error handling  
✅ **Scalable Design** → Easy to add agents  
✅ **Demo-Friendly** → Clear visual impact  

### Elevator Pitch (30 seconds)

> "HerSpace is a multi-agent AI platform where 5 autonomous agents—each with its own memory and expertise—learn about a working woman's life through conversations. Unlike chatbots that forget, our agents remember and power a living dashboard that reflects real intelligence. As she interacts, the system gets smarter, more personalized, and more helpful."

---

## 📞 Support

**Team:** HerSpace Dev Team  
**Contact:** [Your Contact]  
**Repo:** [GitHub URL]  
**Demo:** `http://localhost:5173`  
**API Docs:** `http://localhost:8000/docs`  

---

**Built with 💜 for working women everywhere**
