from pydantic import BaseModel, EmailStr
from app.schemas.user import UserOut

class TokenInfo(BaseModel):
    access_token: str
    token_type: str = "bearer"
    access_expires_in: int 
    refresh_expires_in: int

class RegisterIn(BaseModel):
    email: EmailStr      
    username: str
    password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class LoginOut(BaseModel):
    user: UserOut
    tokens: TokenInfo

class RefreshOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    access_expires_in: int
