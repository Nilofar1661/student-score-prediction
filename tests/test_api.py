"""
Integration tests for FastAPI endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "documentation" in data

def test_health_check_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "Lasso" in data["model_name"]

def test_metadata_endpoint(client):
    response = client.get("/api/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "features" in data
    assert len(data["features"]) == 14
    assert "presets" in data
    assert len(data["presets"]) >= 3

def test_predict_endpoint_valid(client):
    payload = {
        "age": 20,
        "gender": "Female",
        "study_hours_per_day": 5.0,
        "social_media_hours": 2.0,
        "netflix_hours": 1.0,
        "part_time_job": "No",
        "attendance_percentage": 90.0,
        "sleep_hours": 7.0,
        "diet_quality": "Good",
        "exercise_frequency": 3,
        "parental_education_level": "Bachelor",
        "internet_quality": "Good",
        "mental_health_rating": 8,
        "extracurricular_participation": "Yes"
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_score" in data
    assert 0.0 <= data["predicted_score"] <= 100.0
    assert "band" in data
    assert "pass_fail" in data
    assert "statistical_interval_95" in data
    assert len(data["insights"]) > 0

def test_predict_endpoint_invalid_payload(client):
    invalid_payload = {
        "age": 10, # too young (< 15)
        "gender": "Female",
        "study_hours_per_day": -5.0, # invalid negative
        "social_media_hours": 2.0,
        "netflix_hours": 1.0,
        "part_time_job": "No",
        "attendance_percentage": 90.0,
        "sleep_hours": 7.0,
        "diet_quality": "Good",
        "exercise_frequency": 3,
        "parental_education_level": "Bachelor",
        "internet_quality": "Good",
        "mental_health_rating": 8,
        "extracurricular_participation": "Yes"
    }
    response = client.post("/api/predict", json=invalid_payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"

def test_insights_endpoint(client):
    response = client.get("/api/insights")
    assert response.status_code == 200
    data = response.json()
    assert "model_comparison" in data
    assert "eda_summary" in data

def test_history_flow(client):
    # Predict first
    payload = {
        "age": 21,
        "gender": "Male",
        "study_hours_per_day": 3.5,
        "social_media_hours": 2.5,
        "netflix_hours": 2.0,
        "part_time_job": "No",
        "attendance_percentage": 82.0,
        "sleep_hours": 6.5,
        "diet_quality": "Fair",
        "exercise_frequency": 2,
        "parental_education_level": "High School",
        "internet_quality": "Average",
        "mental_health_rating": 6,
        "extracurricular_participation": "No"
    }
    pred_res = client.post("/api/predict", json=payload)
    assert pred_res.status_code == 200
    pred_id = pred_res.json()["id"]

    # Retrieve history
    hist_res = client.get("/api/history")
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) > 0
    assert any(item["id"] == pred_id for item in history)

    # Delete single prediction
    del_res = client.delete(f"/api/history/{pred_id}")
    assert del_res.status_code == 200

    # Clear all history
    clear_res = client.delete("/api/history")
    assert clear_res.status_code == 200
    empty_res = client.get("/api/history")
    assert len(empty_res.json()) == 0
