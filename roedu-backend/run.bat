@echo off
echo ========================================
echo  RoEdu Educational Platform - Backend
echo ========================================
echo.

echo Checking Python installation...
py --version
if errorlevel 1 (
    echo Python is not installed or not in PATH!
    pause
    exit /b 1
)

echo.
echo Checking virtual environment...
if not exist "venv\" (
    echo Creating virtual environment...
    py -m venv venv
)

echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Installing/Updating dependencies...
pip install -r requirements.txt

echo.
echo Checking .env file...
if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo IMPORTANT: Please edit .env file with your configuration!
    pause
)

echo.
echo Creating uploads directory...
if not exist "uploads\" mkdir uploads

echo.
echo ========================================
echo  Starting RoEdu Backend Server...
echo ========================================
echo.
echo API Documentation will be available at:
echo  - Swagger UI: http://localhost:8000/docs
echo  - ReDoc: http://localhost:8000/redoc
echo.

uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
