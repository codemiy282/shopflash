"""Simple authentication utilities - SHA256 hashing and JWT tokens"""
import hashlib
import time
import os
from jose import jwt, JWTError
from datetime import datetime, timedelta

SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = os.getenv('ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 30))
ACCESS_TOKEN_EXPIRE_HOURS = ACCESS_TOKEN_EXPIRE_MINUTES / 60

def hash_password(password: str) -> str:
    """Hash password using SHA-256 (matches database schema CHAR(64))"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == password_hash

def generate_user_id() -> str:
    """Generate unique user_id using timestamp"""
    return str(int(time.time() * 1000))[-10:]

def create_access_token(user_id: str) -> str:
    """Create JWT access token"""
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode = {"sub": user_id, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> str:
    """Decode JWT token and return user_id"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise ValueError("Invalid token: no user_id")
        return user_id
    except JWTError as e:
        raise ValueError(f"Invalid token: {str(e)}")

def extract_token_from_header(auth_header: str) -> str:
    """Extract Bearer token from Authorization header"""
    if not auth_header:
        raise ValueError("Missing Authorization header")
    
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise ValueError("Invalid Authorization header format")
    
    return parts[1]
