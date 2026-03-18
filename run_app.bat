@echo off
setlocal enabledelayedexpansion
set "BASE_DIR=%~dp0"
cd /d "%BASE_DIR%"

echo ==========================================
echo   CAMPUS ANPR SYSTEM - QUICK START
echo ==========================================

:: Check Port 8000 (Backend)
echo [1/4] Checking Port 8000...
set "PORT_IN_USE=0"
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    set "pid=%%a"
    if defined pid (
        echo [WARNING] Port 8000 is already in use by PID !pid!
        set "PORT_IN_USE=1"
    )
)
if "!PORT_IN_USE!"=="0" (
    echo [OK] Port 8000 is available.
)

:: Check Tesseract
echo [2/4] Verifying Tesseract OCR...
where tesseract >nul 2>&1
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Tesseract-OCR\tesseract.exe" (
        echo [OK] Tesseract found at default location.
    ) else (
        echo [ERROR] Tesseract NOT found. OCR will not work properly.
        echo Please ensure Tesseract is installed and added to PATH.
    )
) else (
    echo [OK] Tesseract found.
)

:: Start Backend
echo [3/4] Starting FastAPI Backend on port 8000...
start "ANPR Backend" cmd /k "cd /d "%BASE_DIR%backend" && if exist venv\Scripts\activate (call venv\Scripts\activate) && python seed_db.py && python -m uvicorn app.main:app --reload --port 8000"

:: Start Frontend
echo [4/4] Starting Vite Frontend...
start "ANPR Frontend" cmd /k "cd /d "%BASE_DIR%frontend" && npm run dev"

echo ==========================================
echo   System is starting!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000/docs
echo ==========================================
pause
