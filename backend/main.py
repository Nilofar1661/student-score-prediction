"""
FastAPI Backend Application for EduPredict - Student Performance Intelligence.
Serves prediction API, model insights, schema metadata, and prediction history.
"""

import os
import sys
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any
from pathlib import Path

# Ensure repository root is on sys.path for portable imports across environments (Render/Linux/Windows)
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from backend.schemas import (
    StudentInputSchema,
    PredictionResponse,
    HealthResponse,
    HistoryItem
)
from backend.model_service import ModelService
from backend.database import (
    save_prediction,
    get_all_history,
    clear_all_history,
    delete_prediction_by_id
)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("edupredict_api")

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing EduPredict API and loading machine learning model...")
    service = ModelService.get_instance()
    if service.is_loaded:
        logger.info("Model pipeline loaded successfully and ready for inference.")
    else:
        logger.error("Failed to load model pipeline at startup.")
    yield

app = FastAPI(
    title="EduPredict API — Student Performance Intelligence",
    description="Production Machine Learning Backend for predicting student exam performance from study habits and wellness metrics.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration: allows localhost for local development, Render deployed frontend, and custom domains
env_allowed_origins = os.getenv("ALLOWED_ORIGINS", "")
frontend_url_env = os.getenv("FRONTEND_URL", "").strip()

custom_origins = [origin.strip().rstrip("/") for origin in env_allowed_origins.split(",") if origin.strip()]
if frontend_url_env and frontend_url_env.rstrip("/") not in custom_origins:
    custom_origins.append(frontend_url_env.rstrip("/"))

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

for origin in custom_origins:
    if origin not in ALLOWED_ORIGINS:
        ALLOWED_ORIGINS.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https:\/\/.*\.onrender\.com$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Clean validation error formatting without leaking internal paths."""
    errors = []
    for err in exc.errors():
        field = ".".join(str(loc) for loc in err["loc"] if loc != "body")
        errors.append({
            "field": field,
            "message": err["msg"],
            "type": err["type"]
        })
    logger.warning(f"Validation failed for request: {errors}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "One or more input values are outside acceptable ranges or have invalid formats.",
            "details": errors
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Graceful error handling without exposing stack traces."""
    logger.error(f"Unhandled error during request: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred while processing your request. Please try again or verify your inputs."
        }
    )

@app.get("/", tags=["General"])
def root():
    return {
        "service": "EduPredict — Student Performance Intelligence API",
        "version": "1.0.0",
        "status": "online",
        "documentation": "/docs",
        "health": "/api/health"
    }

@app.get("/api/health", response_model=HealthResponse, tags=["Monitoring"])
def health_check():
    service = ModelService.get_instance()
    return HealthResponse(
        status="healthy" if service.is_loaded else "degraded",
        service="EduPredict ML Inference Engine",
        model_loaded=service.is_loaded,
        model_name="Lasso Regularized Regression (alpha=0.1)",
        version="1.0.0",
        timestamp=datetime.now(timezone.utc).isoformat()
    )

@app.get("/api/metadata", tags=["Metadata"])
def get_metadata():
    """Returns supported input fields, valid categories, numerical ranges, descriptions, and presets."""
    service = ModelService.get_instance()
    return service.get_metadata()

@app.post("/api/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict_score(student_input: StudentInputSchema):
    """Predicts a student's continuous exam score, performance band, pass/fail probability, and key drivers."""
    service = ModelService.get_instance()
    if not service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Machine learning model is currently not available."
        )

    try:
        input_dict = student_input.model_dump()
        result = service.predict(input_dict)
        
        # Persist prediction to history database
        try:
            save_prediction(result)
        except Exception as db_err:
            logger.warning(f"Failed to record prediction in history: {db_err}")

        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Prediction inference error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error calculating prediction."
        )

@app.get("/api/insights", tags=["Model Intelligence"])
def get_model_insights():
    """Returns candidate model evaluations, comparison table, winning model rationale, and dataset EDA metrics."""
    service = ModelService.get_instance()
    return service.get_insights()

@app.get("/api/history", response_model=List[HistoryItem], tags=["Prediction History"])
def get_history(limit: int = 50):
    """Returns recent predictions made in the session or local application."""
    return get_all_history(limit=limit)

@app.delete("/api/history", tags=["Prediction History"])
def clear_history():
    """Clears all stored prediction history."""
    clear_all_history()
    return {"message": "Prediction history cleared successfully."}

@app.delete("/api/history/{prediction_id}", tags=["Prediction History"])
def delete_single_history(prediction_id: str):
    """Deletes a specific prediction from history."""
    deleted = delete_prediction_by_id(prediction_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
    return {"message": f"Prediction {prediction_id} deleted successfully."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)
