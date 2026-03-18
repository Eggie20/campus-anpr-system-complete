@echo off
setlocal
:: Get the directory where the batch file is located
set "BASE_DIR=%~dp0"
cd /d "%BASE_DIR%"

echo ==========================================
echo   CAMPUS ANPR SYSTEM - QUICK START
echo ==========================================

:: Check for backend environment
if not exist "backend\.env" (
    echo [ERROR] Backend .env file missing. Creating from template...
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env"
    ) else (
        echo [ERROR] Could not find .env.example
    )
)

:: Start Backend in a new window
echo [SERVER] Starting FastAPI Backend...
start "ANPR Backend" cmd /k "cd /d "%BASE_DIR%backend" && if exist venv\Scripts\activate (call venv\Scripts\activate) && python -m pip install -r requirements.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org && python seed_db.py && python -m uvicorn app.main:app --reload --port 8001"

:: Start Frontend in a new window
echo [SERVER] Starting Vite Frontend...
start "ANPR Frontend" cmd /k "cd /d "%BASE_DIR%frontend" && npm install && npm run dev"

echo ==========================================
echo   System is starting!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8001
echo   Admin Docs: http://localhost:8001/docs
echo ==========================================
pause
