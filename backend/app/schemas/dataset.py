from datetime import datetime
from app.db.models.dataset import DatasetStatus
from pydantic import BaseModel, ConfigDict

class DatasetIn(BaseModel):
    file: bytes

class DatasetOut(BaseModel):
    id: int
    user_id: int
    filename: str
    filepath: str
    dataset_dir: str | None = None
    row_count: int
    file_size: int
    status: DatasetStatus
    is_active: bool
    created_at: datetime 
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DatasetPage(BaseModel):
    items: list[DatasetOut]
    total: int
    page: int
    limit: int
    total_pages: int