# SheThrive - AI Support Platform for Working Women

A holistic AI-powered support platform designed for working women in India, providing instant access to personalized guidance across wellness, career, safety, and financial domains.

## 🚀 Quick Start (Dev)

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

## 🤖 The 5 AI Bots

| Bot         | Title      | Purpose                                             |
| ----------- | ---------- | --------------------------------------------------- |
| 💪 wellness | FitHer     | Wellness & fitness coach with India-specific advice |
| 📅 planner  | PlanPal    | Time management with realistic expectations         |
| 🛡️ speakup  | SpeakUp    | Trauma-informed harassment & safety support         |
| 🚀 upskill  | GrowthGuru | Career coaching with job search integration         |
| 💰 finance  | PaisaWise  | Budgeting & savings for Indian context              |

## 📁 Project Structure

```
woman-health-enhancer/
├── DASHBOARD/              # Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # API client, utilities
│   │   └── pages/         # Route pages
│   ├── .env.local         # Frontend environment variables
│   └── package.json       # Node dependencies
│
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

- **FastAPI** - Web framework
- **Groq API** - LLM provider
- **DuckDuckGo Search** - Web search
- **Pydantic** - Data validation

## 🐛 Troubleshooting
### Backend won’t start
- Ensure `backend/.env` exists with `GROQ_API_KEY`.
- Activate the venv, then `pip install -r requirements.txt`.
- Check Python version (`python --version` ≥ 3.10).

### Frontend can’t reach backend
- Backend running on :8000?
- `DASHBOARD/.env.local` has `VITE_API_URL` pointing to backend?
- Browser console CORS errors? Restrict/allow origins in `main.py` as needed.

### Search results look irrelevant/empty (GrowthGuru)
- Wait a few seconds and retry (DDG throttles bursts).
- Queries are auto-cleaned and ranked; if still noisy, try more specific wording.
- Backend logs `[SEARCH_*]` messages—verify they show results.

### “python not found” on Windows
- Use `py` instead of `python`, or call `.\venv\Scripts\python.exe`.

### Port in use
- Start frontend with `npm run dev -- --host --port 5174` or backend with `uvicorn main:app --port 8001`.

## 📄 License

Part of the Women Health Enhancer Hackathon Project.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test both frontend and backend
4. Submit a pull request

--- 

**Built with ❤️ for working women in India**

## 🔍 DuckDuckGo Search Reliability (GrowthGuru)
- Topic extraction removes filler/stopwords and URLs to craft tighter queries.
- DDG search now uses India-English region, moderate safesearch, and recency hints; fetches extra candidates, filters non-English noise, and re-ranks by topic match plus trusted domains (Coursera/edX/YouTube/LinkedIn, etc.).
- Fallback query runs if the first attempt returns nothing.
- Observability: backend logs `[SEARCH_*]` entries with the final query and counts; check them when diagnosing odd results.
