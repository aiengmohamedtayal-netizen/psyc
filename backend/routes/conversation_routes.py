"""
Conversation Cloud Synchronization Routes.
Handles remote storage, retrieval, and deletion of conversation threads
and clinical references on Neon Serverless PostgreSQL / SQLite.
"""

import time
import json
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session

try:
    from database import get_db
    from models import Conversation, Message
    from utils.security import decode_access_token
except ImportError:
    from backend.database import get_db
    from backend.models import Conversation, Message
    from backend.utils.security import decode_access_token

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


def get_current_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Extracts and verifies user ID from HTTP Bearer Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)
    return payload.get("sub") if payload else None


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


@router.get("")
def list_conversations(
    user_id: Optional[str] = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Lists all active conversations for the authenticated user, ordered by last updated."""
    if not user_id:
        return []

    convs = (
        db.query(Conversation)
        .filter(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )

    result = []
    for c in convs:
        msgs = (
            db.query(Message)
            .filter(Message.conversation_id == c.id)
            .order_by(Message.created_at.asc())
            .all()
        )
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
            ],
        })
    return result


@router.post("")
def save_conversation(
    req: ConversationSaveRequest,
    user_id: Optional[str] = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Upserts a conversation thread and its serialized message items."""
    if not user_id:
        return {"status": "skipped", "detail": "Guest mode - saved locally"}

    conv = db.query(Conversation).filter(Conversation.id == req.id).first()
    now = time.time()

    if not conv:
        conv = Conversation(
            id=req.id,
            user_id=user_id,
            title=req.title,
            created_at=now,
            updated_at=now,
        )
        db.add(conv)
    else:
        conv.title = req.title
        conv.updated_at = now

    # Replace messages snapshot
    db.query(Message).filter(Message.conversation_id == req.id).delete()

    for idx, m in enumerate(req.messages):
        msg_id = m.id or f"{req.id}_{idx}_{int(now)}"
        ref_str = json.dumps(m.clinical_reference) if m.clinical_reference else None
        db_msg = Message(
            id=msg_id,
            conversation_id=req.id,
            role=m.role,
            content=m.content,
            clinical_reference=ref_str,
            created_at=(m.timestamp / 1000.0) if m.timestamp else now,
        )
        db.add(db_msg)

    db.commit()
    return {"status": "saved", "id": req.id}


@router.delete("/{conv_id}")
def delete_conversation(
    conv_id: str,
    user_id: Optional[str] = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Deletes a conversation thread and all corresponding messages."""
    if not user_id:
        return {"status": "deleted"}

    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conv_id, Conversation.user_id == user_id)
        .first()
    )
    if conv:
        db.query(Message).filter(Message.conversation_id == conv_id).delete()
        db.delete(conv)
        db.commit()

    return {"status": "deleted", "id": conv_id}
