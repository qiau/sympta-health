from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    DATABASE_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_DAYS_SHORT: int 
    REFRESH_DAYS_LONG: int
    COOKIE_SECURE: bool
    COOKIE_SAMESITE: str
    BACKEND_CORS_ORIGINS: List[str] = []
    STORAGE_DIR: str
    LLM_MODEL:str
    EMBEDDING_MODEL:str

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )

settings = Settings()
