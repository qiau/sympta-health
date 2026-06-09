import math

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.user import User
from app.api.deps import require_admin
from app.services.dataset_service import activate_dataset_service, delete_dataset_service, get_dataset_active, get_dataset_file, get_dataset_or_404, list_dataset, process_upload
from app.schemas.dataset import DatasetOut, DatasetPage

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/upload-dataset", response_model=DatasetOut, status_code=status.HTTP_201_CREATED)
def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    try:
        dataset = process_upload(file, db, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return dataset

@router.get("/dataset", response_model=DatasetPage)
def get_dataset(
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if page < 1:
        page = 1
    if limit <= 0:
        limit = 20

    skip = (page - 1) * limit

    items, total = list_dataset(
        db=db,
        user=current_user,
        skip=skip,
        limit=limit,
    )

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return DatasetPage(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )

@router.get("/dataset/active")
def get_active_datasets(
    db: Session = Depends(get_db)
):
    
    return get_dataset_active(db=db)

@router.get("/dataset/{dataset_id}/download")
def download_dataset(
    dataset_id: int,
    db: Session = Depends(get_db)
):
    dataset = get_dataset_or_404(db, dataset_id)
    file_path = get_dataset_file(dataset)

    return FileResponse(
        path=file_path,
        filename=dataset.filename,
        media_type="text/csv",
    )

@router.patch("/dataset/{dataset_id}/activate")
def activate_dataset(
    dataset_id: int,
    db: Session = Depends(get_db)
):
    return activate_dataset_service(db, dataset_id)

@router.delete("/dataset/{dataset_id}")
def delete_dataset(
    dataset_id: int,
    db: Session = Depends(get_db)
):
    delete_dataset_service(db, dataset_id)
    return {"message": "Dataset berhasil dihapus"}