"""
Stress AI Helper Backend Application.
FastAPI server orchestrating bilingual NLP retrieval, LLM enhancement,
clinical literature search (PubMed), user authentication, and real-time SSE token streaming.
"""

import os
import sys
from contextlib import asynccontextmanager
from typing import Dict, Any

import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from sqlalchemy import text
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Ensure backend root is always on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from database import engine, Base, get_db
    from routes.predict import router as predict_router
    from routes.auth_routes import router as auth_router
    from routes.conversation_routes import router as conv_router
    from services.model_service import model_service
except ImportError:
    from backend.database import engine, Base, get_db
    from backend.routes.predict import router as predict_router
    from backend.routes.auth_routes import router as auth_router
    from backend.routes.conversation_routes import router as conv_router
    from backend.services.model_service import model_service

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes database schema and warms up NLP vectorizer on startup."""
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as error:
        print(f"Database initialization note: {error}")

    if not model_service.data:
        model_service.load_and_prepare()

    yield


limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])

app = FastAPI(
    title="Stress AI Helper API",
    description="NLP-powered bilingual mental health and stress assistance chatbot API",
    version="2.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
origins_env = os.getenv("ALLOWED_ORIGINS", "")
if origins_env:
    allowed_origins = [o.strip() for o in origins_env.split(",") if o.strip()]
    allow_credentials = True
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://psyc-17r.pages.dev",
        "*",
    ]
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.pages\.dev",
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route Registrations
app.include_router(predict_router)
app.include_router(auth_router)
app.include_router(conv_router)


@app.get("/", tags=["system"])
def root() -> Dict[str, str]:
    """Service metadata and health pointers."""
    return {
        "service": "Stress AI Helper API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health",
        "db_health": "/health/db",
    }


@app.get("/health/db", tags=["health"])
def health_check_db(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Validates live database connection with Neon PostgreSQL or local SQLite."""
    try:
        db.execute(text("SELECT 1"))
        dialect = engine.dialect.name
        is_nullpool = engine.pool.__class__.__name__ == "NullPool"
        return {
            "status": "connected",
            "database": f"{dialect.upper()} (Serverless Pooler Ready)",
            "pool": "NullPool (Zero Connection Exhaustion)"
            if is_nullpool
            else "DefaultPool",
            "dialect": dialect,
        }
    except Exception as error:
        return {"status": "error", "detail": str(error)}


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
