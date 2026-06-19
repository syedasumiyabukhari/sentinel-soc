"""
Admin-only user management: list accounts, change roles, activate/deactivate.

Promoting someone to admin is the only way a second admin account can ever
exist (registration always assigns viewer after the first account), so this
router is the deliberate, audited path for that instead of self-service.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role, get_current_user
from app.models.user import User
from app.schemas import UserOut, RoleUpdateRequest, UserActiveUpdateRequest
from app.services.audit_service import write_audit_log

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[UserOut])
def list_users(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    return db.query(User).order_by(User.created_at.asc()).all()


@router.patch("/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    payload: RoleUpdateRequest,
    request: Request,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    if target.id == current_user.id and payload.role != "admin":
        raise HTTPException(
            status_code=400,
            detail="You can't remove your own admin role. Have another admin do this instead.",
        )

    old_role = target.role
    target.role = payload.role
    db.commit()
    db.refresh(target)

    write_audit_log(
        db, action="role_changed", actor=current_user, target_type="user", target_id=target.id,
        detail=f"'{current_user.username}' changed {target.username}'s role from '{old_role}' to '{payload.role}'",
        ip_address=request.client.host if request.client else None,
    )
    return target


@router.patch("/{user_id}/active", response_model=UserOut)
def update_user_active(
    user_id: int,
    payload: UserActiveUpdateRequest,
    request: Request,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    if target.id == current_user.id and not payload.is_active:
        raise HTTPException(status_code=400, detail="You can't deactivate your own account")

    target.is_active = payload.is_active
    db.commit()
    db.refresh(target)

    action = "user_activated" if payload.is_active else "user_deactivated"
    write_audit_log(
        db, action=action, actor=current_user, target_type="user", target_id=target.id,
        detail=f"'{current_user.username}' {'activated' if payload.is_active else 'deactivated'} {target.username}'s account",
        ip_address=request.client.host if request.client else None,
    )
    return target
