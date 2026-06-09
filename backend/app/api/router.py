from fastapi import APIRouter

from app.api.routers import auth
from app.api.routers.user import analysis_histories
from app.api.routers.admin import datasets

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(analysis_histories.router)
api_router.include_router(datasets.router)