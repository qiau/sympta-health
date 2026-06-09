from fastapi import APIRouter, Depends, HTTPException, Request, status, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.user import User
from app.schemas.auth import LoginIn, LoginOut, RefreshOut, RegisterIn, TokenInfo
from app.schemas.user import UserOut
from app.services.auth_service import (
    register_user,
    authenticate_user,
    issue_login_tokens,
    refresh_tokens,
    logout_with_refresh_token,
)
from app.core.config import settings
from app.api.deps import get_current_user  


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    user = register_user(db, data)
    return user


@router.post("/login", response_model=LoginOut)
def login(data: LoginIn, response: Response, db: Session = Depends(get_db)):
    user = authenticate_user(db, data)

    (
        access_token,
        refresh_plain,
        access_expires_in,
        refresh_expires_in,
    ) = issue_login_tokens(db, user)

    response.set_cookie(
        key="refresh_token",
        value=refresh_plain,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/",
        max_age=refresh_expires_in,
    )

    tokens = TokenInfo(
        access_token=access_token,
        access_expires_in=access_expires_in,
        refresh_expires_in=refresh_expires_in,
    )

    return LoginOut(user=user, tokens=tokens)


@router.post("/refresh", response_model=RefreshOut)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_plain = request.cookies.get("refresh_token")

    if not refresh_plain:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
        )

    access_token, new_refresh_plain, access_expires_in = refresh_tokens(db, refresh_plain)

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_plain,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/",
        max_age=settings.REFRESH_DAYS_SHORT * 24 * 60 * 60,
    )

    return RefreshOut(
        access_token=access_token,
        access_expires_in=access_expires_in,
    )


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_plain = request.cookies.get("refresh_token")

    if refresh_plain:
        logout_with_refresh_token(db, refresh_plain)

    response.delete_cookie(
        key="refresh_token",
        path="/",
    )

    return {"detail": "Logged out"}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user