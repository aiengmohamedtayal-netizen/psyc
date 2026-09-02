"""
Security & Cryptography Utilities.
Handles PBKDF2 password hashing, salt generation, constant-time verification,
and JWT authentication tokens.
"""

import os
import time
import hashlib
import hmac
from typing import Optional, Dict, Any, Tuple
import jwt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "stress_ai_secret_super_secure_key_2026")
ALGORITHM = "HS256"
TOKEN_EXPIRATION_SECONDS = 30 * 24 * 3600  # 30 days
HASH_ITERATIONS = 100_000


def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """
    Hashes a plain-text password with PBKDF2-HMAC-SHA256 and a 16-byte random salt.
    """
    if not salt:
        salt = os.urandom(16).hex()

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        HASH_ITERATIONS,
    ).hex()

    return password_hash, salt


def verify_password(password: str, password_hash: str, salt: str) -> bool:
    """
    Validates a plain-text password against a stored hash using constant-time comparison.
    """
    computed_hash, _ = hash_password(password, salt)
    return hmac.compare_digest(computed_hash, password_hash)


def create_access_token(user_id: str, username: str) -> str:
    """
    Generates a signed HS256 JWT access token for the authenticated user.
    """
    now = int(time.time())
    payload = {
        "sub": user_id,
        "username": username,
        "exp": now + TOKEN_EXPIRATION_SECONDS,
        "iat": now,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and verifies a JWT token. Returns None if invalid or expired.
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        return None
