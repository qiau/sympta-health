import os
import shutil

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.router import api_router
from app.db.session import SessionLocal
from app.db.models.dataset import Dataset
    
os.makedirs(settings.STORAGE_DIR, exist_ok=True)

def cleanup_orphan_datasets():
    db = SessionLocal()
    try:
        print("🧹 Cleanup dataset dimulai...")

        valid_ids = {f"dataset_{d.id}" for d in db.query(Dataset).all()}

        base_dir = settings.STORAGE_DIR

        if not os.path.exists(base_dir):
            return

        for folder in os.listdir(base_dir):
            full_path = os.path.join(base_dir, folder)

            if not os.path.isdir(full_path):
                continue

            if not folder.startswith("dataset_"):
                continue

            if folder not in valid_ids:
                try:
                    shutil.rmtree(full_path)
                    print(f"🗑️ Deleted orphan: {folder}")
                except Exception as e:
                    print(f"⚠️ Gagal hapus {folder}: {e}")

        print("✅ Cleanup selesai")

    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    cleanup_orphan_datasets()
    
    yield
    
app = FastAPI(
    title="Backend Final Project",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

app.include_router(api_router)

@app.get("/")
def root():
    return {"message": "API running successfully!"}