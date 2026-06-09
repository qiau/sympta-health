import os
import shutil
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
import pandas as pd

from app.core.config import settings
from app.db.models.user import User
from app.db.models.dataset import Dataset, DatasetStatus
from app.services.rag.ingestion import process_embedding_pipeline

def process_upload(file: UploadFile, db:Session, user:User):
    if not file.filename.endswith(".csv"):
        raise ValueError("File harus CSV")
      
    contents = file.file.read()

    dataset = Dataset(
        filename=file.filename, 
        filepath="",
        file_size=len(contents),
        user_id=user.id,
        status=DatasetStatus.processing  
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    dataset_dir = os.path.join(
        settings.STORAGE_DIR,
        f"dataset_{dataset.id}"
    )

    filepath = os.path.join(dataset_dir, "raw.csv")

    dataset.filepath = filepath
    dataset.dataset_dir = dataset_dir
    db.commit()

    try:
        os.makedirs(dataset_dir, exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(contents)

        df = pd.read_csv(filepath)
        df.columns = [col.lower().strip() for col in df.columns]

        REQUIRED_COLUMNS = {"question", "answer", "label"}

        if not REQUIRED_COLUMNS.issubset(set(df.columns)):
            missing = REQUIRED_COLUMNS - set(df.columns)
            raise ValueError(f"Kolom tidak lengkap. Kurang: {', '.join(missing)}")

        if len(df) == 0:
            raise ValueError("Dataset kosong")
        
        process_embedding_pipeline(filepath, dataset_dir)

        dataset.row_count = len(df)
        dataset.status = DatasetStatus.success

        db.commit()
        db.refresh(dataset)

        return dataset

    except Exception as e:
        chroma_dir = os.path.join(dataset_dir, "chroma")

        if os.path.exists(chroma_dir):
            shutil.rmtree(chroma_dir)

        dataset.status = DatasetStatus.failed
        db.commit()

        raise ValueError(f"Pipeline error: {str(e)}")
    
def list_dataset(
    db: Session,
    user: User,
    skip: int = 0,
    limit: int = 20,
) -> tuple[list[Dataset], int]:
    base_q = db.query(Dataset).filter(
        Dataset.user_id == user.id
    )

    total: int = base_q.count()

    records: list[Dataset] = (
        base_q
        .order_by(Dataset.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return records, total

def get_dataset_or_404(db: Session, dataset_id: int) -> Dataset:
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()

    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset tidak ditemukan")

    return dataset

def get_dataset_file(dataset: Dataset) -> str:
    if not dataset.filepath or not os.path.exists(dataset.filepath):
        raise HTTPException(status_code=404, detail="File tidak ditemukan")

    return dataset.filepath

def get_dataset_active(db: Session) -> Dataset:
    dataset = (
        db.query(Dataset)
        .filter(
            Dataset.is_active == True,
            Dataset.status == DatasetStatus.success
        )
        .first()
    )
    
    return dataset

def activate_dataset_service(db: Session, dataset_id: int) -> Dataset:
    dataset = get_dataset_or_404(db, dataset_id)

    if dataset.status != "success":
        raise HTTPException(
            status_code=400,
            detail="Hanya dataset dengan status success yang bisa diaktifkan",
        )

    db.query(Dataset).update({Dataset.is_active: False})

    dataset.is_active = True

    db.commit()
    db.refresh(dataset)

    return dataset

def delete_dataset_service(db: Session, dataset_id: int):
    dataset = get_dataset_or_404(db, dataset_id)

    if dataset.is_active:
        raise HTTPException(
            status_code=400,
            detail="Tidak bisa menghapus dataset yang sedang aktif",
        )
    
    dataset_dir = dataset.dataset_dir

    try:
        if dataset_dir and os.path.exists(dataset_dir):
            try:
                shutil.rmtree(dataset_dir)
                print(f"✅ Folder berhasil dihapus: {dataset_dir}")
            except Exception as e:
                print(f"⚠️ Gagal hapus folder (akan dibersihkan saat cronjob): {e}")

        db.delete(dataset)
        db.commit()

        return {"message": "Dataset berhasil dihapus"}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Gagal menghapus dataset: {str(e)}"
        )