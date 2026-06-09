import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple

model = None
mlb_encoder = None
ord_encoder = None
label_encoder = None

def load_ml_model():
    global model, mlb_encoder, ord_encoder, label_encoder

    print("Loading Logistic Regression model...")

    bundle = joblib.load("ml_models/lr_model.pkl")

    model = bundle["model"]
    mlb_encoder = bundle["mlb_encoder"]
    ord_encoder = bundle["ord_encoder"]
    label_encoder = bundle["label_encoder"]

    print("Logistic Regression model loaded successfully!")


# ========================
# CONSTANT FEATURE
# ========================
MLB_FEATURES = ["diso", "anat", "chem", "drcn", "proc"]
ORD_FEATURES = ["age", "frkw", "drtn"]


# ========================
# HELPER
# ========================
def normalize_keys(features: Dict[str, Any]) -> Dict[str, Any]:
    return {k.lower(): v for k, v in features.items()}


# ========================
# ENCODING
# ========================
def encode_features(features: Dict[str, Any]) -> np.ndarray:
    features = normalize_keys(features)
    mlb_arrays = []

    for feat in MLB_FEATURES:
        values = features.get(feat, [])

        if values is None:
            values = []
        elif isinstance(values, str):
            values = [values]
        elif not isinstance(values, list):
            values = []

        values = [str(v).lower() for v in values]

        mlb = mlb_encoder[feat]
        encoded = mlb.transform([values])
        mlb_arrays.append(encoded)

    X_mlb = np.hstack(mlb_arrays)

    ordinal_values = []
    for i, feat in enumerate(ORD_FEATURES):
        val = features.get(feat)

        if val is None or str(val).strip() == "":
            val = "unknown"
        else:
            val = str(val).lower()

        known_categories = ord_encoder.categories_[i]
        if val not in known_categories:
            val = "unknown"

        ordinal_values.append(val)

    ordinal_dict = {
        feat: ordinal_values[i]
        for i, feat in enumerate(ORD_FEATURES)
    }

    ordinal_df = pd.DataFrame([ordinal_dict])

    X_ordinal = ord_encoder.transform(ordinal_df)

    X = np.hstack([X_mlb, X_ordinal])

    return X


# ========================
# PREDICT
# ========================
def predict_disease(
    features: Dict[str, Any],
    top_k: int = 3
) -> Tuple[str, float, List[Dict[str, float]]]:

    # 🔥 SAFETY CHECK
    if model is None:
        raise Exception("Model LR belum di-load. Pastikan load_ml_model() dipanggil saat startup.")

    X = encode_features(features)
    probs = model.predict_proba(X)[0]
    top_idx = np.argsort(probs)[-top_k:][::-1]

    top_predictions = [
        {
            "label": label_encoder.classes_[i],
            "score": float(probs[i])
        }
        for i in top_idx
    ]

    disease = top_predictions[0]["label"]
    confidence_score = top_predictions[0]["score"]

    return disease, confidence_score, top_predictions