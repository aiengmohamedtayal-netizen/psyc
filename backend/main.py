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

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure model service is initialized
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
    # Safe default for local development
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["GET", "POST", "OPTIONS"],
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
        "health": "/health"
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
