"""
Authentication Endpoints (/api/auth).
Manages user registration, credential verification, and user profile queries
using PBKDF2 cryptography and JWT bearer tokens.
"""

import time
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

try:
    from database import get_db
    from models import User
    from utils.security import (
        hash_password,
        verify_password,
        create_access_token,
        decode_access_token,
    )
    from routes.conversation_routes import router as conv_router
except ImportError:
    from backend.database import get_db
    from backend.models import User
    from backend.utils.security import (
        hash_password,
        verify_password,
        create_access_token,
        decode_access_token,
    )
    from backend.routes.conversation_routes import router as conv_router

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=4)
    name: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user: Dict[str, Any]


def get_current_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Extracts and verifies user ID from HTTP Bearer Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)
    return payload.get("sub") if payload else None


@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Registers a new user with unique username check and PBKDF2 salt hashing."""
    clean_username = req.username.strip().lower()

    # Guard Clause: Check existing username conflict
    existing = db.query(User).filter(User.username == clean_username).first()
    if existing:
        raise HTTPException(status_code=400, detail="اسم المستخدم مسجل بالفعل.")

    pwd_hash, salt = hash_password(req.password)
    user_id = f"u_{int(time.time() * 1000)}"

    new_user = User(
        id=user_id,
        username=clean_username,
        password_hash=pwd_hash,
        salt=salt,
        display_name=req.name.strip() if req.name else clean_username,
        created_at=time.time(),
    )
    db.add(new_user)
    db.commit()

    token = create_access_token(user_id, clean_username)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "username": clean_username,
            "name": new_user.display_name,
        },
    }


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticates user credentials and returns a signed JWT token."""
    clean_username = req.username.strip().lower()
    user = db.query(User).filter(User.username == clean_username).first()

    # Guard Clause: Validate user existence and password hash
    if not user or not verify_password(req.password, user.password_hash, user.salt):
        raise HTTPException(
            status_code=401, detail="اسم المستخدم أو كلمة المرور غير صحيحة."
        )

    token = create_access_token(user.id, user.username)
    return {
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "name": user.display_name,
        },
    }


@router.get("/me")
def get_me(
    user_id: Optional[str] = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Returns the current authenticated user profile."""
    if not user_id:
        raise HTTPException(status_code=401, detail="غير مصرح.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود.")

    return {
        "id": user.id,
        "username": user.username,
        "name": user.display_name,
    }
