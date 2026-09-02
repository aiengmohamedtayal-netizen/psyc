"""
Database & Authentication Module (SQLAlchemy + SQLite).
Provides server-side persistence for users, conversation sessions, and PubMed clinical caching.
"""

import os
import time
import hashlib
import hmac
import jwt
from typing import Optional, Dict, Any, List
from sqlalchemy import create_engine, Column, String, Integer, Float, Text, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_FILE = os.path.join(os.path.dirname(__file__), "stress_ai.db")
DATABASE_URL = f"sqlite:///{DATABASE_FILE}"

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "stress_ai_secret_super_secure_key_2026")
ALGORITHM = "HS256"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(String(64), primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    salt = Column(String(64), nullable=False)
    display_name = Column(String(100), nullable=True)
    created_at = Column(Float, default=time.time)


class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), index=True, nullable=True)
    title = Column(String(256), nullable=False)
    created_at = Column(Float, default=time.time)
    updated_at = Column(Float, default=time.time)


class Message(Base):
    __tablename__ = "messages"
    id = Column(String(64), primary_key=True, index=True)
    conversation_id = Column(String(64), index=True, nullable=False)
    role = Column(String(20), nullable=False)  # 'user' | 'bot'
    content = Column(Text, nullable=False)
    clinical_reference = Column(Text, nullable=True)  # JSON serialized
    created_at = Column(Float, default=time.time)


class PubMedCache(Base):
    __tablename__ = "pubmed_cache"
    topic_key = Column(String(100), primary_key=True)
    pmc_id = Column(String(64), nullable=False)
    citation = Column(String(256), nullable=False)
    url = Column(String(512), nullable=False)
    cached_at = Column(Float, default=time.time)


# Create tables
Base.metadata.create_all(bind=engine)


def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if not salt:
        salt = os.urandom(16).hex()
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return pwd_hash, salt


def verify_password(password: str, pwd_hash: str, salt: str) -> bool:
    new_hash, _ = hash_password(password, salt)
    return hmac.compare_digest(new_hash, pwd_hash)


def create_access_token(user_id: str, username: str) -> str:
    payload = {
        "sub": user_id,
        "username": username,
        "exp": int(time.time()) + (30 * 24 * 3600),  # 30 days
        "iat": int(time.time()),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        return None
