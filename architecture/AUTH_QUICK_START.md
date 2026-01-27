# 🚀 Quick Start: JWT Authentication

## Start Backend with Auth

```powershell
cd backend
python main.py
```

Backend will start with all auth endpoints available.

## Test Authentication APIs

```powershell
cd backend
.\test-auth.ps1
```

This will test:
- ✅ User registration
- ✅ User login
- ✅ Profile fetch (protected)
- ✅ Profile update (protected)
- ✅ Social auth (mock)
- ✅ Protected agent chat
- ✅ Token validation

## Use Frontend

```powershell
cd frontend
npm run dev
```

Open http://localhost:5173/auth

### Register New User
1. Click "Join us"
2. Enter name, email, password
3. Click "Enter My Space"
4. JWT token saved automatically
5. Redirected to dashboard

### Login Existing User
1. Enter email and password
2. Click "Enter My Space"
3. JWT token validated
4. Dashboard loads with your profile

### Profile Features
- Click your avatar in top-right
- See your name and email
- Click "Logout" to end session
- JWT token cleared on logout

## 🔐 How It Works

### Registration
```
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "User Name"
}

Response: {
  "access_token": "eyJhbGc...",
  "user": { user profile }
}
```

### Login
```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: JWT token + user profile
```

### Protected Request
```
GET /api/auth/profile
Headers: Authorization: Bearer <token>

Response: User profile
```

## 📁 Data Storage

User data stored in: `backend/storage/users.json`

```json
{
  "user@example.com": {
    "user_id": "user_abc123",
    "email": "user@example.com",
    "password_hash": "$2b$12$...",
    "name": "User Name",
    "auth_provider": "email",
    "created_at": "2026-01-27T10:30:00",
    "preferences": {},
    "agent_interactions": {
      "wellness": 5,
      "finance": 3
    }
  }
}
```

## ✨ Features

✅ **JWT tokens** (7-day expiration)  
✅ **Bcrypt password** hashing  
✅ **Google OAuth** (mock for demo)  
✅ **Apple Sign In** (mock for demo)  
✅ **Protected endpoints**  
✅ **Profile management**  
✅ **Agent interaction tracking**  

## 🎯 Demo Flow

1. Register at /auth
2. Login redirects to /
3. See your name in avatar
4. Chat with agents (protected by JWT)
5. Click avatar → Logout
6. Redirected to /auth

**That's it! You now have production-ready JWT authentication! 🔒💜**
