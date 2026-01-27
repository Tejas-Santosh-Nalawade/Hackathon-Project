"""
JWT Authentication System with Google OAuth
--------------------------------------------
Handles user authentication, profile management, and Google login.
"""

import os
import jwt
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from fastapi import HTTPException, Header
from passlib.context import CryptContext
from google.oauth2 import id_token
from google.auth.transport import requests
import json

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_urlsafe(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

# Simple file-based user storage (replace with database in production)
USER_DB_FILE = "storage/users.json"


# =============================================================================
# Data Models
# =============================================================================

class UserProfile(BaseModel):
    """User profile information"""
    user_id: str
    email: EmailStr
    name: str
    auth_provider: str = "email"  # email or google
    created_at: str
    preferences: Dict[str, Any] = Field(default_factory=dict)
    agent_interactions: Dict[str, int] = Field(default_factory=dict)


class UserCredentials(BaseModel):
    """User login credentials"""
    email: EmailStr
    password: str


class UserRegistration(BaseModel):
    """User registration data"""
    email: EmailStr
    password: str
    name: str


class SocialAuthRequest(BaseModel):
    """Google authentication request"""
    id_token: str  # Google ID token from frontend


class AuthResponse(BaseModel):
    """Authentication response with JWT"""
    access_token: str
    token_type: str = "bearer"
    user: UserProfile


class ProfileUpdateRequest(BaseModel):
    """Profile update request"""
    name: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None


# =============================================================================
# User Database Operations
# =============================================================================

class UserDatabase:
    """Simple file-based user storage"""
    
    def __init__(self):
        self.db_file = USER_DB_FILE
        self._ensure_storage()
    
    def _ensure_storage(self):
        """Ensure storage directory and file exist"""
        os.makedirs("storage", exist_ok=True)
        if not os.path.exists(self.db_file):
            with open(self.db_file, "w") as f:
                json.dump({}, f)
    
    def _load_users(self) -> Dict[str, Dict]:
        """Load all users from file"""
        try:
            with open(self.db_file, "r") as f:
                return json.load(f)
        except:
            return {}
    
    def _save_users(self, users: Dict[str, Dict]):
        """Save users to file"""
        with open(self.db_file, "w") as f:
            json.dump(users, f, indent=2)
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        users = self._load_users()
        return users.get(email)
    
    def create_user(self, email: str, password_hash: str, name: str, provider: str = "email") -> UserProfile:
        """Create new user"""
        users = self._load_users()
        
        if email in users:
            raise ValueError("User already exists")
        
        user_id = f"user_{secrets.token_urlsafe(8)}"
        user_data = {
            "user_id": user_id,
            "email": email,
            "password_hash": password_hash,
            "name": name,
            "auth_provider": provider,
            "created_at": datetime.utcnow().isoformat(),
            "preferences": {},
            "agent_interactions": {}
        }
        
        users[email] = user_data
        self._save_users(users)
        
        # Return profile without password hash
        return UserProfile(**{k: v for k, v in user_data.items() if k != "password_hash"})
    
    def update_user(self, email: str, updates: Dict[str, Any]):
        """Update user profile"""
        users = self._load_users()
        
        if email not in users:
            raise ValueError("User not found")
        
        users[email].update(updates)
        self._save_users(users)
        
        return UserProfile(**{k: v for k, v in users[email].items() if k != "password_hash"})
    
    def increment_agent_interaction(self, email: str, agent_name: str):
        """Track agent interaction count"""
        users = self._load_users()
        
        if email in users:
            if "agent_interactions" not in users[email]:
                users[email]["agent_interactions"] = {}
            
            users[email]["agent_interactions"][agent_name] = \
                users[email]["agent_interactions"].get(agent_name, 0) + 1
            
            self._save_users(users)


# Global database instance
user_db = UserDatabase()


# =============================================================================
# Password & JWT Utilities
# =============================================================================

def hash_password(password: str) -> str:
    """Hash password using bcrypt (max 72 characters)"""
    # Bcrypt has a 72-byte limit
    if len(password) > 72:
        password = password[:72]
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash (max 72 characters)"""
    # Bcrypt has a 72-byte limit
    if len(plain_password) > 72:
        plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_email: str, user_id: str) -> str:
    """Create JWT access token"""
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    
    payload = {
        "sub": user_email,
        "user_id": user_id,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_user(authorization: Optional[str] = Header(None)) -> UserProfile:
    """Extract current user from JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        # Extract token from "Bearer <token>"
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        
        # Decode token
        payload = decode_access_token(token)
        email = payload.get("sub")
        
        # Get user from database
        user_data = user_db.get_user_by_email(email)
        if not user_data:
            raise HTTPException(status_code=401, detail="User not found")
        
        return UserProfile(**{k: v for k, v in user_data.items() if k != "password_hash"})
    
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


# =============================================================================
# Authentication Functions
# =============================================================================

def register_user(registration: UserRegistration) -> AuthResponse:
    """Register new user with email/password"""
    try:
        # Truncate password to 72 characters for bcrypt
        password = registration.password[:72] if len(registration.password) > 72 else registration.password
        
        # Hash password
        password_hash = hash_password(password)
        
        # Create user
        user_profile = user_db.create_user(
            email=registration.email,
            password_hash=password_hash,
            name=registration.name,
            provider="email"
        )
        
        # Create JWT token
        access_token = create_access_token(user_profile.email, user_profile.user_id)
        
        return AuthResponse(
            access_token=access_token,
            user=user_profile
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


def login_user(credentials: UserCredentials) -> AuthResponse:
    """Login user with email/password"""
    # Truncate password to 72 characters for bcrypt
    password = credentials.password[:72] if len(credentials.password) > 72 else credentials.password
    
    # Get user from database
    user_data = user_db.get_user_by_email(credentials.email)
    
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(password, user_data.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create user profile
    user_profile = UserProfile(**{k: v for k, v in user_data.items() if k != "password_hash"})
    
    # Create JWT token
    access_token = create_access_token(user_profile.email, user_profile.user_id)
    
    return AuthResponse(
        access_token=access_token,
        user=user_profile
    )


def social_auth(social_request: SocialAuthRequest) -> AuthResponse:
    """
    Authenticate with Google OAuth
    
    Verifies Google ID token and creates/logins user
    """
    
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500, 
            detail="Google OAuth not configured. Set GOOGLE_CLIENT_ID in .env"
        )
    
    try:
        # Verify the Google ID token
        idinfo = id_token.verify_oauth2_token(
            social_request.id_token, 
            requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        # Extract user info from verified token
        email = idinfo.get('email')
        name = idinfo.get('name', email.split('@')[0] if email else 'User')
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not found in Google token")
        
        # Check if user exists
        user_data = user_db.get_user_by_email(email)
        
        if user_data:
            # User exists, login
            user_profile = UserProfile(**{k: v for k, v in user_data.items() if k != "password_hash"})
        else:
            # Create new user
            user_profile = user_db.create_user(
                email=email,
                password_hash="",  # No password for Google auth
                name=name,
                provider="google"
            )
        
        # Create JWT token
        access_token = create_access_token(user_profile.email, user_profile.user_id)
        
        return AuthResponse(
            access_token=access_token,
            user=user_profile
        )
    
    except ValueError as e:
        # Token verification failed
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google authentication failed: {str(e)}")


def update_profile(user: UserProfile, updates: ProfileUpdateRequest) -> UserProfile:
    """Update user profile"""
    update_data = {}
    
    if updates.name:
        update_data["name"] = updates.name
    
    if updates.preferences:
        update_data["preferences"] = updates.preferences
    
    if update_data:
        return user_db.update_user(user.email, update_data)
    
    return user


def get_user_profile(user: UserProfile) -> UserProfile:
    """Get current user profile"""
    return user
