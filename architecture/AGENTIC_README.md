# 🔷 HerSpace - Agentic AI Implementation

## 🎯 Overview

**HerSpace is now a true agentic AI system** with 5 autonomous agents that learn, remember, and collaborate to support working women in India.

### What Changed

✅ **Multi-Agent Architecture** - 5 specialized agents with individual memory  
✅ **Vector Memory System** - Semantic search using embeddings  
✅ **Living Dashboard** - Metrics derived from agent intelligence  
✅ **Auto-Routing** - System intelligently activates relevant agents  
✅ **Persistent Learning** - Memory survives across sessions  

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[QUICK_START.md](QUICK_START.md)** | 5-minute setup guide |
| **[AGENTIC_ARCHITECTURE.md](AGENTIC_ARCHITECTURE.md)** | Complete technical documentation |
| **[ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md)** | Visual architecture diagrams |
| **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** | What changed & why |

---

## 🚀 Quick Start

### 1. Install Backend

```powershell
cd backend
.\setup-and-run.ps1
```

This will:
- Install dependencies (sentence-transformers, numpy, etc.)
- Create storage directory
- Start the backend server

### 2. Test APIs

Open a new terminal:

```powershell
cd backend
.\test-apis.ps1
```

This will test all 7 v2 endpoints.

### 3. Start Frontend

```powershell
cd frontend
npm run dev
```

---

## 🧪 Testing the System

### Quick API Tests

```powershell
# Dashboard
curl http://localhost:8000/api/v2/dashboard

# Greeting
curl http://localhost:8000/api/v2/greeting

# Chat with agent
curl -X POST http://localhost:8000/api/v2/agent/wellness `
  -H "Content-Type: application/json" `
  -d '{"message": "I feel stressed"}'
```

### Interactive API Docs

Open in browser: `http://localhost:8000/docs`

---

## 🏗️ Architecture

```
Frontend (React)
    ↓ REST APIs
FastAPI Backend
    ↓
Agentic Core (5 Agents)
    ↓
Vector Memory (FAISS)
    ↓
Groq LLM (Llama 3.3)
```

### The 5 Agents

| Agent | Name | Responsibility |
|-------|------|---------------|
| 💪 Wellness | FitHer | Health, fitness, stress |
| 📅 Planner | PlanPal | Time management, tasks |
| 💰 Finance | PaisaWise | Savings, budgeting |
| 🛡️ Safety | SpeakUp | Safety alerts, support |
| 🚀 Career | GrowthGuru | Skills, career growth |

---

## 🎬 Demo Script

### 1. Show Dashboard (1 min)
"These metrics come from agent memory, not hardcoded values"

### 2. Chat with Agent (2 min)
"Notice how the agent recalls past conversations using vector memory"

### 3. Show Dashboard Update (1 min)
"See how the wellness score changed after our conversation"

### 4. Show Auto-Routing (1 min)
"Multiple agents respond to complex queries automatically"

### 5. Explain Architecture (1 min)
"Multi-agent system with vector memory—not just a chatbot"

---

## 📡 Key API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v2/dashboard` | Get personalized dashboard |
| `GET /api/v2/greeting` | Get dynamic greeting with insights |
| `POST /api/v2/agent/{name}` | Chat with specific agent |
| `POST /api/v2/agentic-chat` | Auto-routing chat |
| `GET /api/v2/agent/{name}/summary` | Agent status & memory |
| `GET /api/v2/agents` | All agent summaries |

---

## 💻 Frontend Integration

### Use the New Dashboard

```tsx
import { AgenticDashboard } from "@/components/agentic-dashboard"

function HomePage() {
  return <AgenticDashboard />
}
```

### Use the API Client

```typescript
import { fetchDashboard, chatWithAgent } from "@/lib/api"

// Get dashboard
const dashboard = await fetchDashboard()

// Chat with agent
const response = await chatWithAgent("wellness", "I feel tired", [])
```

---

## 🔑 Key Features

### 1. Agent Memory
```python
User: "I feel stressed"
Agent: Stores embedding + text
Later: "You mentioned stress before..."
```

### 2. Dashboard Metrics
```python
Wellness Score = 70 - (stress × 5) + (activities × 3)
# Derived from agent memory, not hardcoded
```

### 3. Auto-Routing
```python
"I'm stressed about money"
→ Activates: Wellness + Finance agents
```

### 4. Persistent Learning
```python
Memory stored in: storage/wellness_memory.pkl
Survives server restarts
```

---

## 🎯 What to Say to Judges

### Elevator Pitch (30 sec)

> "HerSpace is a multi-agent AI platform where 5 autonomous agents—each with its own memory and expertise—learn about a working woman's life through conversations. Unlike chatbots that forget, our agents remember and power a living dashboard that reflects real intelligence."

### Technical Highlights

✅ Vector embeddings for semantic memory  
✅ Multi-agent architecture with isolated memory  
✅ Intent-based routing with confidence scoring  
✅ Metric derivation from continuous learning  
✅ Scalable, production-ready design  

---

## 📊 Directory Structure

```
backend/
├── agents/              # 5 specialized agents
│   ├── base_agent.py
│   ├── wellness_agent.py
│   ├── planner_agent.py
│   ├── finance_agent.py
│   ├── safety_agent.py
│   └── career_agent.py
│
├── memory/              # Vector memory system
│   ├── embedding.py
│   └── vector_store.py
│
├── orchestrator/        # Coordination layer
│   ├── router.py
│   └── dashboard.py
│
├── storage/             # Persistent memories
│   └── [agent memories]
│
└── main.py              # FastAPI + v2 routes

frontend/
└── src/
    ├── components/
    │   └── agentic-dashboard.tsx
    └── lib/
        └── api.ts       # v2 API client
```

---

## 🔧 Troubleshooting

### Import Errors
```powershell
pip install -r requirements.txt
```

### Backend Not Responding
```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <pid> /F

# Restart backend
python main.py
```

### Dashboard Shows Fallback Data
- Ensure backend is running on port 8000
- Check browser console for errors
- Verify CORS is enabled (it is by default)

---

## 📈 Next Steps

### For Development
- [ ] Test with different conversation flows
- [ ] Monitor memory growth
- [ ] Tune metric formulas
- [ ] Add user authentication

### For Demo
- [ ] Prepare 2-3 conversation scenarios
- [ ] Practice architecture explanation
- [ ] Prepare backup screenshots
- [ ] Time the demo (5-7 minutes)

### For Production
- [ ] Add per-user memory isolation
- [ ] Implement memory cleanup
- [ ] Add analytics dashboard
- [ ] Scale to multiple servers

---

## 🏆 Success Criteria

✅ Backend starts without errors  
✅ All v2 APIs respond correctly  
✅ Agents learn from conversations  
✅ Dashboard shows live data  
✅ Memory persists across restarts  
✅ Auto-routing activates multiple agents  

---

## 📞 Support

**Documentation:**
- [Complete Architecture](AGENTIC_ARCHITECTURE.md)
- [Quick Start Guide](QUICK_START.md)
- [Visual Diagrams](ARCHITECTURE_DIAGRAMS.md)

**API Docs:**
- Interactive: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

**Issues:**
- Check backend logs for errors
- Verify dependencies installed
- Test APIs using provided scripts

---

## 🎓 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite |
| Backend | FastAPI, Python |
| AI | Groq (Llama 3.3 70B) |
| Embeddings | sentence-transformers |
| Memory | Custom vector store (FAISS-like) |
| Storage | File-based (pickle) |

---

## 💜 Built For

Working women in India who juggle:
- Work responsibilities
- Family care
- Health & wellness
- Financial planning
- Career growth

---

**Ready to demo! 🚀**

For detailed setup, see [QUICK_START.md](QUICK_START.md)  
For architecture details, see [AGENTIC_ARCHITECTURE.md](AGENTIC_ARCHITECTURE.md)
