# 🔐 JWT Authentication System - Complete Setup

## ✅ What's Been Added

### Backend (Python/FastAPI)

1. **`backend/auth.py`** - Complete JWT authentication system
   - User registration with password hashing (bcrypt)
   - Email/password login
   - Google OAuth integration
   - Apple Sign In integration
   - JWT token generation & verification
   - User profile management
   - File-based user database (`storage/users.json`)

2. **`backend/main.py`** - New authentication endpoints
   - `POST /api/auth/register` - Register new user
   - `POST /api/auth/login` - Login with email/password
   - `POST /api/auth/social` - Login with Google/Apple
   - `GET /api/auth/profile` - Get current user profile (protected)
   - `PUT /api/auth/profile` - Update user profile (protected)
   - `POST /api/auth/logout` - Logout user
   - `POST /api/v2/agent/{agent_name}/protected` - Protected agent chat

3. **`backend/requirements.txt`** - New dependencies
   - `pyjwt>=2.8.0` - JWT token handling
   - `passlib>=1.7.4` - Password hashing
   - `bcrypt>=4.1.0` - Bcrypt algorithm

### Frontend (React/TypeScript)

1. **`frontend/src/lib/api.ts`** - Authentication API client
   - JWT token management (localStorage)
   - User profile caching
   - Auth header injection
   - Functions: `register()`, `login()`, `socialAuth()`, `logout()`, `fetchProfile()`, `updateProfile()`

2. **`frontend/src/components/auth-form.tsx`** - Real authentication
   - Email/password registration
   - Email/password login
   - Google OAuth (mock for demo)
   - Apple Sign In (mock for demo)
   - Error handling with toast notifications

---

## 🚀 How It Works

### Registration Flow

```
User fills form → Frontend calls register() → Backend hashes password → 
User created in users.json → JWT token generated → Token + profile returned →
Frontend saves token in localStorage → User redirected to dashboard
```

### Login Flow

```
User enters credentials → Frontend calls login() → Backend verifies password →
JWT token generated → Token + profile returned → Token saved → Redirect
```

### Social Auth Flow (Google/Apple)

```
User clicks "Sign in with Google" → Frontend initiates OAuth →
OAuth provider returns token → Frontend calls socialAuth() →
Backend creates/finds user → JWT token generated → User logged in
```

### Protected Requests

```
Frontend reads token from localStorage → Adds "Authorization: Bearer <token>" header →
Backend extracts token → Decodes JWT → Verifies signature → Extracts user email →
Loads user from database → Returns user profile → Request proceeds
```

---

## 🔧 API Reference

### Register New User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "priya@example.com",
    "password": "secure_password_123",
    "name": "Priya S."
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "user_id": "user_abc123",
    "email": "priya@example.com",
    "name": "Priya S.",
    "auth_provider": "email",
    "created_at": "2026-01-27T10:30:00",
    "preferences": {},
    "agent_interactions": {}
  }
}
```

### Login User

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "priya@example.com",
    "password": "secure_password_123"
  }'
```

**Response:** Same as registration

### Social Login (Google/Apple)

```bash
curl -X POST http://localhost:8000/api/auth/social \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google",
    "token": "oauth_token_from_google",
    "email": "priya@gmail.com",
    "name": "Priya S."
  }'
```

### Get Current Profile (Protected)

```bash
curl -X GET http://localhost:8000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### Update Profile (Protected)

```bash
curl -X PUT http://localhost:8000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Sharma",
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  }'
```

### Protected Agent Chat

```bash
curl -X POST http://localhost:8000/api/v2/agent/wellness/protected \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I feel stressed today",
    "history": []
  }'
```

---

## 🎯 Testing the System

### Test 1: Register New User

1. Open: http://localhost:5173/auth
2. Click "Join us" (Sign Up tab)
3. Fill in:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
4. Click "Enter My Space"
5. Should redirect to dashboard with welcome toast

### Test 2: Login Existing User

1. Logout if logged in
2. Go to http://localhost:5173/auth
3. Enter same credentials
4. Click "Enter My Space"
5. Should login successfully

### Test 3: Google Sign In (Mock)

1. Click "Google" button
2. Should create/login with mock Google account
3. Redirects to dashboard

### Test 4: Check User Data

```bash
# View users database (after creating some users)
cat backend/storage/users.json
```

You'll see:
```json
{
  "test@example.com": {
    "user_id": "user_xyz789",
    "email": "test@example.com",
    "password_hash": "$2b$12$...",
    "name": "Test User",
    "auth_provider": "email",
    "created_at": "2026-01-27T10:30:00",
    "preferences": {},
    "agent_interactions": {}
  }
}
```

### Test 5: JWT Token

```bash
# Login and save token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.access_token')

# Use token to access profile
curl -X GET http://localhost:8000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔐 Security Features

### Password Security
- ✅ Passwords hashed with bcrypt (cost factor 12)
- ✅ Never stored in plain text
- ✅ Rainbow table resistant
- ✅ Salted automatically

### JWT Security
- ✅ Signed with HS256 algorithm
- ✅ Secret key from environment variable
- ✅ 7-day expiration
- ✅ Includes user_id and email in payload
- ✅ Verified on every protected request

### API Security
- ✅ CORS enabled (configure for production)
- ✅ Protected endpoints require valid JWT
- ✅ 401 Unauthorized if token missing/invalid
- ✅ User email validated on registration

---

## 🎨 Frontend Integration

### Check Authentication Status

```typescript
import { isAuthenticated, getUserProfile } from "@/lib/api"

// Check if user is logged in
if (isAuthenticated()) {
  const user = getUserProfile()
  console.log(`Welcome ${user.name}!`)
}
```

### Protected Page

```typescript
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { isAuthenticated } from "@/lib/api"

export function ProtectedPage() {
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/auth")
    }
  }, [])
  
  return <div>Protected Content</div>
}
```

### Logout Button

```typescript
import { logout } from "@/lib/api"
import { useNavigate } from "react-router-dom"

export function LogoutButton() {
  const navigate = useNavigate()
  
  const handleLogout = async () => {
    await logout()
    navigate("/auth")
  }
  
  return <button onClick={handleLogout}>Logout</button>
}
```

---

## 📊 User Profile Features

Each user profile includes:

1. **Basic Info**
   - `user_id` - Unique identifier
   - `email` - User's email (used for login)
   - `name` - Display name
   - `auth_provider` - "email", "google", or "apple"
   - `created_at` - Registration timestamp

2. **Preferences** (customizable)
   - Theme settings
   - Notification preferences
   - Language
   - Any custom settings

3. **Agent Interactions** (auto-tracked)
   - Counts per agent
   - Example: `{"wellness": 15, "finance": 8}`
   - Used for personalized experience

---

## 🌟 Production Considerations

### For Real Google OAuth:

1. **Create Google OAuth App**
   - Go to: https://console.developers.google.com
   - Create project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

2. **Frontend Integration**
   ```bash
   npm install @react-oauth/google
   ```

3. **Update auth-form.tsx**
   ```typescript
   import { GoogleLogin } from '@react-oauth/google'
   
   <GoogleLogin
     onSuccess={credentialResponse => {
       socialAuth({
         provider: "google",
         token: credentialResponse.credential!,
       })
     }}
   />
   ```

4. **Backend Token Verification**
   ```python
   from google.oauth2 import id_token
   from google.auth.transport import requests
   
   # Verify token with Google
   idinfo = id_token.verify_oauth2_token(
       token, 
       requests.Request(), 
       GOOGLE_CLIENT_ID
   )
   email = idinfo['email']
   name = idinfo['name']
   ```

### For Real Apple Sign In:

1. **Create Apple Developer Account**
2. **Configure Sign in with Apple**
3. **Use AppleID JS SDK** on frontend
4. **Verify token** with Apple's public keys on backend

### Database Migration:

Replace file-based storage with PostgreSQL/MongoDB:

```python
# Instead of JSON file
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine('postgresql://user:pass@localhost/herspace')
Session = sessionmaker(bind=engine)
```

### Environment Variables:

```bash
# .env
JWT_SECRET=your_very_long_random_secret_key_here
JWT_EXPIRATION_HOURS=168  # 7 days
GOOGLE_CLIENT_ID=your_google_client_id
APPLE_CLIENT_ID=your_apple_client_id
DATABASE_URL=postgresql://user:pass@localhost/herspace
```

---

## 🎉 What's Different Now?

### Before (Mock Auth)
- ❌ Fake localStorage auth
- ❌ No real password verification
- ❌ No secure tokens
- ❌ No user database
- ❌ Anyone could access anything

### After (Real JWT Auth)
- ✅ Industry-standard JWT authentication
- ✅ Bcrypt password hashing
- ✅ Persistent user database
- ✅ Protected API endpoints
- ✅ Google & Apple OAuth ready
- ✅ Profile management
- ✅ Agent interaction tracking
- ✅ 7-day session persistence

---

## 🐛 Troubleshooting

### "Invalid token" error
- Token expired (7 days)
- Solution: Login again

### "User not found" error
- Database file corrupted
- Solution: Delete `storage/users.json` and re-register

### Social login not working
- Mock tokens for demo
- Solution: Implement real OAuth (see Production section)

### Password not working
- Check password meets requirements
- Solution: Ensure correct email/password combo

---

## 📝 Summary

You now have:

✅ **Complete JWT authentication system**  
✅ **Email/password registration & login**  
✅ **Google & Apple OAuth integration (mock for demo)**  
✅ **Protected API endpoints**  
✅ **User profile management**  
✅ **Token-based session persistence**  
✅ **Agent interaction tracking per user**  

**Ready for production with real OAuth setup!** 🚀💜
