# 🎨 HerSpace Architecture Diagrams

## 1️⃣ System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
│                   (React + TypeScript + Vite)                       │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐              │
│  │  Dashboard  │  │  Chat Panel  │  │ Bot Selector │              │
│  │  (Agentic)  │  │   (Live)     │  │  (5 Agents) │              │
│  └─────────────┘  └──────────────┘  └─────────────┘              │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ REST API Calls
                       │ (v2 Endpoints)
┌──────────────────────▼──────────────────────────────────────────────┐
│                       FASTAPI BACKEND                                │
│                     (Orchestration Layer)                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    ORCHESTRATOR                               │  │
│  │  ┌─────────────────┐         ┌──────────────────┐           │  │
│  │  │  Agentic Router │         │  Dashboard       │           │  │
│  │  │  (Intent        │────────▶│  Aggregator      │           │  │
│  │  │   Detection)    │         │  (Metrics)       │           │  │
│  │  └─────────────────┘         └──────────────────┘           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     AGENT MANAGER                             │  │
│  │                                                               │  │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │   │ Wellness │  │ Planner  │  │ Finance  │  │  Safety  │  │  │
│  │   │  Agent   │  │  Agent   │  │  Agent   │  │  Agent   │  │  │
│  │   │ (FitHer) │  │(PlanPal) │  │(PaisaWise)  │(SpeakUp) │  │  │
│  │   └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘  │  │
│  │         │             │             │             │         │  │
│  │   ┌─────▼──────┐ ┌────▼─────┐ ┌────▼─────┐ ┌────▼─────┐  │  │
│  │   │   Memory   │ │  Memory  │ │  Memory  │ │  Memory  │  │  │
│  │   │  (Vector)  │ │ (Vector) │ │ (Vector) │ │ (Vector) │  │  │
│  │   └────────────┘ └──────────┘ └──────────┘ └──────────┘  │  │
│  │                                                               │  │
│  │   ┌──────────┐                                               │  │
│  │   │  Career  │                                               │  │
│  │   │  Agent   │                                               │  │
│  │   │(GrowthGuru)                                              │  │
│  │   └─────┬────┘                                               │  │
│  │         │                                                     │  │
│  │   ┌─────▼─────┐                                              │  │
│  │   │  Memory   │                                              │  │
│  │   │ (Vector)  │                                              │  │
│  │   └───────────┘                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────────┐
│                    MEMORY SYSTEM                                     │
│                                                                      │
│  ┌──────────────────┐        ┌──────────────────┐                  │
│  │  Embedding       │        │  Vector Store    │                  │
│  │  Service         │───────▶│  (FAISS-like)    │                  │
│  │  (sentence-      │        │  Semantic Search │                  │
│  │   transformers)  │        └──────────────────┘                  │
│  └──────────────────┘                                               │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              PERSISTENT STORAGE (storage/)                    │  │
│  │                                                               │  │
│  │  wellness_memory.pkl  planner_memory.pkl  finance_memory.pkl │  │
│  │  safety_memory.pkl    career_memory.pkl                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────────┐
│                     GROQ LLM API                                     │
│                 (Llama 3.3 70B Versatile)                           │
│                  with Auto-Fallback                                  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ Agent Memory Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER MESSAGE                            │
│               "I feel stressed today"                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 EMBEDDING SERVICE                            │
│        (sentence-transformers: all-MiniLM-L6-v2)            │
│                                                              │
│  Text → 384-dimensional vector embedding                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              VECTOR MEMORY SEARCH                            │
│                                                              │
│  1. Calculate cosine similarity with stored embeddings      │
│  2. Retrieve top-k most relevant memories                   │
│  3. Filter by threshold (>0.6)                              │
│                                                              │
│  Result: [                                                   │
│    ("User stressed | Agent: breathing", similarity=0.89)    │
│    ("User tired | Agent: rest tips", similarity=0.76)       │
│  ]                                                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               CONTEXT ENRICHMENT                             │
│                                                              │
│  System Prompt + Relevant Memories + Current Message        │
│                                                              │
│  → LLM (Groq)                                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 AGENT RESPONSE                               │
│                                                              │
│  "I hear you. Based on our past talks, breathing           │
│   exercises helped you before. Let's try..."                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              MEMORY STORAGE                                  │
│                                                              │
│  Store: "User: stressed | Agent: breathing exercise"        │
│  Embedding: [0.234, -0.123, 0.456, ...]                    │
│  Metadata: {user_id, timestamp, agent: "wellness"}          │
│                                                              │
│  Persisted to: storage/wellness_memory.pkl                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3️⃣ Dashboard Data Flow

```
┌────────────────────────────────────────────────────────────┐
│                    USER OPENS APP                           │
└───────────────────────┬────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         FRONTEND: GET /api/v2/dashboard                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              DASHBOARD SERVICE                               │
│                                                              │
│  For each agent:                                             │
│    agent.calculate_metrics()                                 │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  WELLNESS AGENT                                      │   │
│  │  ├─ Count stress mentions (last 7 days)             │   │
│  │  ├─ Count positive activities                        │   │
│  │  └─ Calculate: 70 - (stress×5) + (positive×3)       │   │
│  │     Result: wellness_score = 85                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PLANNER AGENT                                       │   │
│  │  ├─ Count tasks mentioned today                      │   │
│  │  ├─ Count completed tasks                            │   │
│  │  └─ Calculate: done/total × 100                      │   │
│  │     Result: progress = 72.7%                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  FINANCE AGENT                                       │   │
│  │  ├─ Count savings discussions (last 30 days)         │   │
│  │  ├─ Count budget discussions                         │   │
│  │  └─ Calculate: 50 + (savings×5) + (budget×3)        │   │
│  │     Result: savings_goal = 72.5%                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  SAFETY AGENT                                        │   │
│  │  ├─ Count safety concerns (last 7 days)              │   │
│  │  └─ Determine priority level                         │   │
│  │     Result: alerts = 0, status = "All clear"        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  CAREER AGENT                                        │   │
│  │  ├─ Count skill interests (last 30 days)             │   │
│  │  ├─ Count learning activities                        │   │
│  │  └─ Calculate: 50 + (interests×10) + (learning×15)  │   │
│  │     Result: growth_score = 78                        │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              UNIFIED DASHBOARD RESPONSE                      │
│                                                              │
│  {                                                           │
│    "wellness": { "score": 85, "trend": "improving" },      │
│    "planner": { "tasks_done": 8, "tasks_total": 11 },      │
│    "finance": { "savings_goal": 72.5 },                    │
│    "safety": { "alerts": 0, "status": "All clear" },       │
│    "career": { "growth_score": 78 }                         │
│  }                                                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND RENDERS UI                             │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Wellness    │  │  Tasks      │  │  Savings    │        │
│  │   85/100    │  │   8/11      │  │   72.5%     │        │
│  │ 📈 Improving│  │  Almost     │  │  On track   │        │
│  │             │  │  there!     │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 4️⃣ Agentic Routing Flow

```
┌────────────────────────────────────────────────────────────┐
│         USER MESSAGE (Free-form)                            │
│    "I'm stressed about work and worried about money"       │
└───────────────────────┬────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              AGENTIC ROUTER                                  │
│         (Intent Detection Engine)                            │
│                                                              │
│  Pattern Matching:                                           │
│  ├─ "stressed" → wellness (confidence: 0.85)                │
│  ├─ "work" → wellness/planner (confidence: 0.70/0.65)       │
│  ├─ "worried" → wellness (confidence: 0.60)                 │
│  └─ "money" → finance (confidence: 0.90)                    │
│                                                              │
│  Aggregated Scores:                                          │
│  ├─ wellness: 0.85 ✓ (above threshold 0.5)                 │
│  ├─ planner: 0.65 ✓ (above threshold 0.5)                  │
│  └─ finance: 0.90 ✓ (above threshold 0.5)                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         ACTIVATE TOP 2 AGENTS                                │
│         (Limit to avoid overwhelming user)                   │
│                                                              │
│    Selected: wellness (0.85), finance (0.90)                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ├──────────────┬──────────────────────┐
                        ▼              ▼                      │
           ┌────────────────┐  ┌────────────────┐            │
           │ WELLNESS AGENT │  │ FINANCE AGENT  │            │
           │   (FitHer)     │  │  (PaisaWise)   │            │
           └────────┬───────┘  └────────┬───────┘            │
                    │                   │                     │
                    ▼                   ▼                     │
           ┌────────────────┐  ┌────────────────┐            │
           │ Recall memory  │  │ Recall memory  │            │
           │ Generate reply │  │ Generate reply │            │
           │ Store memory   │  │ Store memory   │            │
           └────────┬───────┘  └────────┬───────┘            │
                    │                   │                     │
                    └──────────┬────────┘                     │
                               ▼                              │
┌─────────────────────────────────────────────────────────────┐
│              UNIFIED RESPONSE                                │
│                                                              │
│  **FitHer**: "I hear the stress in your message.           │
│              Let's try breathing exercises..."              │
│                                                              │
│  **PaisaWise**: "Money worries are valid. Let's review     │
│                  your budget together..."                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              RETURN TO USER                                  │
│                                                              │
│  {                                                           │
│    "reply": "**FitHer**: ...\n\n**PaisaWise**: ...",       │
│    "agents_activated": ["wellness", "finance"],             │
│    "routing_confidence": {"wellness": 0.85, "finance": 0.90}│
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 5️⃣ Complete User Journey

```
DAY 1
═════
User: "I feel exhausted from work"
  ↓
Wellness Agent:
  • Stores: "exhaustion + work"
  • Responds: "Rest is important..."
  • Wellness Score: 70 → 65
  ↓
Dashboard updates automatically

───────────────────────────────────────

DAY 3
═════
User: "I tried yoga yesterday, felt better"
  ↓
Wellness Agent:
  • Recalls: "User was exhausted 2 days ago"
  • Stores: "yoga + improvement"
  • Responds: "Great! Keep it up..."
  • Wellness Score: 65 → 75
  ↓
Dashboard shows: "Trend: Improving 📈"

───────────────────────────────────────

DAY 5
═════
User opens app
  ↓
Dashboard loads:
  • Wellness: 75/100 (Improving)
  • Tasks: 8/11 (Almost there)
  • Savings: 72% (On track)
  ↓
Personalized Greeting:
  "Good afternoon, Priya 💜
   FitHer noticed your wellness improving this week!"

───────────────────────────────────────

DAY 7
═════
User: "Stressed again. Need to save for scooter"
  ↓
Agentic Router activates:
  • Wellness Agent (stress)
  • Finance Agent (savings)
  ↓
Both respond simultaneously
  ↓
Dashboard updates:
  • Wellness: 75 → 70 (stress impact)
  • Savings goal gets mentioned
  ↓
System learns: User's financial goal = scooter
```

---

## 6️⃣ Data Storage Structure

```
storage/
├── wellness_memory.pkl
│   ├─ MemoryEntry[0]:
│   │    content: "User: stressed | Agent: breathing"
│   │    embedding: [0.234, -0.123, ...]
│   │    timestamp: 2026-01-25T10:30:00
│   │    metadata: {user_id: "u123", agent: "wellness"}
│   │
│   ├─ MemoryEntry[1]:
│   │    content: "User: yoga helped | Agent: great progress"
│   │    embedding: [0.123, 0.456, ...]
│   │    timestamp: 2026-01-26T18:00:00
│   │    metadata: {user_id: "u123", agent: "wellness"}
│   │
│   └─ embeddings_matrix: numpy array (N × 384)
│
├── planner_memory.pkl
├── finance_memory.pkl
├── safety_memory.pkl
└── career_memory.pkl
```

---

## 📊 Metrics Calculation Formulas

### Wellness Score
```
Base: 70
Adjustments:
  - Recent stress mentions × 5 (max -30)
  + Positive activities × 3 (max +30)
  
Range: 0-100

Example:
  70 - (3 stress × 5) + (5 activities × 3)
  = 70 - 15 + 15
  = 70 (stable)
```

### Task Progress
```
tasks_done / tasks_total × 100

Status mapping:
  ≥80% → "Almost there!"
  ≥50% → "Good progress"
  <50% → "Let's plan"
```

### Savings Goal
```
Base: 50
Adjustments:
  + Savings discussions × 5
  + Budget discussions × 3
  
Cap: 99% (never quite done!)
```

### Career Growth
```
Base: 50
Adjustments:
  + Skill interests × 10
  + Learning activities × 15
  
Range: 0-100
```

---

**Use these diagrams in presentations, documentation, or demo explanations! 🎨**
