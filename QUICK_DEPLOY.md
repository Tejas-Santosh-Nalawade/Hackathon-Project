# HerSpace AI - Quick Deployment Guide

## 🚀 Backend Deployment (Render) - Under 512MB

### Prerequisites
- GitHub account
- Render account (free)
- Your API keys ready

### Deploy Steps

1. **Create Render Web Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect GitHub → Select your repo
   
2. **Configure Settings**
   ```
   Name: herspace-backend
   Root Directory: backend
   Environment: Python 3
   Build Command: pip install -r requirements-light.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1
   Instance Type: Free
   ```

3. **Environment Variables** (Add in Render dashboard)
   ```
   GROQ_API_KEY=your_key_here
   JWT_SECRET=your_secret_here
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

4. **Deploy** - Click "Create Web Service"
   - Deployment takes ~5 minutes
   - Copy your URL: `https://herspace-backend.onrender.com`

---

## 🌐 Frontend Deployment (Vercel)

### Deploy Steps

1. **Go to Vercel**
   - https://vercel.com → Sign in with GitHub
   - Click "Add New Project"
   - Import your repository

2. **Configure**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

3. **Environment Variable**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

4. **Deploy** - Click "Deploy"
   - Takes ~2 minutes
   - Get URL: `https://herspace.vercel.app`

---

## ✅ Test Deployment

```bash
# Test backend
curl https://your-backend.onrender.com/api/v1/bots

# Visit frontend
# Open: https://your-frontend.vercel.app
```

---

## 💾 Memory Optimization Applied

**Before**: 600MB+ (sentence-transformers)
**After**: ~50-100MB (hash-based embeddings)

✅ Fits perfectly in Render's 512MB free tier!

---

## 🎯 What's Optimized

1. Removed heavy ML models (sentence-transformers)
2. Lightweight hash-based embeddings
3. Single worker (--workers 1)
4. Minimal dependencies in requirements-light.txt
5. Efficient memory management

---

## 🔧 Troubleshooting

**Backend 502 Error?**
- Check environment variables in Render
- Wait 1-2 minutes after first deploy

**Frontend Can't Connect?**
- Verify VITE_API_URL in Vercel env vars
- Check Render backend is running

**Memory Error?**
- Already optimized! Should work fine
- Check Render logs if issues persist

---

## 💰 Cost
**FREE** - Both Render and Vercel free tiers!
