@echo off
setlocal enabledelayedexpansion

set "PROJECT_ROOT=%~dp0.."

echo ==========================================
echo   ANPR MAIN BACKEND (PORT 8000)
echo ==========================================
echo Project Root: %PROJECT_ROOT%
echo.

:: Exact port 8000 check
echo Checking Port 8000...
set "PORT_IN_USE=0"
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr /R " [^ ]*:8000 "') do (
    echo %%a | findstr /r "^[1-9][0-9]*$" >nul 2>&1
    if not errorlevel 1 (
        echo [WARNING] Port 8000 is in use by PID %%a
        set "PORT_IN_USE=1"
    )
)

if "!PORT_IN_USE!"=="1" (
    echo [ERROR] Port 8000 is busy. Run stop_all.bat first.
    pause
    exit /b 1
)

echo [OK] Port 8000 is available.
echo.

if not exist "%PROJECT_ROOT%\backend" (
    echo [ERROR] Cannot find: %PROJECT_ROOT%\backend
    pause
    exit /b 1
)

cd /d "%PROJECT_ROOT%\backend"
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else (
    echo [WARN] No venv found, using system Python...
)

echo Starting FastAPI backend...
"venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000

echo.
echo ==========================================
echo   Backend Stopped.
echo ==========================================
pause
