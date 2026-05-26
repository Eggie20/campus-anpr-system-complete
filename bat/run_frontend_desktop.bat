@echo off
setlocal enabledelayedexpansion

set "PROJECT_ROOT=%~dp0.."

echo ==========================================
echo   ANPR FRONTEND ^& DESKTOP APP
echo ==========================================
echo Project Root: %PROJECT_ROOT%
echo.

if not exist "%PROJECT_ROOT%\frontend" (
    echo [ERROR] Cannot find: %PROJECT_ROOT%\frontend
    pause
    exit /b 1
)

cd /d "%PROJECT_ROOT%\frontend"

echo Starting Vite + Electron...
npm run dev:electron

echo.
echo ==========================================
echo   Frontend Stopped.
echo ==========================================
pause
