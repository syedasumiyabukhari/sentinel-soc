"""
AuditLog model: tracks every meaningful action taken in the system for compliance/forensics.
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    actor = relationship("User", foreign_keys=[actor_id])
    actor_username = Column(String(64), nullable=True)  # denormalized snapshot for history integrity

    action = Column(String(64), nullable=False, index=True)
    # e.g. login, alert_status_change, alert_assigned, alert_created, user_created

    target_type = Column(String(32), nullable=True)  # "alert" | "user" | "auth"
    target_id = Column(Integer, nullable=True)

    detail = Column(Text, nullable=True)  # human-readable description, e.g. "Status changed new -> investigating"

    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
