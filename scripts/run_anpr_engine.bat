@echo off
setlocal enabledelayedexpansion

set "PROJECT_ROOT=%~dp0.."

echo ==========================================
echo   SMART-PLATE ANPR ENGINE (PORT 8003)
echo ==========================================
echo Project Root: %PROJECT_ROOT%
echo.

:: Exact port 8003 check
echo Checking Port 8003...
set "PORT_IN_USE=0"
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr /R " [^ ]*:8003 "') do (
    echo %%a | findstr /r "^[1-9][0-9]*$" >nul 2>&1
    if not errorlevel 1 (
        echo [WARNING] Port 8003 is in use by PID %%a
        set "PORT_IN_USE=1"
    )
)

if "!PORT_IN_USE!"=="1" (
    echo [ERROR] Port 8003 is busy. Run stop_anpr_engine.bat first.
    pause
    exit /b 1
)

echo [OK] Port 8003 is available.
echo.

if not exist "%PROJECT_ROOT%\api\smart_anpr" (
    echo [ERROR] Cannot find: %PROJECT_ROOT%\api\smart_anpr
    echo Check that PROJECT_ROOT is correct above.
    pause
    exit /b 1
)

cd /d "%PROJECT_ROOT%\api\smart_anpr"

echo Starting SMART-PLATE ANPR Engine...
if "%DASHBOARD_WEBHOOK_URL%"=="" (
    set "DASHBOARD_WEBHOOK_URL=http://localhost:8000/api/v1/anpr/webhook/smart-anpr"
)
if "%API_PORT%"=="" (
    set "API_PORT=8003"
)
echo [INFO] DASHBOARD_WEBHOOK_URL=%DASHBOARD_WEBHOOK_URL%
echo [INFO] API_PORT=%API_PORT%

if exist venv311\Scripts\activate.bat (
    call venv311\Scripts\activate.bat
) else (
    echo [WARN] No venv311 found, using system Python...
)

python -m uvicorn api.main:app --reload --host 127.0.0.1 --port %API_PORT%
if errorlevel 1 (
    echo [ERROR] SMART-PLATE ANPR Engine failed to start.
    echo Check Python, dependencies, and camera permissions.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   ANPR Engine Stopped.
echo ==========================================
pause
