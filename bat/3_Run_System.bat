@echo off
setlocal EnableDelayedExpansion

:: Refresh PATH from registry for current session
set "USER_PATH="
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "USER_PATH=%%b"
set "SYSTEM_PATH="
for /f "tokens=2*" %%a in ('reg query "HKLM\System\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set "SYSTEM_PATH=%%b"
if defined USER_PATH (
    if defined SYSTEM_PATH (
        set "PATH=!USER_PATH!;!SYSTEM_PATH!"
    ) else (
        set "PATH=!USER_PATH!"
    )
) else if defined SYSTEM_PATH (
    set "PATH=!SYSTEM_PATH!"
)


set "PROJECT_ROOT=%~dp0.."
cd /d "%PROJECT_ROOT%"

echo ========================================
echo   Campus ANPR System - Full Stack
echo ========================================
echo.

:: Check Python and Node
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH!
    echo Run bat\0_Install_Prerequisites.bat first.
    pause
    exit /b
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH!
    echo Run bat\0_Install_Prerequisites.bat first.
    pause
    exit /b
)

:: Check that virtual environments exist
if not exist "%PROJECT_ROOT%\backend\venv\Scripts\python.exe" (
    echo [ERROR] Backend virtual environment not found!
    echo Run bat\1_Install_Dependencies.bat first.
    pause
    exit /b
)

:: 1. Start Campus Backend (Port 8000)
echo [1/3] Starting Campus Backend (port 8000)...
start "Campus Backend :8000" cmd /k "cd /d "%PROJECT_ROOT%\backend" && venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

:: 2. Start SMART-PLATE ANPR Engine (Port 8003)
echo [2/3] Starting SMART-PLATE ANPR Engine (port 8003)...
if exist "%PROJECT_ROOT%\api\smart_anpr\venv311\Scripts\python.exe" (
    start "ANPR Engine :8003" cmd /k "cd /d "%PROJECT_ROOT%\api\smart_anpr" && venv311\Scripts\python.exe -m uvicorn api.main:app --reload --host 127.0.0.1 --port 8003"
) else (
    echo [WARNING] ANPR Engine venv311 not found. Skipping...
    echo   Run bat\1_Install_Dependencies.bat to set it up.
)

:: 3. Start Frontend (Electron Desktop App)
echo [3/3] Starting Frontend (Electron Desktop)...
start "Frontend Electron" cmd /k "cd /d "%PROJECT_ROOT%\frontend" && npm run dev:electron"

echo.
echo ========================================
echo   All 3 services are starting...
echo ========================================
echo.
echo   Frontend:       http://127.0.0.1:5173
echo   Campus API:     http://127.0.0.1:8000
echo   ANPR Engine:    http://127.0.0.1:8003
echo   ANPR Docs:      http://127.0.0.1:8003/api/docs
echo.
echo   Security Login: http://127.0.0.1:5173/security-login
echo   Admin Login:    http://127.0.0.1:5173/admin-login
echo ========================================
pause
