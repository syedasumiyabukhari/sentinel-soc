"""
Authentication endpoints: register, login (with optional 2FA step), 2FA setup.
"""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_two_fa_pending_token,
    decode_two_fa_pending_token,
    get_current_user,
    generate_totp_secret,
    get_totp_uri,
    verify_totp_code,
    generate_qr_code_base64,
)
from app.models.user import User
from app.schemas import (
    UserCreate,
    UserOut,
    Token,
    LoginRequiresTwoFactor,
    TwoFactorVerifyLogin,
    TwoFactorSetupOut,
    TwoFactorEnableRequest,
    TwoFactorDisableRequest,
)
from app.services.audit_service import write_audit_log

router = APIRouter(prefix="/api/auth", tags=["auth"])

MAX_FAILED_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, request: Request, db: Session = Depends(get_db)):
    existing_username = db.query(User).filter(User.username == payload.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="That username is already taken")

    existing_email = db.query(User).filter(User.email == payload.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="An account with that email already exists")

    # Role is decided server-side, never trusted from the client. The very first
    # account on a fresh install becomes admin automatically (there is no one
    # else yet to grant that role); every account after that defaults to the
    # least-privileged role. Promotions happen later via an existing admin.
    is_first_user = db.query(User).count() == 0
    assigned_role = "admin" if is_first_user else "viewer"

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=assigned_role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    write_audit_log(
        db, action="user_created", actor=user, target_type="user", target_id=user.id,
        detail=f"User '{user.username}' registered with role '{user.role}'",
        ip_address=request.client.host if request.client else None,
    )
    return user


@router.post("/login", response_model=None)
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()

    # Check lockout before even verifying the password, so a locked-out
    # attacker can't keep guessing during the lockout window.
    # SQLite doesn't store timezone info, so locked_until comes back naive -
    # treat it as UTC explicitly before comparing to an aware "now".
    if user and user.locked_until:
        locked_until = user.locked_until
        if locked_until.tzinfo is None:
            locked_until = locked_until.replace(tzinfo=timezone.utc)
        if locked_until > datetime.now(timezone.utc):
            remaining = int((locked_until - datetime.now(timezone.utc)).total_seconds() / 60) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many failed attempts. Try again in {remaining} minute(s).",
            )

    if not user or not verify_password(form_data.password, user.hashed_password):
        if user:
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
            if user.failed_login_attempts >= MAX_FAILED_LOGIN_ATTEMPTS:
                user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)
                write_audit_log(
                    db, action="account_locked", actor=user, target_type="auth",
                    detail=f"Account '{user.username}' locked after {user.failed_login_attempts} failed login attempts",
                    ip_address=request.client.host if request.client else None,
                )
            db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Successful password check - reset the failed-attempt counter.
    if user.failed_login_attempts:
        user.failed_login_attempts = 0
        user.locked_until = None
        db.commit()

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive")

    if user.totp_enabled:
        # Password verified, but a second factor is still required before issuing a real token.
        pending_token = create_two_fa_pending_token(user.username)
        return LoginRequiresTwoFactor(two_fa_token=pending_token)

    token = create_access_token(data={"sub": user.username, "role": user.role})

    write_audit_log(
        db, action="login", actor=user, target_type="auth",
        detail=f"User '{user.username}' logged in",
        ip_address=request.client.host if request.client else None,
    )

    return Token(access_token=token, user=user)


@router.post("/login/verify-2fa", response_model=Token)
def verify_login_2fa(payload: TwoFactorVerifyLogin, request: Request, db: Session = Depends(get_db)):
    username = decode_two_fa_pending_token(payload.two_fa_token)
    user = db.query(User).filter(User.username == username).first()
    if not user or not user.totp_enabled or not user.totp_secret:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired 2FA session")

    if not verify_totp_code(user.totp_secret, payload.code):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect authentication code")

    token = create_access_token(data={"sub": user.username, "role": user.role})

    write_audit_log(
        db, action="login", actor=user, target_type="auth",
        detail=f"User '{user.username}' logged in (2FA verified)",
        ip_address=request.client.host if request.client else None,
    )

    return Token(access_token=token, user=user)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ---------- 2FA setup (requires an authenticated session) ----------

@router.post("/2fa/setup", response_model=TwoFactorSetupOut)
def setup_2fa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.totp_enabled:
        raise HTTPException(status_code=400, detail="Two-factor authentication is already enabled")

    secret = generate_totp_secret()
    current_user.totp_secret = secret
    db.commit()

    uri = get_totp_uri(secret, current_user.username)
    qr_b64 = generate_qr_code_base64(uri)

    return TwoFactorSetupOut(qr_code_base64=qr_b64, secret=secret)


@router.post("/2fa/enable", response_model=UserOut)
def enable_2fa(
    payload: TwoFactorEnableRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="Call /2fa/setup first to generate a secret")
    if not verify_totp_code(current_user.totp_secret, payload.code):
        raise HTTPException(status_code=400, detail="Incorrect authentication code")

    current_user.totp_enabled = True
    db.commit()
    db.refresh(current_user)

    write_audit_log(
        db, action="2fa_enabled", actor=current_user, target_type="user", target_id=current_user.id,
        detail=f"User '{current_user.username}' enabled two-factor authentication",
        ip_address=request.client.host if request.client else None,
    )
    return current_user


@router.post("/2fa/disable", response_model=UserOut)
def disable_2fa(
    payload: TwoFactorDisableRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    if not current_user.totp_secret or not verify_totp_code(current_user.totp_secret, payload.code):
        raise HTTPException(status_code=400, detail="Incorrect authentication code")

    current_user.totp_enabled = False
    current_user.totp_secret = None
    db.commit()
    db.refresh(current_user)

    write_audit_log(
        db, action="2fa_disabled", actor=current_user, target_type="user", target_id=current_user.id,
        detail=f"User '{current_user.username}' disabled two-factor authentication",
        ip_address=request.client.host if request.client else None,
    )
    return current_user
