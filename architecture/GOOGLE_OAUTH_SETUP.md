# 🔐 Google OAuth Setup Guide

## ✅ Complete Setup for Real Google Authentication

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project (or select existing)**
   - Click "Select a project" → "New Project"
   - Name: "HerSpace Auth"
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "HerSpace Web Client"

5. **Configure OAuth Consent Screen** (if prompted)
   - User Type: "External"
   - App name: "HerSpace"
   - User support email: your email
   - Developer contact: your email
   - Click "Save and Continue"

6. **Add Authorized JavaScript Origins**
   ```
   http://localhost:5173
   http://localhost:3000
   https://yourdomain.com (for production)
   ```

7. **Add Authorized Redirect URIs**
   ```
   http://localhost:5173
   http://localhost:3000
   https://yourdomain.com (for production)
   ```

8. **Get Your Client ID**
   - After creating, you'll see your Client ID
   - Format: `123456789-abcdefg.apps.googleusercontent.com`
   - Copy this ID

---

### Step 2: Configure Backend

1. **Open backend/.env** (create if doesn't exist)
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Add Google Client ID**
   ```env
   GROQ_API_KEY=your_groq_key_here
   JWT_SECRET=your_secure_random_secret_minimum_32_chars
   GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   ```

3. **Generate JWT Secret** (recommended)
   ```bash
   # PowerShell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   
   # Or use Python
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

---

### Step 3: Configure Frontend

1. **Open frontend/.env.local** (create if doesn't exist)
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```

2. **Add Google Client ID**
   ```env
   VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   VITE_API_URL=http://localhost:8000
   ```

   ⚠️ **Important:** Use the same Client ID in both backend and frontend!

---

### Step 4: Install Dependencies

**Backend:**
```bash
cd backend
pip install google-auth email-validator
```

**Frontend:**
```bash
cd frontend
npm install @react-oauth/google
```

---

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

### Step 6: Test Google Sign-In

1. **Open http://localhost:5173/auth**

2. **You'll see the Google Sign-In button**
   - Clean, official Google button
   - Themed to match your UI

3. **Click "Sign in with Google"**
   - Google OAuth popup opens
   - Select your Google account
   - Grant permissions

4. **Automatic Login**
   - Backend verifies the Google token
   - Creates user account if new
   - Issues JWT token
   - Redirects to dashboard

---

## 🔍 How It Works

### Frontend Flow
```
1. User clicks Google button
2. @react-oauth/google opens popup
3. User authenticates with Google
4. Google returns ID token
5. Frontend sends token to backend
```

### Backend Flow
```
1. Receives Google ID token
2. Verifies with Google's servers
3. Extracts email and name
4. Creates/finds user in database
5. Generates JWT token
6. Returns token + profile
```

### Token Verification
```python
# Backend verifies token authenticity
idinfo = id_token.verify_oauth2_token(
    token, 
    requests.Request(), 
    GOOGLE_CLIENT_ID
)
# Google confirms: "Yes, this token is valid"
```

---

## 🎯 API Endpoints

### POST /api/auth/social

**Request:**
```bash
curl -X POST http://localhost:8000/api/auth/social \
  -H "Content-Type: application/json" \
  -d '{
    "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6..." 
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "user_id": "user_abc123",
    "email": "user@gmail.com",
    "name": "John Doe",
    "auth_provider": "google",
    "created_at": "2026-01-27T10:30:00",
    "preferences": {},
    "agent_interactions": {}
  }
}
```

---

## 🛡️ Security Features

### ✅ Token Verification
- Google ID token verified server-side
- No way to fake authentication
- Token signature checked with Google's public keys

### ✅ Email Verification
- Google provides verified emails only
- No fake email addresses possible

### ✅ JWT Security
- Secure token generation
- 7-day expiration
- Stored in localStorage (or use httpOnly cookies for more security)

### ✅ No Password Storage
- Users authenticated by Google
- Zero password management burden

---

## 🎨 UI Components

The Google button uses official Google styling:

```tsx
<GoogleLogin
  onSuccess={handleGoogleSuccess}
  onError={handleGoogleError}
  theme="outline"          // Clean, bordered style
  size="large"             // Prominent button
  text="signin_with"       // "Sign in with Google"
  width="384"              // Full width
/>
```

---

## 🐛 Troubleshooting

### "Invalid token" Error
**Cause:** Client ID mismatch between frontend and backend

**Fix:**
- Ensure both `.env` files have the same `GOOGLE_CLIENT_ID`
- Restart both backend and frontend

### "Redirect URI mismatch" Error
**Cause:** OAuth consent screen redirect URIs not configured

**Fix:**
- Add `http://localhost:5173` to authorized redirect URIs
- Wait 5 minutes for Google to update

### Google Button Not Showing
**Cause:** Missing environment variable

**Fix:**
- Check `frontend/.env.local` has `VITE_GOOGLE_CLIENT_ID`
- Restart Vite dev server

### "Failed to verify token"
**Cause:** Invalid or expired token

**Fix:**
- Check backend has correct `GOOGLE_CLIENT_ID`
- Ensure `google-auth` library is installed

---

## 📊 Testing Checklist

- [ ] Google Cloud project created
- [ ] OAuth credentials configured
- [ ] Client ID added to backend/.env
- [ ] Client ID added to frontend/.env.local
- [ ] Dependencies installed
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Google button visible on auth page
- [ ] Click button opens Google popup
- [ ] Select account works
- [ ] User created in backend/storage/users.json
- [ ] JWT token received
- [ ] Redirected to dashboard
- [ ] User profile shows Google email

---

## 🚀 Production Deployment

### Update Authorized Origins
Add your production domain:
```
https://herspace.app
https://www.herspace.app
```

### Environment Variables
```env
# Production Backend
GOOGLE_CLIENT_ID=your_client_id
JWT_SECRET=long_random_secret_use_secrets_manager
FRONTEND_URL=https://herspace.app

# Production Frontend
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_API_URL=https://api.herspace.app
```

### Security Enhancements
1. Use httpOnly cookies instead of localStorage
2. Add CSRF protection
3. Implement rate limiting
4. Use environment secrets manager
5. Enable HTTPS only

---

## ✅ What You've Built

🎉 **Real Google OAuth Authentication**
- Industry-standard OAuth 2.0
- Server-side token verification
- Automatic user creation
- JWT session management
- Zero password handling

🔐 **Production-Ready Security**
- Google verifies user identity
- Backend validates every token
- Secure JWT generation
- 7-day session persistence

💜 **Seamless User Experience**
- One-click sign-in
- No password to remember
- Official Google UI
- Fast authentication

---

**Your authentication is now production-ready!** 🚀✨
