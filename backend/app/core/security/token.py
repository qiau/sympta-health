from datetime import datetime, timedelta, timezone
from typing import Any, Dict
import secrets
import hashlib
from jose import jwt
from app.core.config import settings

ALGORITHM = "HS256"

def create_access_token(
    subject: str | int,
    expires_minutes: int | None = None,
    extra_claims: Dict[str, Any] | None = None,
) -> str:
    if expires_minutes is None:
        expires_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES

    to_encode: Dict[str, Any] = {}

    if extra_claims:
        to_encode.update(extra_claims)

    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode.update(
        {
            "sub": str(subject),
            "exp": expire,
        }
    )

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=ALGORITHM,
    )
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[ALGORITHM],
    )
    return payload

def generate_refresh_token() -> str:
    return secrets.token_urlsafe(32)

def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def create_token_pair(
    user_id: int,
    access_expires_minutes: int | None = None,
    extra_claims: Dict[str, Any] | None = None,
):
    access_token = create_access_token(
        subject=user_id,
        expires_minutes=access_expires_minutes,
        extra_claims=extra_claims,
    )

    refresh_token_plain = generate_refresh_token()
    refresh_token_hash = hash_refresh_token(refresh_token_plain)

    return access_token, refresh_token_plain, refresh_token_hash