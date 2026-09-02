"""
Database Engine & Connection Pool Management.
Configures SQLAlchemy connection pooling (NullPool for Neon Serverless PostgreSQL,
or SQLite for local development) and provides the FastAPI get_db session dependency.
"""

import os
from typing import Generator
from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool

try:
    from models import Base, User, Conversation, Message, PubMedCache
    from utils.security import (
        hash_password,
        verify_password,
        create_access_token,
        decode_access_token,
    )
except ImportError:
    from backend.models import Base, User, Conversation, Message, PubMedCache
    from backend.utils.security import (
        hash_password,
        verify_password,
        create_access_token,
        decode_access_token,
    )

load_dotenv()

raw_db_url = os.getenv("DATABASE_URL")

if raw_db_url:
    # Modernize postgres:// to postgresql:// for SQLAlchemy 2.0 compatibility
    if raw_db_url.startswith("postgres://"):
        DATABASE_URL = raw_db_url.replace("postgres://", "postgresql://", 1)
    else:
        DATABASE_URL = raw_db_url

    # Serverless NullPool: prevents exhausting database connection pool on cold starts
    engine = create_engine(
        DATABASE_URL,
        poolclass=NullPool,
        connect_args={
            "sslmode": "require",
            "connect_timeout": 10,
        },
    )
else:
    # Graceful local / ephemeral SQLite fallback
    if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        DATABASE_FILE = "/tmp/stress_ai.db"
    else:
        DATABASE_FILE = os.path.join(os.path.dirname(__file__), "stress_ai.db")

    DATABASE_URL = f"sqlite:///{DATABASE_FILE}"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    """Creates database schema tables if not existing."""
    Base.metadata.create_all(bind=engine)


try:
    init_db()
except Exception:
    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI Dependency for request-scoped database session lifecycle."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
