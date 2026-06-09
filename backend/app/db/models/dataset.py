from sqlalchemy import ForeignKey, DateTime, Index, String, func, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from datetime import datetime
from enum import Enum

class DatasetStatus(str, Enum):
    processing ="processing"
    success = "success"
    failed = "failed"

class Dataset(Base):
    __tablename__ = "datasets"
    id: Mapped[int] = mapped_column(
        primary_key=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    filepath: Mapped[str] = mapped_column(String(255), nullable=False)
    dataset_dir: Mapped[str | None] = mapped_column(String(255), nullable=True)
    file_size: Mapped[int] = mapped_column(nullable=False, default=0)
    row_count: Mapped[int] = mapped_column(nullable=False, default=0)
    status: Mapped[DatasetStatus] = mapped_column(
        SAEnum(DatasetStatus, name="dataset_status_enum"),  
        nullable=False,
        default=DatasetStatus.processing,
        server_default=DatasetStatus.processing.value,
    )
    is_active: Mapped[bool] = mapped_column(nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False
    )
    
    user: Mapped["User"] = relationship(back_populates="datasets")

    __table_args__ = (
        Index("ix_datasets_user_created", "user_id", "created_at"),
    )