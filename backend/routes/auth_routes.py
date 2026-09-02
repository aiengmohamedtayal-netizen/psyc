from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import time
try:
    from database import (
        SessionLocal, User, Conversation, Message,
        hash_password, verify_password, create_access_token, decode_access_token
    )
except ImportError:
    from backend.database import (
        SessionLocal, User, Conversation, Message,
        hash_password, verify_password, create_access_token, decode_access_token
    )

router = APIRouter(prefix="/api/auth", tags=["auth"])
conv_router = APIRouter(prefix="/api/conversations", tags=["conversations"])


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
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)
    return payload.get("sub") if payload else None


@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest):
    clean_username = req.username.strip().lower()
    db = SessionLocal()
    try:
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
            }
        }
    finally:
        db.close()


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    clean_username = req.username.strip().lower()
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == clean_username).first()
        if not user or not verify_password(req.password, user.password_hash, user.salt):
            raise HTTPException(status_code=401, detail="اسم المستخدم أو كلمة المرور غير صحيحة.")

        token = create_access_token(user.id, user.username)
        return {
            "token": token,
            "user": {
                "id": user.id,
                "username": user.username,
                "name": user.display_name,
            }
        }
    finally:
        db.close()


@router.get("/me")
def get_me(user_id: Optional[str] = Depends(get_current_user_id)):
    if not user_id:
        raise HTTPException(status_code=401, detail="غير مصرح.")
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="المستخدم غير موجود.")
        return {
            "id": user.id,
            "username": user.username,
            "name": user.display_name,
        }
    finally:
        db.close()


@conv_router.get("")
def list_conversations(user_id: Optional[str] = Depends(get_current_user_id)):
    if not user_id:
        return []
    db = SessionLocal()
    try:
        convs = db.query(Conversation).filter(Conversation.user_id == user_id).order_by(Conversation.updated_at.desc()).all()
        result = []
        for c in convs:
            msgs = db.query(Message).filter(Message.conversation_id == c.id).order_by(Message.created_at.asc()).all()
            result.append({
                "id": c.id,
                "title": c.title,
                "updatedAt": int(c.updated_at * 1000),
                "messages": [
                    {
                        "id": m.id,
                        "role": m.role,
                        "content": m.content,
                        "timestamp": int(m.created_at * 1000),
                    }
                    for m in msgs
                ]
            })
        return result
    finally:
        db.close()


class MessagePayload(BaseModel):
    id: Optional[str] = None
    role: str
    content: str
    timestamp: Optional[int] = None
    clinical_reference: Optional[Dict[str, Any]] = None


class ConversationSaveRequest(BaseModel):
    id: str
    title: str
    messages: List[MessagePayload]
    updatedAt: Optional[int] = None


@conv_router.post("")
def save_conversation(req: ConversationSaveRequest, user_id: Optional[str] = Depends(get_current_user_id)):
    if not user_id:
        return {"status": "skipped", "detail": "Guest mode - saved locally"}
    db = SessionLocal()
    try:
        conv = db.query(Conversation).filter(Conversation.id == req.id).first()
        now = time.time()
        if not conv:
            conv = Conversation(
                id=req.id,
                user_id=user_id,
                title=req.title,
                created_at=now,
                updated_at=now
            )
            db.add(conv)
        else:
            conv.title = req.title
            conv.updated_at = now

        db.query(Message).filter(Message.conversation_id == req.id).delete()
        import json
        for idx, m in enumerate(req.messages):
            msg_id = m.id or f"{req.id}_{idx}_{int(now)}"
            ref_str = json.dumps(m.clinical_reference) if m.clinical_reference else None
            db_msg = Message(
                id=msg_id,
                conversation_id=req.id,
                role=m.role,
                content=m.content,
                clinical_reference=ref_str,
                created_at=(m.timestamp / 1000.0) if m.timestamp else now
            )
            db.add(db_msg)

        db.commit()
        return {"status": "saved", "id": req.id}
    finally:
        db.close()


@conv_router.delete("/{conv_id}")
def delete_conversation(conv_id: str, user_id: Optional[str] = Depends(get_current_user_id)):
    if not user_id:
        return {"status": "deleted"}
    db = SessionLocal()
    try:
        conv = db.query(Conversation).filter(Conversation.id == conv_id, Conversation.user_id == user_id).first()
        if conv:
            db.query(Message).filter(Message.conversation_id == conv_id).delete()
            db.delete(conv)
            db.commit()
        return {"status": "deleted", "id": conv_id}
    finally:
        db.close()

