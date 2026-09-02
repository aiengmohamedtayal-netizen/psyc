"""
SQLAlchemy ORM Entities for Stress AI Helper.
Defines database schemas for users, conversation sessions, chat messages,
and PubMed clinical evidence cache.
"""

import time
from sqlalchemy import Column, String, Float, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class User(Base):
    """Registered application user entity."""
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    salt = Column(String(64), nullable=False)
    display_name = Column(String(100), nullable=True)
    created_at = Column(Float, default=time.time)


class Conversation(Base):
    """User conversation thread record."""
    __tablename__ = "conversations"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), index=True, nullable=True)
    title = Column(String(256), nullable=False)
    created_at = Column(Float, default=time.time)
    updated_at = Column(Float, default=time.time)


class Message(Base):
    """Individual dialogue message item."""
    __tablename__ = "messages"

    id = Column(String(64), primary_key=True, index=True)
    conversation_id = Column(String(64), index=True, nullable=False)
    role = Column(String(20), nullable=False)  # 'user' | 'bot'
    content = Column(Text, nullable=False)
    clinical_reference = Column(Text, nullable=True)  # JSON serialized
    created_at = Column(Float, default=time.time)


class PubMedCache(Base):
    """Cache table for evidence-based PubMed medical citations."""
    __tablename__ = "pubmed_cache"

    topic_key = Column(String(100), primary_key=True)
    pmc_id = Column(String(64), nullable=False)
    citation = Column(String(256), nullable=False)
    url = Column(String(512), nullable=False)
    cached_at = Column(Float, default=time.time)
