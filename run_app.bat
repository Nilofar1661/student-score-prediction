@echo off
title EduPredict - Student Performance Intelligence
echo =====================================================================
echo           EduPredict - Student Performance Intelligence
echo       End-to-End Machine Learning Web Application (Localhost)
echo =====================================================================
echo.

:: 1. Verify Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not found in PATH. Please install Python 3.10+ and add it to PATH.
    pause
    exit /b 1
)

:: 2. Check and train model if artifact is missing
if not exist "models\model_pipeline.joblib" (
    echo [INFO] Training model pipeline and packaging production artifacts...
    python training\train_pipeline.py
    if errorlevel 1 (
        echo [ERROR] Failed to train model pipeline.
        pause
        exit /b 1
    )
)

:: 3. Launch Backend Server in new window
echo [INFO] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "EduPredict Backend API" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

:: 4. Launch Frontend Server in new window
echo [INFO] Launching React Vite Frontend on http://localhost:5173 ...
cd frontend
start "EduPredict Frontend UI" cmd /k "npm run dev -- --host localhost --port 5173"
cd ..

echo.
echo =====================================================================
echo  Services started successfully!
echo.
echo  * Frontend Web App:  http://localhost:5173
echo  * Backend API:       http://127.0.0.1:8000
echo  * API Documentation: http://127.0.0.1:8000/docs
echo.
echo  Opening browser to http://localhost:5173 ...
echo  (To stop services, close the terminal windows that opened)
echo =====================================================================
timeout /t 3 >nul
start http://localhost:5173
pause
