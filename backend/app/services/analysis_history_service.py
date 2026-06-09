import json
from sqlalchemy.orm import Session

from app.db.models.analysis_history import AnalysisHistory, AnalysisStatus
from app.db.models.user import User
from app.services.ner.ner_service import extract_features
from app.services.normalization.normalizer import normalize_extraction
from app.services.ml.ml_service import predict_disease
from app.services.rag.pipeline import run_rag
from app.services.dataset_service import get_dataset_active
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

        extraction = extract_features(data.teks_keluhan)
        print("\n🔍 HASIL EKSTRAKSI (NER):")
        print(extraction)
        
        normalized = normalize_extraction(extraction)
        print("\n🧹 HASIL NORMALISASI:")
        print(normalized)
        
        disease, confidence_score, top_predictions = predict_disease(normalized)
        print("\n🧠 PREDIKSI PENYAKIT:")
        print(disease, confidence_score)

        dataset = get_dataset_active(db)

        if not dataset:
            raise Exception("Dataset sumber tidak ditemukan")

        dataset_dir = dataset.dataset_dir

        if confidence_score >= 0.1:
            recommendation = run_rag(
                query=data.teks_keluhan,
                penyakit=disease,
                dataset_dir=dataset_dir
            )

        else:
            disease = "Tidak Diketahui"
            recommendation = (
                "Tingkat keyakinan prediksi rendah. "
                "Silakan konsultasikan dengan tenaga medis profesional untuk diagnosis yang akurat."
            )

        record.hasil_ekstraksi = json.dumps(extraction)
        record.prediksi_penyakit = disease
        record.top_predictions = top_predictions
        record.confidence_score = confidence_score
        record.rekomendasi_tindakan = recommendation
        
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