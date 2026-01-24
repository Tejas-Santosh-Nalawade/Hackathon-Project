# Backend - AI Support Platform

FastAPI backend providing AI chatbot services for the Woman Health Enhancer platform.

## Quick Start

### 1. Create Virtual Environment

```powershell
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate

# Activate virtual environment (Windows CMD)
venv\Scripts\activate.bat

# Activate virtual environment (Mac/Linux)
source venv/bin/activate
```

### 2. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 3. Configure Environment

```powershell
# Copy the example file
Copy-Item .env.example .env

# Edit .env and add your Groq API key
# Get your key from: https://console.groq.com/
```

Your `.env` file should look like:

```
GROQ_API_KEY=gsk_your_actual_key_here
```

### 4. Run the Server

```powershell
uvicorn main:app --reload
```

Server will start at: `http://localhost:8000`

## API Endpoints

### Health Check

```
GET http://localhost:8000/
```

### List Available Bots

```
GET http://localhost:8000/api/v1/bots
```

Returns:

```json
[
  {
    "bot_id": "wellness",
    "title": "FitHer",
    "description": "Your wellness & fitness coach — workouts, nutrition, energy tips",
    "icon_emoji": "💪"
  },
  ...
]
```

### Chat with a Bot

```
POST http://localhost:8000/api/v1/chat
Content-Type: application/json

{
  "bot_id": "wellness",
  "message": "I have back pain from sitting all day",
  "history": []
}
```

## The 5 AI Bots

| Bot ID     | Title      | Purpose                      |
| ---------- | ---------- | ---------------------------- |
| `wellness` | FitHer     | Wellness & fitness coach     |
| `planner`  | PlanPal    | Time management & planning   |
| `speakup`  | SpeakUp    | Harassment & safety support  |
| `upskill`  | GrowthGuru | Career coach with web search |
| `finance`  | PaisaWise  | Finance & budgeting helper   |

## Tech Stack

- **Framework:** FastAPI 0.115.0
- **AI Provider:** Groq API (via OpenAI SDK)
- **Search:** DuckDuckGo Search (for GrowthGuru bot)
- **Server:** Uvicorn (ASGI)
- **Python:** 3.10+

## Environment Variables

| Variable       | Required | Description                             |
| -------------- | -------- | --------------------------------------- |
| `GROQ_API_KEY` | Yes      | Your Groq API key from console.groq.com |

## Project Structure

```
backend/
├── main.py           # FastAPI app with endpoints
├── bots.py          # Bot registry with 5 AI personas
├── search_utils.py  # Web search integration
├── requirements.txt # Python dependencies
├── .env            # Environment variables (create from .env.example)
├── .env.example    # Template for .env
└── README.md       # This file
```

## Development Notes

### Model Fallback

The backend uses 3 Groq models with automatic fallback:

1. `llama-3.3-70b-versatile` - Primary (smartest)
2. `qwen/qwen3-32b` - Backup
3. `llama-3.1-8b-instant` - Fallback (always available)

### CORS

Currently configured to allow all origins for development:

```python
allow_origins=["*"]
```

**⚠️ TODO:** Restrict this in production to your frontend domain only.

### Search Integration

Only the `upskill` (GrowthGuru) bot triggers web search for:

- Course recommendations
- Job market news
- Skill development resources

## Troubleshooting

### "GROQ_API_KEY not found"

- Make sure you created `.env` file in the `backend/` folder
- Verify the file contains `GROQ_API_KEY=your_key`
- Restart the server after creating `.env`

### Import errors

- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again
- Check Python version: `python --version` (should be 3.10+)

### Rate limiting errors

- Backend automatically falls back to alternate models
- If all models are rate-limited, wait a few minutes
- Consider upgrading to Groq paid tier for higher limits

### Port already in use

```powershell
# Use a different port
uvicorn main:app --reload --port 8001
```

## Testing

### Using curl (PowerShell)

```powershell
# Health check
curl http://localhost:8000/

# List bots
curl http://localhost:8000/api/v1/bots

# Send chat message
$body = @{
    bot_id = "wellness"
    message = "I need help with back pain"
    history = @()
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/chat" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Using the test HTML file

The original project included a test file at `ai-bots/frontend/test_chat.html`.
You can copy it to test the backend in a browser.

## Production Deployment

See main project README for deployment instructions.

**Important for production:**

- Set `allow_origins` to specific frontend URL
- Use environment variables from hosting platform
- Enable HTTPS
- Monitor API usage and rate limits
- Consider adding request rate limiting

## License

Part of the Woman Health Enhancer project.
