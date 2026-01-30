# 🌸 HerSpace - Agentic AI Support Platform for Working Women in India

> **An intelligent, voice-enabled multi-agent system providing personalized support for wellness, career growth, financial planning, safety, and work-life balance.**

---

## 🎯 Problem Statement

Working women in India face unique challenges that often go unaddressed:

- **🏢 Workplace Health**: Long sitting hours causing back pain, neck strain, and eye fatigue with limited access to immediate relief guidance
- **⚖️ Work-Life Balance**: Overwhelming responsibilities across career, family, and personal well-being with minimal time management support
- **🚀 Career Growth**: Limited access to personalized upskilling resources and career guidance tailored to Indian job market
- **💰 Financial Stress**: Lack of financial literacy and budgeting support specific to Indian banking and savings systems
- **🛡️ Safety Concerns**: Need for trauma-informed support and actionable safety guidance in Indian context
- **😔 Mental Wellness**: Stress, anxiety, and burnout with no immediate, judgment-free support available 24/7

**The Gap**: Existing solutions are either expensive counseling, impersonal chatbots, or fragmented apps that don't understand the complete picture of a working woman's life.

---

## 💡 Our Solution: HerSpace

HerSpace is not just another chatbot—it's an **agentic AI system** where five specialized AI agents work together to provide:

✨ **Personalized Support**: Each agent learns from your interactions and builds a memory of your preferences, challenges, and goals  
🎙️ **Voice-First Experience**: Real-time voice guidance with Indian female voice, interactive breathing exercises, and speaking avatar  
🤖 **Multi-Agent Intelligence**: Five specialized bots collaborate to provide comprehensive support across all life domains  
📊 **Smart Dashboard**: Personalized insights and recommendations powered by agent intelligence, not static data  
🔒 **Privacy-First**: All conversations stored locally with JWT authentication and optional Google OAuth  
🌏 **India-Focused**: Culturally relevant advice, Indian job market integration, and regional language support (coming soon)

---

## ✨ Key Features

### 🎙️ **Voice-First Experience**
- **Auto-Speaking Responses**: Bot messages automatically spoken with Indian female voice (en-IN priority)
- **Interactive Voice Sessions**: Real-time guided breathing exercises with countdown
- **Speaking Avatar**: Animated purple avatar with pulse effects showing when AI is speaking
- **Voice Speed Optimization**: 1.25x rate for responses, 1.4x for countdown (fast & clear)
- **Voice Controls**: Stop, pause, and restart voice playback anytime

### 🤖 **Agentic Intelligence**
- **Multi-Agent Collaboration**: Agents share context and work together on complex queries
- **Vector Memory**: Each agent remembers your preferences, challenges, and history
- **Intent Routing**: Smart detection routes your query to the right specialist
- **Continuous Learning**: Agents improve recommendations based on past interactions
- **Dashboard Intelligence**: Personalized metrics derived from agent memory, not hardcoded

### 🔒 **Security & Privacy**
- **JWT Authentication**: Secure token-based auth with refresh tokens
- **Google OAuth**: Quick sign-in with Google account
- **Local Storage**: All data stored in JSON files (no database required)
- **Password Hashing**: bcrypt encryption for user passwords
- **CORS Protection**: Configurable origin restrictions

### 📱 **User Experience**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Mode**: System theme detection with manual override
- **Real-time Updates**: Instant message delivery and status updates
- **Search Integration**: Find courses and jobs directly in chat
- **Conversation History**: Full history per bot with message timestamps

### 🌏 **India-Specific**
- **Cultural Context**: Advice tailored to Indian workplace culture and family dynamics
- **Regional Awareness**: India-specific resources, helplines, and services
- **Language Priority**: Indian English voice synthesis priority
- **Job Market Integration**: Real-time job search from Indian job boards
- **Financial Context**: Budgeting for Indian salaries, taxes, and banking systems

---

## 🚀 Quick Start (Development)

### Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **Groq API Key** (free at https://console.groq.com)

### One Command (Windows, concurrent servers)

```powershell
# From the project root
.\start-dev.ps1
```

What it does:
- Verifies `backend/.env` exists (copy from `.env.example`)
- Installs frontend deps if missing
- Opens two PowerShell windows: FastAPI on :8000 and Vite on :5173

### Manual Setup (all platforms)

**Backend**
```bash
cd backend
python -m venv venv          # first time only
source venv/bin/activate     # Mac/Linux
# or .\venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
cp .env.example .env         # then add your GROQ_API_KEY
uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd DASHBOARD
npm install                  # first time only
npm run dev                  # starts on :5173
```

> Tip: On Windows without Python in PATH, use `py -m venv venv` and `.\venv\Scripts\python.exe -m pip install -r requirements.txt`.

## 🌐 URLs

| Service  | URL                        | Description           |
| -------- | -------------------------- | --------------------- |
| Frontend | http://localhost:5173      | Main web application  |
| Backend  | http://localhost:8000      | FastAPI server        |
| API Docs | http://localhost:8000/docs | Swagger documentation |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                                 │
│                    (React + TypeScript + Vite)                          │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  🎙️ Voice Interface          📊 Dashboard         💬 Chat Panel  │  │
│  │  • Text-to-Speech (Indian)   • Agent Insights    • Multi-bot    │  │
│  │  • Speech-to-Text            • Memory Metrics    • History      │  │
│  │  • Interactive Sessions      • Recommendations   • Voice Mode   │  │
│  │  • Speaking Avatar           • Analytics         • Search       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────────────────┐
│                         AGENTIC ROUTER                                   │
│                        (Python FastAPI)                                  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Intent Classification → Route to Specialist Agent               │  │
│  │  Multi-Agent Collaboration → Shared Context                      │  │
│  │  Dashboard Service → Aggregate Agent Intelligence                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕
┌─────────────────────────────────────────────────────────────────────────┐
│                         5 SPECIALIZED AGENTS                             │
│                                                                          │
│  💪 FitHer       📅 PlanPal      🛡️ SpeakUp     🚀 GrowthGuru  💰 PaisaWise │
│  Wellness       Planner        Safety         Career         Finance   │
│  • Exercises    • Scheduling   • Support      • Upskilling   • Budget  │
│  • Posture      • Priorities   • Resources    • Job Search   • Savings │
│  • Breathing    • Reminders    • Guidance     • Courses      • Goals   │
│                                                                          │
│  Each Agent Has:                                                         │
│  ✓ Vector Memory (embeddings)    ✓ Long-term Learning                  │
│  ✓ Conversation History           ✓ Specialized Tools                   │
│  ✓ Personality & Expertise        ✓ Context Awareness                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕
┌─────────────────────────────────────────────────────────────────────────┐
│                         INFRASTRUCTURE                                   │
│                                                                          │
│  🧠 LLM: Groq (llama-3.3-70b-versatile)                                │
│  🔍 Search: DuckDuckGo (Job/Course Search)                              │
│  💾 Storage: JSON Files (Users, Conversations)                          │
│  🔐 Auth: JWT + Google OAuth                                            │
│  📦 Memory: Hash-based Embeddings (Lightweight)                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 The 5 Specialized AI Agents

### 💪 **FitHer** - Your Wellness Coach
**Focus**: Physical & Mental Wellness  
**Features**:
- Quick desk exercises (2-5 minutes)
- Posture correction guidance
- Interactive breathing sessions (Box Breathing, 4-7-8, Deep Breathing)
- Eye strain relief exercises
- Neck and shoulder tension relief
- Stress management techniques
- **Voice-Guided Sessions**: Real-time countdown and instructions

**Example**: *"I have back pain from sitting all day"*  
→ FitHer provides immediate desk stretches with voice-guided steps

---

### 📅 **PlanPal** - Your Time Management Partner
**Focus**: Work-Life Balance & Productivity  
**Features**:
- Smart task prioritization
- Realistic time blocking
- Family-work balance strategies
- Break reminders and scheduling
- Energy management (not just time)
- Weekly planning assistance

**Example**: *"I can't balance work and family time"*  
→ PlanPal creates a practical schedule considering Indian work culture

---

### 🛡️ **SpeakUp** - Your Safety Ally
**Focus**: Safety & Harassment Support  
**Features**:
---

## 📁 Project Structure

```
FULL PRODUCT WOMEN/
├── frontend/                      # Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── chat-panel.tsx          # Main chat interface
│   │   │   ├── interactive-voice-guide.tsx  # Voice sessions
│   │   │   ├── speaking-avatar.tsx      # Animated avatar
│   │   │   ├── auth-form.tsx            # Login/Register
│   │   │   ├── dashboard.tsx            # Agent metrics
│   │   │   └── ui/                      # Shadcn components
│   │   ├── lib/                  # Utilities & Logic
│   │   │   ├── api.ts                  # API client
│   │   │   ├── voice-agent.ts          # TTS/STT logic
│   │   │   ├── guided-sessions.ts      # Breathing exercises
│   │   │   └── analytics-tracker.ts    # User analytics
│   │   ├── pages/                # Route pages
│   │   │   ├── Home.tsx                # Main app
│   │   │   ├── Auth.tsx                # Authentication
│   │   │   └── Analytics.tsx           # Usage stats
│   │   └── hooks/                # Custom React hooks
│   ├── public/                   # Static assets
│   ├── .env.local               # Environment variables
│   ├── vercel.json              # Vercel deployment config
│   └── package.json             # Dependencies
│
├── backend/                      # Backend (Python + FastAPI)
│   ├── main.py                  # FastAPI app & routes
│   ├── auth.py                  # JWT + OAuth logic
│   ├── bots.py                  # Bot personalities
│   ├── search_utils.py          # DuckDuckGo search
│   ├── agents/                  # Agent system
│   │   ├── agent_manager.py           # Manages all agents
│   │   ├── base_agent.py              # Base agent class
│   │   ├── wellness_agent.py          # FitHer
│   │   ├── planner_agent.py           # PlanPal
│   │   ├── safety_agent.py            # SpeakUp
│   │   ├── career_agent.py            # GrowthGuru
│   │   └── finance_agent.py           # PaisaWise
│   ├── memory/                  # Agent memory system
│   │   ├── embedding.py               # Hash-based embeddings
│   │   └── vector_store.py            # Memory storage
│   ├── orchestrator/            # Routing & coordination
│   │   ├── router.py                  # Intent classification
│   │   └── dashboard.py               # Dashboard service
│   ├── storage/                 # Data persistence
│   │   └── users.json                 # User database
│   ├── .env                     # Environment variables
│   ├── requirements.txt         # Full dependencies
│   ├── requirements-light.txt   # Production deps (512MB optimized)
│   └── render.yaml              # Render deployment config
│
├── architecture/                 # Documentation
│   ├── AGENTIC_ARCHITECTURE.md        # System design
│   ├── AUTH_SYSTEM_COMPLETE.md        # Auth implementation
│   ├── GOOGLE_OAUTH_SETUP.md          # OAuth guide
│   └── DEMO_CHECKLIST.md              # Demo preparation
│
├── docker-compose.yml           # Docker setup
├── DEPLOYMENT.md                # Deployment guide
└── README.md                    # This file

---

---

## 🔧 API Endpoints

### **Authentication**

#### Register User
```http
POST http://localhost:8000/api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123",
  "full_name": "Jane Doe"
}
```

#### Login
```http
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123"
}
```

#### Google OAuth
```http
POST http://localhost:8000/api/v1/auth/google
Content-Type: application/json

{
  "token": "google_oauth_token_here"
}
```

### **Bot Interaction**

#### Health Check
```http
GET http://localhost:8000/
```

#### List All Bots
```http
GET http://localhost:8000/api/v1/bots
```

#### Chat with Bot (Legacy)
```http
POST http://localhost:8000/api/v1/chat
Content-Type: application/json

{
  "bot_id": "wellness",
  "message": "I have back pain from sitting all day",
  "history": []
}
```

#### Agentic Chat (New)
```http
POST http://localhost:8000/api/v1/agentic/chat
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "message": "I need help with time management and exercise",
  "user_id": "user_123",
  "bot_id": "planner"  // optional: direct to specific bot
}
```
---

## 🚢 Deployment

### **Recommended Setup**
- **Frontend**: Vercel (free tier, automatic deployments)
- **Backend**: Render (free tier, 512MB optimized)

### **Quick Deploy**

#### 1. Deploy Backend on Render
```bash
# Push your code to GitHub first
git add .
git commit -m "Ready for deployment"
git push origin main

# Then on Render:
# 1. Create New Web Service
# 2. Connect GitHub repo
# 3. Set Root Directory: backend
# 4. Build Command: pip install -r requirements-light.txt
---

## 📝 Tech Stack

```
┌──────────────────────────────────────────────────────────────┐
│                         FRONTEND                              │
├──────────────────────────────────────────────────────────────┤
│  React 19 + TypeScript     │  UI Framework                   │
│  Vite 7.2.4                │  Build Tool                     │
│  Tailwind CSS              │  Styling                        │
│  Radix UI (40+ components) │  Accessible UI                  │
│  Web Speech API            │  Voice (TTS/STT)                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                         BACKEND                               │
├──────────────────────────────────────────────────────────────┤
│  FastAPI + Python 3.11     │  Async Web Framework            │
│  Groq API (llama-3.3-70b)  │  LLM Provider                   │
│  JWT + Bcrypt              │  Authentication                 │
│  DuckDuckGo Search         │  Web Search                     │
│  Hash-based Embeddings     │  Memory (5MB only!)             │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                       DEPLOYMENT                              │
├──────────────────────────────────────────────────────────────┤
│  Vercel (Frontend)         │  Free Tier                      │
│  Render (Backend)          │  512MB Free Tier                │
│  GitHub                    │  CI/CD                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 🤖 How Agents Work

```
USER: "I need time management and exercise"
  │
  ▼
┌─────────────────────────────────────────────────────────┐
│ ⚙️  ROUTER: Analyzes intent → Scores agents            │
│     PlanPal: 95 ✅  |  FitHer: 90 ✅  |  Others: <60 ❌  │
└─────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────┐
│ 📅 PLANPAL AGENT                                        │
│  1. Checks memory: "User struggles with mornings"      │
│  2. Creates schedule: 6:30 AM - 8:00 AM                │
│  3. Asks FitHer for exercise help                      │
└─────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────┐
│ 💪 FITHER AGENT (Collaboration)                         │
│  1. Gets context: "30-min morning exercise needed"     │
│  2. Checks memory: "User has back pain"                │
│  3. Suggests: Stretching + Yoga + Breathing            │
└─────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────┐
│ ✨ MERGED RESPONSE                                      │
│  "Here's your morning routine:                         │
│   6:30 AM - Wake up                                    │
│   7:00 AM - Exercise (stretching + yoga for back)     │
│   8:00 AM - Start work                                 │
│   [Start Session] [Set Reminder]"                      │
└─────────────────────────────────────────────────────────┘
```

### **Agent Scoring**

```
┌──────────────────────────────────────────────┐
│ 🎯 How Router Scores Agents (0-100)         │
├──────────────────────────────────────────────┤
│  Keywords:     30 points                     │
│  Intent (LLM): 40 points                     │
│  Memory:       30 points                     │
│  ─────────────────────                       │
│  Total:        100 points                    │
├──────────────────────────────────────────────┤
│  ≥ 80: Primary agent (responds)             │
│  60-79: Collaborates                        │
│  < 60: Skipped                              │
└──────────────────────────────────────────────┘
```

---

## 🧠 Vector Memory System

Each agent has its own **vector memory** to remember user context:

```
┌──────────────────────────────────────────────────────────┐
│                 FITHER'S VECTOR MEMORY                    │
├──────────────────────────────────────────────────────────┤
│  Memory 1: "User has back pain from sitting"             │
│    Vector: [0.21, 0.89, 0.45, ...] (64 dimensions)       │
│    Timestamp: 2 days ago                                 │
│                                                          │
│  Memory 2: "User prefers 10-min quick exercises"        │
│    Vector: [0.67, 0.12, 0.88, ...]                      │
│    Timestamp: 5 days ago                                 │
│                                                          │
│  Memory 3: "User feels energetic in mornings"           │
│    Vector: [0.34, 0.78, 0.23, ...]                      │
│    Timestamp: 1 week ago                                 │
└──────────────────────────────────────────────────────────┘

New Query: "I want to exercise"
Query Vector: [0.25, 0.85, 0.42, ...]

Similarity Calculation (Cosine Similarity):
• Memory 1: 0.92 (high match) ✅
• Memory 2: 0.87 (high match) ✅
• Memory 3: 0.45 (low match) ❌

Result: Agent recommends quick exercises focusing on back pain
```

### **How Embedding Works (Hash-based)**

```python
# Traditional ML Embeddings (400MB memory)
"back pain" → [heavy ML model] → 384 dimensions

# Our Hash-based Embeddings (5MB memory)
"back pain" → [MD5 hash] → 64 dimensions
```

**Why Hash-based?**
- ✅ 98% less memory (5MB vs 400MB)
- ✅ 10x faster (no ML model loading)
- ✅ Good enough for similarity matching
- ✅ Fits in Render free tier (512MB)

---

## 📊 Dashboard Intelligence

```
┌───────────────────────────────────────────────────────┐
│  📈 YOUR HERSPACE DASHBOARD                           │
├───────────────────────────────────────────────────────┤
│  Total Conversations: 47                              │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 💪 FitHer: 12    📅 PlanPal: 8   🛡️ SpeakUp: 3 │ │
│  │ 🚀 GrowthGuru: 15   💰 PaisaWise: 9             │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  🎯 Top Topics (from your chats):                    │
│    1. time management - 8 times                      │
│    2. back pain - 6 times                            │
│    3. career growth - 5 times                        │
│                                                       │
│  💚 Wellness Score: 72/100                           │
│     Based on your FitHer activity                    │
│                                                       │
│  💡 Recommendations:                                 │
│    • Haven't exercised in 3 days                    │
│    • 2 career resources waiting                     │
│    • Budget review due                              │
└───────────────────────────────────────────────────────┘

✅ Real data from agent memories
❌ No fake/hardcoded numbers
```
Traditional:  "back pain" → ML model (400MB) → 384 dimensions
Our approach: "back pain" → MD5 hash (5MB)  → 64 dimensions

✅ 98% less memory  |  ✅ 10x faster  |  ✅ Fits free tier
```rements-light.txt`)
- ✅ Single worker configuration
- ✅ No heavy ML frameworks (numpy only)

**Memory Usage**: ~80-100MB (well under 512MB limit)
### **Search & Tools**

#### Search Courses
```http
GET http://localhost:8000/api/v1/search/courses?query=python+programming
```

#### Search Jobs
```http
GET http://localhost:8000/api/v1/search/jobs?query=data+analyst+bangalore
├── backend/                # Backend (Python + FastAPI)
│   ├── main.py            # FastAPI app & endpoints
│   ├── bots.py            # AI bot personas
│   ├── search_utils.py    # Web search for GrowthGuru
│   ├── .env               # Backend environment (API key)
│   ├── requirements.txt   # Python dependencies
│   └── start.ps1          # Backend startup script
│
├── docs/                   # Documentation
│   ├── INTEGRATION_PLAN.md
│   └── PHASE_1_COMPLETE.md
│
└── start-dev.ps1          # Windows helper to run backend+frontend together
```

## 🔧 API Endpoints

### Health Check

```http
GET http://localhost:8000/
```

### List Bots

```http
GET http://localhost:8000/api/v1/bots
```

### Chat with Bot

```http
POST http://localhost:8000/api/v1/chat
Content-Type: application/json

{
  "bot_id": "wellness",
  "message": "I have back pain from sitting all day",
  "history": []
}
```

## 🛠️ Development & Builds

- Frontend dev: `cd DASHBOARD && npm run dev`
- Frontend lint: `cd DASHBOARD && npm run lint`
- Frontend build: `cd DASHBOARD && npm run build` (output in `DASHBOARD/dist`)
- Backend dev: `cd backend && uvicorn main:app --reload --port 8000`
- Backend quick check (syntax): `cd backend && python -m compileall search_utils.py`

### Production Notes
- Serve `DASHBOARD/dist` via any static host (Netlify/Vercel/S3 + CDN).
- Run backend with `uvicorn main:app --host 0.0.0.0 --port 8000` (or with a process manager like systemd/PM2).
- Set environment vars in production:
  - Backend: `GROQ_API_KEY=...`
  - Frontend: `VITE_API_URL=https://your-backend.example.com`
- Tighten CORS in `backend/main.py` to your frontend origin before deploying.

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
GROQ_API_KEY=gsk_your_api_key_here
```

### Frontend (`DASHBOARD/.env.local`)

```env
VITE_API_URL=http://localhost:8000
```

## 📝 Tech Stack

### Frontend

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **React Router** - Navigation

### Backend

---

## 🎯 Future Roadmap

### **Phase 1** ✅ (Current)
- [x] 5 Specialized AI agents
- [x] Voice-first interface with Indian voice
- [x] Interactive breathing sessions
- [x] JWT + Google OAuth authentication
- [x] Vector memory per agent
- [x] Dashboard with agent intelligence
- [x] Production deployment (Vercel + Render)

### **Phase 2** 🚧 (In Progress)
- [ ] Regional language support (Hindi, Tamil, Bengali)
- [ ] WhatsApp integration for notifications
- [ ] Mobile app (React Native)
- [ ] Calendar integration (Google Calendar)
- [ ] Habit tracking and streaks
- [ ] Community features (anonymous forums)

### **Phase 3** 🔮 (Future)
- [ ] Video-based wellness sessions
- [ ] AI-powered resume builder
- [ ] Mock interview practice with feedback
- [ ] Financial planning with real bank integration
- [ ] Telemedicine integration
- [ ] Group coaching sessions
- [ ] Corporate wellness program B2B offering

---

## 🏆 Hackathon Highlights

### **Innovation**
✨ **Not just a chatbot**: Multi-agent system with real memory and collaboration  
✨ **Voice-first**: Real-time guided sessions with animated feedback  
✨ **India-focused**: Culturally relevant advice and resources  
✨ **Privacy-first**: No external database, all data local  
✨ **Memory-optimized**: Runs on free tier (512MB) using clever engineering

### **Technical Excellence**
🔧 **Agentic Architecture**: 5 autonomous agents with vector memory  
🔧 **Smart Routing**: Intent classification for multi-agent collaboration  
🔧 **Lightweight Embeddings**: Hash-based instead of ML models (5MB vs 400MB)  
🔧 **Voice UX**: Speaking avatar, auto-speak, interactive sessions  
🔧 **Production-Ready**: Deployed on Vercel + Render with CI/CD

### **Real-World Impact**
💡 **Accessibility**: 24/7 support, no appointments needed  
💡 **Affordability**: Free for users, minimal infrastructure costs  
💡 **Scalability**: Can handle 1000s of users on free tier  
💡 **Inclusivity**: Designed for working women's unique challenges  
💡 **Holistic**: Addresses all aspects of work-life, not just one domain

---

## 👥 Team

This project was built for  by a dedicated team passionate about empowering working women in India.

**Tech Stack Choices**:
- **Frontend**: React for rapid UI development, TypeScript for reliability
- **Backend**: FastAPI for async performance, Python for AI ecosystem
- **LLM**: Groq for fast inference (sub-second responses)
- **Memory**: Custom embeddings for cost/memory efficiency
- **Voice**: Browser APIs for zero-cost, cross-platform support

---

## 📄 License

Part of the  Women Health Enhancer Hackathon Project.

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**: Both frontend and backend
5. **Commit**: `git commit -m "Add amazing feature"`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### **Development Guidelines**
- Follow existing code style
- Add comments for complex logic
- Update README if adding features
- Test voice features in Chrome/Edge (best support)
- Ensure memory-efficient code (Render 512MB limit)

---

## 📞 Support & Contact

- **Issues**: Open a GitHub issue
- **Documentation**: Check `/architecture` folder for detailed docs
- **Deployment Guide**: See `DEPLOYMENT.md` for production setup

---

## 🙏 Acknowledgments

- **Groq**: For lightning-fast LLM inference
- **Shadcn/ui**: For beautiful, accessible components
- **DuckDuckGo**: For privacy-respecting search API
- **Vercel & Render**: For generous free tiers
- **Browser Speech APIs**: For enabling voice features
- **Working Women of India**: For inspiring this project

---

<div align="center">

### **Built with ❤️ for working women in India**

**HerSpace** - *Your AI companion for wellness, growth, and balance*

[🌐 Live Demo](#) | [📚 Documentation](./architecture) | [🚀 Deploy Guide](./DEPLOYMENT.md)

---

*"Empowering every working woman with personalized AI support - because you deserve it."*

</div>

## 📄 License

Part of the Women Health Enhancer Hackathon Project.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test both frontend and backend
4. Submit a pull request

--- 

**Built with ❤️ for working women in India**
