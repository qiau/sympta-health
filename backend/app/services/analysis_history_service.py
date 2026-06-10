from sqlalchemy.orm import Session

from app.db.models.analysis_history import AnalysisHistory, AnalysisStatus
from app.services.llm.analyzer import analyze_patient_complaint
from app.db.models.user import User
from app.schemas.analysis_history import AnalysisHistoryIn

def create_analysis_history(
    db: Session,
    user: User,
    data: AnalysisHistoryIn,
) -> AnalysisHistory:

    record = AnalysisHistory(
        user_id=user.id,
        teks_keluhan=data.teks_keluhan,
        status=AnalysisStatus.processing,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    try:
        print("=" * 60)
        print("📝 TEKS ASLI:")
        print(data.teks_keluhan)

        result = analyze_patient_complaint(data.teks_keluhan)

        record.hasil_ekstraksi = None
        record.prediksi_penyakit = result["disease"]
        record.top_predictions = result["top_predictions"]
        record.confidence_score = result["confidence_score"]
        record.rekomendasi_tindakan = result["recommendation"]
        
        record.status = AnalysisStatus.success
        record.error_message = None
    except Exception as e:
        record.status = AnalysisStatus.failed
        record.error_message = "Gagal memproses keluhan, silahkan coba lagi."

    db.commit()
    db.refresh(record)

    return record

def list_analysis_history(
    db: Session,
    user: User,
    skip: int = 0,
    limit: int = 20,
) -> tuple[list[AnalysisHistory], int]:
    base_q = db.query(AnalysisHistory).filter(
        AnalysisHistory.user_id == user.id
    )

    total: int = base_q.count()

    records: list[AnalysisHistory] = (
        base_q
        .order_by(AnalysisHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return records, total

def get_analysis_history_by_id(
    db: Session,
    user: User,
    history_id: int,
) -> AnalysisHistory | None:
    record: AnalysisHistory | None = (
        db.query(AnalysisHistory)
        .filter(
            AnalysisHistory.id == history_id,
            AnalysisHistory.user_id == user.id,  
        )
        .first()
    )
    return record