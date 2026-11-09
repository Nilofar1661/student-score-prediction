"""
Model Service module for Student Score Prediction.
Defines feature transformations, prediction orchestration, and artifact loading.
"""

import json
import logging
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional

import numpy as np
import pandas as pd
import joblib
from sklearn.base import BaseEstimator, TransformerMixin

logger = logging.getLogger("model_service")

# Ensure repository root is on sys.path for unpickling & portable imports
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

def _resolve_artifact_path(relative_path: str) -> Path:
    """Robustly resolve artifact path across diverse cloud deployment working directories."""
    candidates = [
        BASE_DIR / relative_path,
        Path.cwd() / relative_path,
        Path(__file__).resolve().parent / relative_path,
        Path.cwd() / ".." / relative_path,
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate.resolve()
    return (BASE_DIR / relative_path).resolve()

MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"
MODEL_PATH = _resolve_artifact_path("models/model_pipeline.joblib")
METADATA_PATH = _resolve_artifact_path("models/feature_metadata.json")
EDA_PATH = _resolve_artifact_path("reports/eda_summary.json")
MODEL_COMPARISON_PATH = _resolve_artifact_path("reports/model_comparison.json")

FEATURE_NAMES = [
    'age', 'study_hours_per_day', 'social_media_hours', 'netflix_hours',
    'part_time_job', 'attendance_percentage', 'sleep_hours', 'exercise_frequency',
    'parental_education_level', 'mental_health_rating', 'extracurricular_participation',
    'entertainment_time', 'health_score', 'gender_Female', 'gender_Male', 'gender_Other',
    'diet_quality_Fair', 'diet_quality_Good', 'diet_quality_Poor',
    'internet_quality_Average', 'internet_quality_Good', 'internet_quality_Poor'
]

EDUCATION_MAPPING = {
    "no formal education": 0,
    "high school": 1,
    "bachelor": 2,
    "master": 3
}


class StudentFeatureTransformer(BaseEstimator, TransformerMixin):
    """Transforms raw dictionary or DataFrame inputs into the exact 22-column model matrix."""
    def __init__(self):
        self.feature_names_ = FEATURE_NAMES

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        if isinstance(X, dict):
            df = pd.DataFrame([X])
        elif isinstance(X, list):
            df = pd.DataFrame(X)
        else:
            df = X.copy()

        # Deterministic feature derivations
        entertainment_time = df['social_media_hours'].astype(float) + df['netflix_hours'].astype(float)
        health_score = df['sleep_hours'].astype(float) + df['exercise_frequency'].astype(float)

        # Binary mappings
        part_time = df['part_time_job'].map(lambda v: 1 if str(v).strip().lower() in ['yes', '1', 'true'] else 0)
        extracurricular = df['extracurricular_participation'].map(lambda v: 1 if str(v).strip().lower() in ['yes', '1', 'true'] else 0)

        # Ordinal mapping
        def map_edu(val):
            k = str(val).strip().lower()
            return EDUCATION_MAPPING.get(k, 1)

        parental_edu = df['parental_education_level'].map(map_edu)

        # One-hot encodings with strict schema adherence
        gender_str = df['gender'].astype(str).str.strip().str.capitalize()
        gender_female = (gender_str == 'Female').astype(int)
        gender_male = (gender_str == 'Male').astype(int)
        gender_other = (~gender_str.isin(['Female', 'Male'])).astype(int)

        diet_str = df['diet_quality'].astype(str).str.strip().str.capitalize()
        diet_fair = (diet_str == 'Fair').astype(int)
        diet_good = (diet_str == 'Good').astype(int)
        diet_poor = (diet_str == 'Poor').astype(int)

        net_str = df['internet_quality'].astype(str).str.strip().str.capitalize()
        net_avg = (net_str == 'Average').astype(int)
        net_good = (net_str == 'Good').astype(int)
        net_poor = (net_str == 'Poor').astype(int)

        matrix = pd.DataFrame({
            'age': df['age'].astype(float),
            'study_hours_per_day': df['study_hours_per_day'].astype(float),
            'social_media_hours': df['social_media_hours'].astype(float),
            'netflix_hours': df['netflix_hours'].astype(float),
            'part_time_job': part_time,
            'attendance_percentage': df['attendance_percentage'].astype(float),
            'sleep_hours': df['sleep_hours'].astype(float),
            'exercise_frequency': df['exercise_frequency'].astype(float),
            'parental_education_level': parental_edu,
            'mental_health_rating': df['mental_health_rating'].astype(float),
            'extracurricular_participation': extracurricular,
            'entertainment_time': entertainment_time,
            'health_score': health_score,
            'gender_Female': gender_female,
            'gender_Male': gender_male,
            'gender_Other': gender_other,
            'diet_quality_Fair': diet_fair,
            'diet_quality_Good': diet_good,
            'diet_quality_Poor': diet_poor,
            'internet_quality_Average': net_avg,
            'internet_quality_Good': net_good,
            'internet_quality_Poor': net_poor,
        })

        return matrix[self.feature_names_]


class StudentScorePredictor:
    """Production predictor encapsulating feature transformation, regression, uncertainty estimation, and classification."""
    def __init__(self, reg_model, clf_model, transformer, residual_std, baseline_metrics):
        self.reg_model = reg_model
        self.clf_model = clf_model
        self.transformer = transformer
        self.residual_std = float(residual_std)
        self.baseline_metrics = baseline_metrics

    def predict_one(self, student_dict: dict) -> dict:
        X_mat = self.transformer.transform(student_dict)
        raw_pred = float(self.reg_model.predict(X_mat)[0])

        # Clamped display score within legitimate academic boundaries [0, 100]
        clamped_score = float(np.clip(raw_pred, 0.0, 100.0))

        # Scientific prediction interval (95% confidence level ~ 1.96 * s_e)
        margin_95 = 1.96 * self.residual_std
        lower_bound_95 = float(np.clip(raw_pred - margin_95, 0.0, 100.0))
        upper_bound_95 = float(np.clip(raw_pred + margin_95, 0.0, 100.0))

        # Pass / fail prediction from calibrated classifier
        pass_prob = float(self.clf_model.predict_proba(X_mat)[0, 1])
        pass_predicted = bool(pass_prob >= 0.5)

        # Performance band
        if clamped_score >= 85:
            band = "Excellent"
            letter_grade = "A"
        elif clamped_score >= 70:
            band = "Proficient"
            letter_grade = "B"
        elif clamped_score >= 50:
            band = "Satisfactory"
            letter_grade = "C"
        elif clamped_score >= 40:
            band = "Marginal"
            letter_grade = "D"
        else:
            band = "Needs Support"
            letter_grade = "F"

        # Key drivers explanation based on feature values and weights
        coefs = dict(zip(FEATURE_NAMES, self.reg_model.coef_))
        study_hours = float(student_dict.get('study_hours_per_day', 0))
        entertainment = float(student_dict.get('social_media_hours', 0)) + float(student_dict.get('netflix_hours', 0))
        attendance = float(student_dict.get('attendance_percentage', 0))
        mental_health = float(student_dict.get('mental_health_rating', 5))

        insights = []
        if study_hours >= 6.0:
            insights.append(f"High daily study volume ({study_hours} hrs/day) strongly propels performance (+{study_hours * coefs['study_hours_per_day']:.1f} estimated contribution).")
        elif study_hours < 2.0:
            insights.append(f"Limited study time ({study_hours} hrs/day) restricts potential exam score. Adding 2 study hours daily could increase score by ~{2 * coefs['study_hours_per_day']:.1f} marks.")
        else:
            insights.append(f"Moderate study time ({study_hours} hrs/day) provides a balanced study base.")

        if entertainment > 4.5:
            insights.append(f"Elevated screen entertainment ({entertainment:.1f} hrs/day total) presents a noticeable headwind on retention.")
        elif entertainment <= 2.0:
            insights.append(f"Low entertainment distraction ({entertainment:.1f} hrs/day) supports strong academic focus.")

        if attendance < 75:
            insights.append(f"Attendance percentage ({attendance:.1f}%) is below optimal academic threshold (75%+ recommended).")
        else:
            insights.append(f"Solid attendance ({attendance:.1f}%) ensures steady classroom engagement.")

        if mental_health >= 8:
            insights.append(f"High mental well-being rating ({mental_health}/10) provides positive cognitive resilience.")
        elif mental_health <= 3:
            insights.append(f"Lower mental well-being rating ({mental_health}/10) indicates stress or academic fatigue.")

        # Out-of-distribution check / warnings
        warnings = []
        if study_hours > 12.0:
            warnings.append("Study hours exceed 12 hrs/day, which is in the extreme upper 1% of the training distribution.")
        if attendance < 60.0:
            warnings.append("Attendance is below 60%, which is near the lower boundary of observed training data.")
        if raw_pred > 100.0:
            warnings.append(f"Unclamped regression projection ({raw_pred:.1f}) exceeded 100 marks; score capped at maximum 100.0.")
        elif raw_pred < 0.0:
            warnings.append(f"Unclamped regression projection ({raw_pred:.1f}) was below 0 marks; score adjusted to minimum 0.0.")

        pred_id = f"pred_{uuid.uuid4().hex[:10]}"
        timestamp = datetime.now(timezone.utc).isoformat()

        return {
            "id": pred_id,
            "timestamp": timestamp,
            "predicted_score": round(clamped_score, 2),
            "raw_predicted_score": round(raw_pred, 2),
            "scale": "0 to 100 marks",
            "band": band,
            "letter_grade": letter_grade,
            "pass_fail": {
                "passed": pass_predicted,
                "pass_probability": round(pass_prob, 3),
                "passing_threshold": 50.0
            },
            "statistical_interval_95": {
                "lower": round(lower_bound_95, 2),
                "upper": round(upper_bound_95, 2),
                "residual_std": round(self.residual_std, 2),
                "confidence_level": "95%",
                "method": "Empirical Training Residual Standard Error (1.96 * s_e)"
            },
            "insights": insights,
            "warnings": warnings,
            "model_used": "Lasso Regularized Regression (alpha=0.1)",
            "submitted_inputs": student_dict
        }


class ModelService:
    """Singleton service to manage model loading and prediction lifecycle."""
    _instance = None
    _predictor: Optional[StudentScorePredictor] = None
    _metadata: Optional[Dict[str, Any]] = None
    _insights: Optional[Dict[str, Any]] = None

    @classmethod
    def get_instance(cls) -> "ModelService":
        if cls._instance is None:
            cls._instance = cls()
            cls._instance._load()
        return cls._instance

    def _load(self):
        """Loads model pipeline and metadata from disk."""
        model_path = _resolve_artifact_path("models/model_pipeline.joblib")
        metadata_path = _resolve_artifact_path("models/feature_metadata.json")

        if not model_path.exists():
            logger.warning(f"Model file not found at {model_path}. Attempting to trigger training pipeline...")
            from training.train_pipeline import train_and_save
            train_and_save()
            model_path = _resolve_artifact_path("models/model_pipeline.joblib")

        logger.info(f"Loading production model from {model_path}")
        self._predictor = joblib.load(model_path)

        if metadata_path.exists():
            with open(metadata_path, "r", encoding="utf-8") as f:
                self._metadata = json.load(f)
        else:
            self._metadata = {}

        self._refresh_insights()

    def _refresh_insights(self):
        comparison = {}
        eda = {}
        comparison_path = _resolve_artifact_path("reports/model_comparison.json")
        eda_path = _resolve_artifact_path("reports/eda_summary.json")

        if comparison_path.exists():
            with open(comparison_path, "r", encoding="utf-8") as f:
                comparison = json.load(f)
        if eda_path.exists():
            with open(eda_path, "r", encoding="utf-8") as f:
                eda = json.load(f)

        self._insights = {
            "model_comparison": comparison,
            "eda_summary": eda
        }

    @property
    def is_loaded(self) -> bool:
        return self._predictor is not None

    def predict(self, student_input: dict) -> dict:
        if self._predictor is None:
            self._load()
        return self._predictor.predict_one(student_input)

    def get_metadata(self) -> dict:
        if self._metadata is None:
            self._load()
        return self._metadata or {}

    def get_insights(self) -> dict:
        if self._insights is None:
            self._refresh_insights()
        return self._insights or {}
