"""
Unit tests for Model Service and Inference Pipeline.
"""

import pytest
import numpy as np
from backend.model_service import ModelService

@pytest.fixture(scope="module")
def model_service():
    service = ModelService.get_instance()
    assert service.is_loaded, "Model failed to load"
    return service

def test_model_loads_successfully(model_service):
    assert model_service.is_loaded is True
    assert model_service._predictor is not None

def test_valid_student_prediction(model_service):
    student = {
        "age": 20,
        "gender": "Female",
        "study_hours_per_day": 5.0,
        "social_media_hours": 2.0,
        "netflix_hours": 1.0,
        "part_time_job": "No",
        "attendance_percentage": 92.0,
        "sleep_hours": 7.5,
        "diet_quality": "Good",
        "exercise_frequency": 3,
        "parental_education_level": "Bachelor",
        "internet_quality": "Good",
        "mental_health_rating": 8,
        "extracurricular_participation": "Yes"
    }
    result = model_service.predict(student)
    
    assert "predicted_score" in result
    assert isinstance(result["predicted_score"], float)
    assert 0.0 <= result["predicted_score"] <= 100.0
    assert result["band"] in ["Excellent", "Proficient", "Satisfactory", "Marginal", "Needs Support"]
    assert result["letter_grade"] in ["A", "B", "C", "D", "F"]
    assert "pass_fail" in result
    assert 0.0 <= result["pass_fail"]["pass_probability"] <= 1.0
    assert result["statistical_interval_95"]["lower"] <= result["predicted_score"] <= result["statistical_interval_95"]["upper"] or result["predicted_score"] in [0.0, 100.0]
    assert len(result["insights"]) > 0

def test_extreme_inputs_handling(model_service):
    # Minimum boundary
    min_student = {
        "age": 18,
        "gender": "Male",
        "study_hours_per_day": 0.0,
        "social_media_hours": 8.0,
        "netflix_hours": 6.0,
        "part_time_job": "Yes",
        "attendance_percentage": 50.0,
        "sleep_hours": 4.0,
        "diet_quality": "Poor",
        "exercise_frequency": 0,
        "parental_education_level": "No formal education",
        "internet_quality": "Poor",
        "mental_health_rating": 1,
        "extracurricular_participation": "No"
    }
    min_result = model_service.predict(min_student)
    assert 0.0 <= min_result["predicted_score"] <= 100.0
    assert min_result["band"] in ["Needs Support", "Marginal"]
    assert min_result["pass_fail"]["passed"] is False

    # Maximum boundary
    max_student = {
        "age": 22,
        "gender": "Female",
        "study_hours_per_day": 12.0,
        "social_media_hours": 0.5,
        "netflix_hours": 0.0,
        "part_time_job": "No",
        "attendance_percentage": 100.0,
        "sleep_hours": 8.5,
        "diet_quality": "Good",
        "exercise_frequency": 6,
        "parental_education_level": "Master",
        "internet_quality": "Good",
        "mental_health_rating": 10,
        "extracurricular_participation": "Yes"
    }
    max_result = model_service.predict(max_student)
    assert 0.0 <= max_result["predicted_score"] <= 100.0
    assert max_result["band"] == "Excellent"
    assert max_result["pass_fail"]["passed"] is True

def test_categorical_variations(model_service):
    base = {
        "age": 20,
        "gender": "Other",
        "study_hours_per_day": 4.0,
        "social_media_hours": 2.0,
        "netflix_hours": 1.5,
        "part_time_job": "No",
        "attendance_percentage": 85.0,
        "sleep_hours": 7.0,
        "diet_quality": "Fair",
        "exercise_frequency": 2,
        "parental_education_level": "High School",
        "internet_quality": "Average",
        "mental_health_rating": 6,
        "extracurricular_participation": "No"
    }
    for gender in ["Female", "Male", "Other"]:
        base["gender"] = gender
        res = model_service.predict(base)
        assert np.isfinite(res["predicted_score"])
