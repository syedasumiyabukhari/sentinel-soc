"""
AlertComment model: free-text notes an analyst leaves on an alert while
triaging it - separate from the audit log, which records actions, not
analyst commentary or reasoning.
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class AlertComment(Base):
    __tablename__ = "alert_comments"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=False, index=True)

    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    author = relationship("User", foreign_keys=[author_id])
    author_username = Column(String(64), nullable=True)  # denormalized snapshot

    body = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
