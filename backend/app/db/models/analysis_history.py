from enum import Enum
from sqlalchemy import ForeignKey, DateTime, Index, Text, Enum as SAEnum, Float, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from datetime import datetime

class AnalysisStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    success = "success"
    failed = "failed"

class AnalysisHistory(Base):
    __tablename__ = "analysis_histories"
    id: Mapped[int] = mapped_column(
        primary_key=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False
    )
    teks_keluhan: Mapped[str] = mapped_column(Text, nullable=False)
    hasil_ekstraksi: Mapped[str | None] = mapped_column(Text, nullable=True)
    prediksi_penyakit: Mapped[str | None] = mapped_column(Text, nullable=True)
    top_predictions: Mapped[list] = mapped_column(
        JSONB, nullable=True
    )
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    rekomendasi_tindakan: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[AnalysisStatus] = mapped_column(
        SAEnum(AnalysisStatus, name="analysis_status_enum"),
        nullable=False,
        default=AnalysisStatus.pending,
        server_default=AnalysisStatus.pending.value,
    )
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
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
    
    user: Mapped["User"] = relationship(back_populates="analysis_histories")

    __table_args__ = (
        Index("ix_history_user_created", "user_id", "created_at"),
    )

