from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security.password import hash_password, verify_password
from app.core.security.token import create_token_pair, hash_refresh_token
from app.db.models.user import User
from app.db.models.refresh_token import RefreshToken
from app.schemas.auth import RegisterIn, LoginIn


def register_user(db: Session, data: RegisterIn) -> User:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar",
        )

    user = User(
        email=data.email,
        username=data.username,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, data: LoginIn) -> User:
    user: User | None = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email belum terdaftar"
        )

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kata sandi tidak sesuai"
        )
    return user


def issue_login_tokens(
    db: Session,
    user: User,
) -> tuple[str, str, int, int]:
    access_token, refresh_plain, refresh_hash = create_token_pair(
        user_id=user.id,
        extra_claims={"email": user.email},
    )

    refresh_days = settings.REFRESH_DAYS_SHORT
    now = datetime.now(timezone.utc)
    refresh_expires_at = now + timedelta(days=refresh_days)

    db_token = RefreshToken(
        user_id=user.id,
        token_hash=refresh_hash,
        expires_at=refresh_expires_at,
        revoked=False,
        last_used_at=None,
    )
    db.add(db_token)
    db.commit()

    access_expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    refresh_expires_in = refresh_days * 24 * 60 * 60

    return access_token, refresh_plain, access_expires_in, refresh_expires_in


def refresh_tokens(
    db: Session,
    refresh_plain: str,
) -> tuple[str, str, int]:
    refresh_hash = hash_refresh_token(refresh_plain)
    now = datetime.now(timezone.utc)

    token_db: RefreshToken | None = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == refresh_hash,
            RefreshToken.revoked.is_(False),
            RefreshToken.expires_at > now,
        )
        .first()
    )

    if token_db is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user: User | None = db.get(User, token_db.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    token_db.revoked = True
    token_db.last_used_at = now

    access_token, new_refresh_plain, new_refresh_hash = create_token_pair(
        user_id=user.id,
        extra_claims={"email": user.email},
    )

    refresh_days = settings.REFRESH_DAYS_SHORT
    new_expires_at = now + timedelta(days=refresh_days)

    new_db_token = RefreshToken(
        user_id=user.id,
        token_hash=new_refresh_hash,
        expires_at=new_expires_at,
        revoked=False,
        last_used_at=None,
    )
    db.add(new_db_token)
    db.commit()

    access_expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

    return access_token, new_refresh_plain, access_expires_in


def logout_with_refresh_token(
    db: Session,
    refresh_plain: str,
) -> None:
    refresh_hash = hash_refresh_token(refresh_plain)
    now = datetime.now(timezone.utc)

    token_db: RefreshToken | None = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == refresh_hash,
            RefreshToken.revoked.is_(False),
        )
        .first()
    )
    
    if token_db:
        token_db.revoked = True
        token_db.last_used_at = now
        db.commit()
