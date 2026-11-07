"""
Pydantic Schemas for Request Validation and Structured API Responses.
Strictly validates student inputs, data types, and acceptable ranges based on dataset distributions.
"""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, field_validator

GenderType = Literal["Female", "Male", "Other"]
DietType = Literal["Poor", "Fair", "Good"]
InternetType = Literal["Poor", "Average", "Good"]
ParentalEduType = Literal["No formal education", "High School", "Bachelor", "Master"]
YesNoType = Literal["Yes", "No"]

class StudentInputSchema(BaseModel):
    """Raw input features submitted by the user/frontend."""
    age: int = Field(
        ...,
        ge=15,
        le=35,
        description="Current age of the student (years, typical 17-25)."
    )
    gender: GenderType = Field(
        ...,
        description="Gender identity: 'Female', 'Male', or 'Other'."
    )
    study_hours_per_day: float = Field(
        ...,
        ge=0.0,
        le=20.0,
        description="Dedicated daily self-study hours outside regular classes (0.0 to 20.0)."
    )
    social_media_hours: float = Field(
        ...,
        ge=0.0,
        le=16.0,
        description="Hours per day spent on social media and messaging (0.0 to 16.0)."
    )
    netflix_hours: float = Field(
        ...,
        ge=0.0,
        le=16.0,
        description="Hours per day spent watching streaming entertainment/shows (0.0 to 16.0)."
    )
    part_time_job: YesNoType = Field(
        ...,
        description="Whether the student works a part-time job ('Yes' or 'No')."
    )
    attendance_percentage: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Percentage of lectures attended (0.0 to 100.0%)."
    )
    sleep_hours: float = Field(
        ...,
        ge=2.0,
        le=16.0,
        description="Average nightly sleep duration (2.0 to 16.0 hours)."
    )
    diet_quality: DietType = Field(
        ...,
        description="Quality of nutrition: 'Poor', 'Fair', or 'Good'."
    )
    exercise_frequency: int = Field(
        ...,
        ge=0,
        le=7,
        description="Exercise sessions or sports frequency in days per week (0 to 7)."
    )
    parental_education_level: ParentalEduType = Field(
        ...,
        description="Highest formal education level of parents/guardians."
    )
    internet_quality: InternetType = Field(
        ...,
        description="Reliability and speed of home internet: 'Poor', 'Average', or 'Good'."
    )
    mental_health_rating: int = Field(
        ...,
        ge=1,
        le=10,
        description="Self-rated mental well-being on an integer scale from 1 (poor) to 10 (excellent)."
    )
    extracurricular_participation: YesNoType = Field(
        ...,
        description="Participation in clubs, athletics, or societies ('Yes' or 'No')."
    )

    @field_validator("social_media_hours", "netflix_hours")
    @classmethod
    def validate_screen_time(cls, v, info):
        if v < 0:
            raise ValueError(f"{info.field_name} cannot be negative.")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "age": 20,
                "gender": "Female",
                "study_hours_per_day": 5.0,
                "social_media_hours": 2.0,
                "netflix_hours": 1.2,
                "part_time_job": "No",
                "attendance_percentage": 92.5,
                "sleep_hours": 7.5,
                "diet_quality": "Good",
                "exercise_frequency": 3,
                "parental_education_level": "Bachelor",
                "internet_quality": "Good",
                "mental_health_rating": 8,
                "extracurricular_participation": "Yes"
            }
        }
    }


class PassFailResult(BaseModel):
    passed: bool
    pass_probability: float
    passing_threshold: float = 50.0

class StatisticalInterval(BaseModel):
    lower: float
    upper: float
    residual_std: float
    confidence_level: str
    method: str

class PredictionResponse(BaseModel):
    id: str
    timestamp: str
    predicted_score: float
    raw_predicted_score: float
    scale: str
    band: str
    letter_grade: str
    pass_fail: PassFailResult
    statistical_interval_95: StatisticalInterval
    insights: List[str]
    warnings: List[str]
    model_used: str
    submitted_inputs: Dict[str, Any]

    model_config = {"protected_namespaces": ()}

class HistoryItem(BaseModel):
    id: str
    timestamp: str
    student_summary: str
    predicted_score: float
    band: str
    letter_grade: str
    pass_probability: float
    inputs: Dict[str, Any]

class HealthResponse(BaseModel):
    status: str
    service: str
    model_loaded: bool
    model_name: str
    version: str
    timestamp: str

    model_config = {"protected_namespaces": ()}
