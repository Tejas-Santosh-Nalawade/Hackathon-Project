# HerSpace Deployment Guide

## 🐳 Docker Deployment

### Prerequisites
- Docker installed (v20.10+)
- Docker Compose installed (v2.0+)
- Your API keys ready

### Local Testing with Docker

#### 1. Build Individual Images

**Backend:**
```bash
cd backend
docker build -t herspace-backend:latest .
```

**Frontend:**
```bash
cd frontend
docker build -t herspace-frontend:latest \
  --build-arg VITE_API_URL=http://localhost:8000 \
  --build-arg VITE_GOOGLE_CLIENT_ID=your_client_id .
```

#### 2. Run Individual Containers

**Backend:**
```bash
docker run -d \
  --name herspace-backend \
  -p 8000:8000 \
  -e GROQ_API_KEY=your_groq_key \
  -e JWT_SECRET=your_jwt_secret \
  -e GOOGLE_CLIENT_ID=your_google_client_id \
  -e GOOGLE_CLIENT_SECRET=your_google_secret \
  -v $(pwd)/backend/storage:/app/storage \
  herspace-backend:latest
```

**Frontend:**
```bash
docker run -d \
  --name herspace-frontend \
  -p 3000:80 \
  herspace-frontend:latest
```

#### 3. Test with Docker Compose (Recommended)

```bash
# 1. Copy environment template
cp .env.docker .env

# 2. Edit .env with your actual values
nano .env  # or use your editor

# 3. Start all services
docker-compose up -d

# 4. Check logs
docker-compose logs -f

# 5. Stop services
docker-compose down
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## ☁️ Cloud Deployment Options

### 1. **Render.com** (Recommended - Free Tier Available)

#### Backend Deployment
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `herspace-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free

5. Add Environment Variables:
   ```
   GROQ_API_KEY=your_groq_api_key
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

6. Deploy!

#### Frontend Deployment
1. Click **New +** → **Static Site**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `herspace-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. Add Environment Variables:
   ```
   VITE_API_URL=https://herspace-backend.onrender.com
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

5. Deploy!

**Cost:** Free tier available (with cold starts)

---

### 2. **Vercel** (Frontend) + **Railway** (Backend)

#### Frontend on Vercel
1. Go to [Vercel](https://vercel.com)
2. Import GitHub repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Environment Variables:
   ```
   VITE_API_URL=https://your-backend.railway.app
   VITE_GOOGLE_CLIENT_ID=your_client_id
   ```

5. Deploy!

#### Backend on Railway
1. Go to [Railway](https://railway.app)
2. New Project → Deploy from GitHub
3. Select `backend` directory
4. Add Environment Variables:
   ```
   GROQ_API_KEY=your_groq_api_key
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_secret
   ```

5. Railway will auto-detect Python and deploy

**Cost:** Vercel free, Railway $5/month after free tier

---

### 3. **AWS (Production Grade)**

#### Using Docker on AWS ECS/Fargate

**Step 1: Push Images to ECR**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Create repositories
aws ecr create-repository --repository-name herspace-backend
aws ecr create-repository --repository-name herspace-frontend

# Tag and push backend
docker tag herspace-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/herspace-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/herspace-backend:latest

# Tag and push frontend
docker tag herspace-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/herspace-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/herspace-frontend:latest
```

**Step 2: Deploy to ECS**
1. Create ECS Cluster (Fargate)
2. Create Task Definitions for backend and frontend
3. Create Services with Load Balancer
4. Set environment variables in Task Definition

**Cost:** ~$30-50/month minimum

---

### 4. **Google Cloud Run** (Serverless Containers)

#### Backend
```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT-ID/herspace-backend backend/

# Deploy
gcloud run deploy herspace-backend \
  --image gcr.io/PROJECT-ID/herspace-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GROQ_API_KEY=xxx,JWT_SECRET=xxx
```

#### Frontend
```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT-ID/herspace-frontend frontend/

# Deploy
gcloud run deploy herspace-frontend \
  --image gcr.io/PROJECT-ID/herspace-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Cost:** Pay-per-use, very cost-effective for low traffic

---

### 5. **Digital Ocean App Platform**

1. Go to [Digital Ocean Apps](https://cloud.digitalocean.com/apps)
2. Create App → Import from GitHub
3. Select both backend and frontend components
4. Auto-detects Dockerfile
5. Add environment variables
6. Deploy!

**Cost:** $5/month for basic plan

---

## 📝 Quick Comparison

| Platform | Backend | Frontend | Cost | Complexity | Best For |
|----------|---------|----------|------|------------|----------|
| **Render** | ✅ | ✅ | Free-$7 | ⭐ Easy | MVP/Demo |
| **Vercel+Railway** | ✅ | ✅ | Free-$10 | ⭐⭐ Medium | Startup |
| **AWS ECS** | ✅ | ✅ | $30-100 | ⭐⭐⭐⭐ Hard | Production |
| **Google Cloud Run** | ✅ | ✅ | $5-20 | ⭐⭐⭐ Medium | Scalable |
| **Digital Ocean** | ✅ | ✅ | $5-20 | ⭐⭐ Easy | Small Business |

---

## 🔧 Testing Your Deployment

### Health Check Endpoints

**Backend:**
```bash
curl https://your-backend-url.com/
# Should return: {"message": "HerSpace API is running"}

curl https://your-backend-url.com/api/v1/bots
# Should return list of bots
```

**Frontend:**
```bash
curl https://your-frontend-url.com/
# Should return HTML
```

### Load Testing
```bash
# Install Apache Bench
apt-get install apache2-utils

# Test backend
ab -n 1000 -c 10 https://your-backend-url.com/

# Test frontend
ab -n 1000 -c 10 https://your-frontend-url.com/
```

---

## 🛡️ Security Checklist

- [ ] Use HTTPS in production (most platforms provide this free)
- [ ] Set strong JWT_SECRET (32+ random characters)
- [ ] Configure CORS to allow only your frontend domain
- [ ] Use environment variables, never commit secrets
- [ ] Enable rate limiting on backend
- [ ] Set up Google OAuth authorized origins for your domain
- [ ] Regular dependency updates
- [ ] Monitor error logs

---

## 📊 Monitoring

### Render
- Built-in metrics and logs in dashboard
- Set up Sentry for error tracking

### AWS
- CloudWatch for logs and metrics
- X-Ray for tracing

### Google Cloud
- Cloud Monitoring built-in
- Error Reporting automatic

---

## 🚀 Recommended Deployment Path

**For Hackathon/Demo:**
1. Use **Render** (free tier)
2. Deploy both frontend and backend
3. Takes 10 minutes total
4. Share the URL!

**For Production:**
1. Start with **Vercel + Railway** ($5-10/month)
2. Scale to **Google Cloud Run** when traffic grows
3. Move to **AWS ECS** for enterprise requirements

---

## 📞 Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Test health check endpoints
4. Review platform-specific documentation

Good luck with your deployment! 🎉
