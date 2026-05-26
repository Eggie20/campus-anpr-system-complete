@echo off
setlocal enabledelayedexpansion

:: Scripts are in D:\campus-anpr-system\scripts\
:: So %~dp0 = scripts\  and  %~dp0.. = project root
set "SCRIPTS_DIR=%~dp0"
set "PROJECT_ROOT=%~dp0.."

echo ==========================================
echo   CAMPUS ANPR SYSTEM - QUICK START
echo ==========================================
echo.
echo Project Root: %PROJECT_ROOT%
echo Scripts Dir:  %SCRIPTS_DIR%
echo.
echo Tip: To stop everything, run stop_all.bat
echo.

if not exist "%PROJECT_ROOT%\backend" (
echo [ERROR] Missing backend folder: %PROJECT_ROOT%\backend
pause
exit /b 1
)
if not exist "%PROJECT_ROOT%\frontend" (
echo [ERROR] Missing frontend folder: %PROJECT_ROOT%\frontend
pause
exit /b 1
)
if not exist "%PROJECT_ROOT%\api\smart_anpr" (
echo [ERROR] Missing smart_anpr folder: %PROJECT_ROOT%\api\smart_anpr
pause
exit /b 1
)

where python >nul 2>&1
if errorlevel 1 (
echo [ERROR] Python is not available in PATH.
echo Run scripts\install_dependencies.bat first.
pause
exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
echo [ERROR] NPM is not available in PATH.
echo Run scripts\install_dependencies.bat first.
pause
exit /b 1
)

:: ── Start services (cmd /c closes window when process ends) ──────────────────
echo [1/3] Starting Main Backend (port 8000)...
start "ANPR-Backend" cmd /c ""%SCRIPTS_DIR%run_main_backend.bat""

echo Waiting 3 seconds before next service...
timeout /t 3 /nobreak >nul

echo [2/3] Starting ANPR Engine (port 8003)...
start "ANPR-Engine" cmd /c ""%SCRIPTS_DIR%run_anpr_engine.bat""

echo Waiting 3 seconds before next service...
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend...
start "ANPR-Frontend" cmd /c ""%SCRIPTS_DIR%run_frontend_desktop.bat""

echo.
echo ==========================================
echo   All services launched!
echo.
echo   Web Portal:   http://localhost:3000
echo   ANPR Engine:  http://localhost:8003/api/docs
echo   Backend API:  http://localhost:8000/docs
echo   Alerts WS:    ws://localhost:8000/ws/alerts
echo.
echo   Run stop_all.bat to shut everything down.
echo ==========================================
echo.
pause
