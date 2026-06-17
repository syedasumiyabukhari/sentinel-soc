"""
Alert endpoints: list/filter, get detail, generate synthetic alerts,
triage status transitions, assignment, and dashboard stats.
"""
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func as sa_func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.alert import Alert
from app.models.user import User
from app.schemas import AlertOut, AlertStatusUpdate, AlertAssign, GenerateAlertsRequest
from app.services.alert_generator import generate_batch
from app.services.audit_service import write_audit_log

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

VALID_TRANSITIONS = {
    "new": {"investigating", "closed"},
    "investigating": {"escalated", "closed", "new"},
    "escalated": {"investigating", "closed"},
    "closed": {"new"},  # allow reopening
}


@router.get("", response_model=list[AlertOut])
def list_alerts(
    status_filter: Optional[str] = Query(None, alias="status"),
    severity: Optional[str] = Query(None),
    alert_type: Optional[str] = Query(None),
    source_ip: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Alert)
    if status_filter:
        q = q.filter(Alert.status == status_filter)
    if severity:
        q = q.filter(Alert.severity == severity)
    if alert_type:
        q = q.filter(Alert.alert_type == alert_type)
    if source_ip:
        q = q.filter(Alert.source_ip == source_ip)

    return q.order_by(Alert.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    total_today = db.query(Alert).filter(Alert.created_at >= today_start).count()
    open_count = db.query(Alert).filter(Alert.status != "closed").count()
    closed_count = db.query(Alert).filter(Alert.status == "closed").count()

    by_severity = dict(
        db.query(Alert.severity, sa_func.count(Alert.id))
        .filter(Alert.status != "closed")
        .group_by(Alert.severity)
        .all()
    )

    top_ips = (
        db.query(Alert.source_ip, sa_func.count(Alert.id).label("cnt"))
        .filter(Alert.source_ip.isnot(None))
        .group_by(Alert.source_ip)
        .order_by(sa_func.count(Alert.id).desc())
        .limit(5)
        .all()
    )

    by_status = dict(
        db.query(Alert.status, sa_func.count(Alert.id)).group_by(Alert.status).all()
    )

    return {
        "alerts_today": total_today,
        "open_count": open_count,
        "closed_count": closed_count,
        "by_severity": {
            "critical": by_severity.get("critical", 0),
            "high": by_severity.get("high", 0),
            "medium": by_severity.get("medium", 0),
            "low": by_severity.get("low", 0),
        },
        "by_status": by_status,
        "top_flagged_ips": [{"ip": ip, "count": cnt} for ip, cnt in top_ips],
    }


@router.get("/{alert_id}", response_model=AlertOut)
def get_alert(alert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.post("/generate", response_model=list[AlertOut])
async def generate_alerts(
    payload: GenerateAlertsRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "analyst")),
):
    count = max(1, min(payload.count, 50))
    alerts = await generate_batch(db, count=count)

    write_audit_log(
        db, action="alerts_generated", actor=current_user, target_type="alert",
        detail=f"{count} synthetic alert(s) generated",
        ip_address=request.client.host if request.client else None,
    )
    return alerts


@router.patch("/{alert_id}/status", response_model=AlertOut)
def update_status(
    alert_id: int,
    payload: AlertStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "analyst")),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    old_status = alert.status
    new_status = payload.status

    if new_status == old_status:
        return alert

    allowed = VALID_TRANSITIONS.get(old_status, set())
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from '{old_status}' to '{new_status}'. Allowed: {sorted(allowed)}",
        )

    alert.status = new_status
    if new_status == "closed":
        alert.closed_at = datetime.now(timezone.utc)
    else:
        alert.closed_at = None
    db.commit()
    db.refresh(alert)

    write_audit_log(
        db, action="alert_status_change", actor=current_user, target_type="alert", target_id=alert.id,
        detail=f"Status changed: {old_status} -> {new_status}",
        ip_address=request.client.host if request.client else None,
    )
    return alert


@router.patch("/{alert_id}/assign", response_model=AlertOut)
def assign_alert(
    alert_id: int,
    payload: AlertAssign,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "analyst")),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    assignee = db.query(User).filter(User.id == payload.user_id).first()
    if not assignee:
        raise HTTPException(status_code=404, detail="Assignee user not found")

    alert.assigned_to_id = assignee.id
    db.commit()
    db.refresh(alert)

    write_audit_log(
        db, action="alert_assigned", actor=current_user, target_type="alert", target_id=alert.id,
        detail=f"Assigned to '{assignee.username}'",
        ip_address=request.client.host if request.client else None,
    )
    return alert


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()
    return None
