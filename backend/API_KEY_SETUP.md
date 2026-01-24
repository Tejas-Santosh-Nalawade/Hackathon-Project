# ⚠️ IMPORTANT: API Key Required

To run the backend, you need a Groq API key.

## Get Your API Key

1. Go to https://console.groq.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `gsk_...`)

## Setup Instructions

1. Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

2. Edit `.env` and replace `your_groq_api_key_here` with your actual key:

```
GROQ_API_KEY=gsk_your_actual_key_here_abc123xyz
```

3. Save the file

4. Run the server:

```powershell
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

## Security Notes

- **NEVER** commit `.env` to Git (it's in `.gitignore`)
- **NEVER** share your API key publicly
- The key is used server-side only (not exposed to frontend)
- For production, use environment variables from your hosting platform

## Free Tier Limits

Groq free tier includes:

- llama-3.3-70b-versatile: ~1,000 requests/day
- qwen/qwen3-32b: ~1,000 requests/day
- llama-3.1-8b-instant: ~14,400 requests/day

The backend automatically falls back between models if rate limits are hit.
