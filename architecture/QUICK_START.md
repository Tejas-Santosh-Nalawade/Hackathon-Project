# 🚀 Quick Start Guide - Agentic HerSpace

## ⚡ 5-Minute Setup

### Step 1: Install Backend Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

**What's new:**
- `sentence-transformers` - For text embeddings
- `numpy` - For vector operations

### Step 2: Start Backend Server

```powershell
cd backend
python main.py
```

✅ Backend will run on `http://localhost:8000`

### Step 3: Test the V2 APIs

Open a new terminal:

```powershell
# Test dashboard API
curl http://localhost:8000/api/v2/dashboard

# Test greeting API
curl http://localhost:8000/api/v2/greeting

# Test agent chat
curl -X POST http://localhost:8000/api/v2/agent/wellness `
  -H "Content-Type: application/json" `
  -d '{"message": "I feel tired today"}'
```

### Step 4: Start Frontend

```powershell
cd frontend
npm install  # If not already installed
npm run dev
```

✅ Frontend will run on `http://localhost:5173`

---

## 📊 Using the Agentic Dashboard

### Option 1: Replace Existing Dashboard

In `frontend/src/pages/Home.tsx` or wherever you render the dashboard:

```tsx
import { AgenticDashboard } from "@/components/agentic-dashboard"

// Replace PersonalizedDashboard with:
<AgenticDashboard />
```

### Option 2: Add as New Tab/Page

The `AgenticDashboard` component is standalone and can be dropped anywhere.

---

## 🧪 Testing the System

### 1. Chat with an Agent

```powershell
curl -X POST http://localhost:8000/api/v2/agent/wellness \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have been feeling very stressed this week",
    "user_id": "test_user",
    "history": []
  }'
```

### 2. Check Dashboard Update

```powershell
curl http://localhost:8000/api/v2/dashboard
```

You should see the wellness score affected by the stress mention!

### 3. Test Auto-Routing

```powershell
curl -X POST http://localhost:8000/api/v2/agentic-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am stressed about work and need to save money",
    "history": []
  }'
```

This will activate both Wellness and Finance agents!

---

## 🎬 Demo Flow for Hackathon

### 1. Show Dashboard (1 min)
- Open `http://localhost:5173`
- Point out: "These metrics come from agent memory, not hardcoded values"
- Highlight: Wellness score, tasks, savings goal

### 2. Interact with Agent (2 min)
- Navigate to chat with FitHer
- Type: "I've been feeling stressed and tired lately"
- Show contextual response
- Explain: "The agent is recalling past conversations using vector memory"

### 3. Show Dashboard Update (1 min)
- Return to dashboard
- Refresh page
- Point out: "Notice wellness score changed? That's the agent learning"

### 4. Show Agent Memory (1 min)
- Open browser console or use API docs
- Call: `GET /api/v2/agent/wellness/summary`
- Show memory count increasing

### 5. Show Auto-Routing (1 min)
- Type a mixed query: "Work stress and money worries"
- Show both agents responding
- Explain: "System intelligently routes to multiple agents"

---

## 🔧 Troubleshooting

### Issue: "Module 'sentence_transformers' not found"
```powershell
pip install sentence-transformers
```

### Issue: "Agent memories not persisting"
- Check that `backend/storage/` directory exists
- Backend creates it automatically, but ensure write permissions

### Issue: "Dashboard showing fallback data"
- Ensure backend is running on port 8000
- Check browser console for API errors
- Verify CORS is enabled (it is by default)

### Issue: "Model rate limit errors"
- The system automatically falls back to faster models
- Default priority: Llama 3.3 70B → Qwen 32B → Llama 3.1 8B

---

## 📝 Key Files Modified/Created

### Backend
```
✅ New: agents/base_agent.py - Base agent class
✅ New: agents/wellness_agent.py - Wellness agent
✅ New: agents/planner_agent.py - Planner agent
✅ New: agents/finance_agent.py - Finance agent
✅ New: agents/safety_agent.py - Safety agent
✅ New: agents/career_agent.py - Career agent
✅ New: agents/agent_manager.py - Agent initialization
✅ New: memory/embedding.py - Embedding service
✅ New: memory/vector_store.py - Vector memory
✅ New: orchestrator/router.py - Intent routing
✅ New: orchestrator/dashboard.py - Dashboard aggregation
✅ Modified: main.py - Added v2 API routes
✅ Modified: requirements.txt - Added dependencies
```

### Frontend
```
✅ Modified: lib/api.ts - Added v2 API functions
✅ New: components/agentic-dashboard.tsx - Live dashboard component
```

---

## 🎯 What to Say to Judges

### The Problem
"Working women in India juggle multiple responsibilities—work, family, health, finances. They need personalized support, not generic advice."

### The Solution
"HerSpace uses 5 autonomous AI agents, each with its own memory and expertise. Unlike chatbots that forget, our agents remember every interaction and power a living dashboard that gets smarter over time."

### The Technology
"We built a multi-agent architecture with vector memory using semantic search. Each agent independently learns from conversations and contributes intelligence to a unified dashboard. This is not a chatbot—it's a learning ecosystem."

### The Impact
"Every interaction makes the system smarter. The wellness agent notices stress patterns. The planner tracks productivity. The finance agent monitors savings goals. Together, they create a truly personalized experience."

---

## 📊 Expected Results

After chatting with agents, you should see:

| Interaction | Expected Dashboard Change |
|-------------|--------------------------|
| "I feel stressed" → Wellness agent | Wellness score decreases slightly |
| "I completed my tasks" → Planner agent | Task completion increases |
| "I saved ₹5000 today" → Finance agent | Savings progress increases |
| Multiple wellness chats | Wellness trend shows pattern |

---

## 🏆 Success Criteria

✅ Backend starts without errors  
✅ Dashboard loads live data from APIs  
✅ Agents respond with memory context  
✅ Dashboard updates after interactions  
✅ Multiple agents activate for complex queries  
✅ Memory persists across server restarts  

---

## 📚 Next Steps

1. **Test with real conversations** - Chat with each agent
2. **Observe memory growth** - Check `/api/v2/agents`
3. **Monitor dashboard changes** - See metrics update
4. **Prepare demo script** - Practice the flow above
5. **Read full docs** - See `AGENTIC_ARCHITECTURE.md`

---

**Ready to demo! 🚀**

For detailed architecture, see: [AGENTIC_ARCHITECTURE.md](./AGENTIC_ARCHITECTURE.md)
