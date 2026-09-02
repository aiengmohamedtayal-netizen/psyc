import os
import sys
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Ensure backend root is always on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from routes.predict import router as predict_router
from routes.auth_routes import router as auth_router, conv_router
from services.model_service import model_service
try:
    from database import engine, Base, get_db
except ImportError:
    from backend.database import engine, Base, get_db
from sqlalchemy.orm import Session
from fastapi import Depends

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables are created automatically
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Database initialization note: {e}")

    # Ensure model service is initialized
    if not model_service.data:
        model_service.load_and_prepare()
    yield
    # Shutdown logic if needed


limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])

app = FastAPI(
    title="Stress AI Helper API",
    description="NLP-powered bilingual mental health and stress assistance chatbot API",
    version="2.0.0",
    lifespan=lifespan
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
origins_env = os.getenv("ALLOWED_ORIGINS", "")
if origins_env:
    allowed_origins = [o.strip() for o in origins_env.split(",") if o.strip()]
    allow_credentials = True
else:
    # Safe default for local development and Cloudflare Pages
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://psyc-17r.pages.dev",
        "*"
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

# Register routes
app.include_router(predict_router)
app.include_router(auth_router)
app.include_router(conv_router)


@app.get("/")
def root():
    return {
        "service": "Stress AI Helper API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health",
        "db_health": "/health/db"
    }


@app.get("/health/db", tags=["health"])
def health_check_db(db: Session = Depends(get_db)):
    """Validates live database connection with Neon / PostgreSQL / SQLite."""
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        dialect = engine.dialect.name
        is_nullpool = engine.pool.__class__.__name__ == "NullPool"
        return {
            "status": "connected",
            "database": f"{dialect.upper()} (Serverless Pooler Ready)",
            "pool": "NullPool (Zero Connection Exhaustion)" if is_nullpool else "DefaultPool",
            "dialect": dialect
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
