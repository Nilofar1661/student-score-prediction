"""
Validation tests for Pydantic input schemas.
"""

import pytest
from pydantic import ValidationError
from backend.schemas import StudentInputSchema

def test_valid_schema():
    valid_data = {
        "age": 20,
        "gender": "Female",
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
    schema = StudentInputSchema(**valid_data)
    assert schema.age == 20
    assert schema.study_hours_per_day == 4.0

def test_negative_study_hours_fails():
    invalid_data = {
        "age": 20,
        "gender": "Female",
        "study_hours_per_day": -2.0,
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
    with pytest.raises(ValidationError):
        StudentInputSchema(**invalid_data)

def test_out_of_range_attendance():
    invalid_data = {
        "age": 20,
        "gender": "Female",
        "study_hours_per_day": 4.0,
        "social_media_hours": 2.0,
        "netflix_hours": 1.5,
        "part_time_job": "No",
        "attendance_percentage": 120.0,
        "sleep_hours": 7.0,
        "diet_quality": "Fair",
        "exercise_frequency": 2,
        "parental_education_level": "High School",
        "internet_quality": "Average",
        "mental_health_rating": 6,
        "extracurricular_participation": "No"
    }
    with pytest.raises(ValidationError):
        StudentInputSchema(**invalid_data)

def test_invalid_category_fails():
    invalid_data = {
        "age": 20,
        "gender": "UnknownGender",
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
    with pytest.raises(ValidationError):
        StudentInputSchema(**invalid_data)
