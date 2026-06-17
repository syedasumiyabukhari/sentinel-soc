"""
Alert model: represents a SIEM-style security alert/event.
"""
from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    # Classification
    alert_type = Column(String(64), nullable=False, index=True)
    # e.g. failed_login, port_scan, brute_force, impossible_travel, malware_signature, data_exfil

    severity = Column(String(16), nullable=False, index=True, default="low")
    # critical | high | medium | low

    severity_score = Column(Float, nullable=False, default=0.0)  # 0-100 computed score

    status = Column(String(20), nullable=False, default="new", index=True)
    # new | investigating | escalated | closed

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Source/network context
    source_ip = Column(String(45), nullable=True, index=True)
    destination_ip = Column(String(45), nullable=True)
    source_country = Column(String(64), nullable=True)
    username_targeted = Column(String(120), nullable=True)
    port = Column(Integer, nullable=True)

    # IP reputation data (from AbuseIPDB or mock)
    abuse_confidence_score = Column(Integer, nullable=True)  # 0-100
    is_tor = Column(String(8), nullable=True)  # "true"/"false"/"unknown"
    total_reports = Column(Integer, nullable=True)

    raw_event = Column(Text, nullable=True)  # JSON blob of the simulated raw log line

    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)
