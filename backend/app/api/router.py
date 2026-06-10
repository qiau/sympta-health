from fastapi import APIRouter

from app.api.routers import auth
from app.api.routers.user import analysis_histories

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(analysis_histories.router)