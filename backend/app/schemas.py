"""
Pydantic schemas for request/response bodies.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator


# ---------- Auth ----------

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: str = "analyst"

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v):
        if v not in ("viewer", "analyst", "admin"):
            raise ValueError("role must be viewer, analyst, or admin")
        return v


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Alerts ----------

class AlertOut(BaseModel):
    id: int
    alert_type: str
    severity: str
    severity_score: float
    status: str
    title: str
    description: Optional[str]
    source_ip: Optional[str]
    destination_ip: Optional[str]
    source_country: Optional[str]
    username_targeted: Optional[str]
    port: Optional[int]
    abuse_confidence_score: Optional[int]
    is_tor: Optional[str]
    total_reports: Optional[int]
    assigned_to_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime]

    class Config:
        from_attributes = True


class AlertStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def status_must_be_valid(cls, v):
        if v not in ("new", "investigating", "escalated", "closed"):
            raise ValueError("status must be new, investigating, escalated, or closed")
        return v


class AlertAssign(BaseModel):
    user_id: int


class GenerateAlertsRequest(BaseModel):
    count: int = 10


# ---------- Audit ----------

class AuditLogOut(BaseModel):
    id: int
    actor_username: Optional[str]
    action: str
    target_type: Optional[str]
    target_id: Optional[int]
    detail: Optional[str]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
