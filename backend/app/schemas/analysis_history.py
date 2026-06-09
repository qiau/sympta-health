from datetime import datetime
from app.db.models.analysis_history import AnalysisStatus
from pydantic import BaseModel, ConfigDict
from typing import List

class AnalysisHistoryIn(BaseModel):
    teks_keluhan: str

class PredictionItem(BaseModel):
    label: str
    score: float

class AnalysisHistoryOut(BaseModel):
    id: int
    user_id: int
    teks_keluhan: str
    hasil_ekstraksi: str | None = None
    prediksi_penyakit: str | None = None
    top_predictions: List[PredictionItem] | None = None
    confidence_score: float | None = None  
    rekomendasi_tindakan: str | None = None
    status: AnalysisStatus
    error_message: str | None = None
    created_at: datetime 
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AnalysisHistoryPage(BaseModel):
    items: list[AnalysisHistoryOut]
    total: int
    page: int
    limit: int
    total_pages: int