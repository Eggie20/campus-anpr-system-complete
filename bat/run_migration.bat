@echo off
setlocal
set "PROJECT_ROOT=%~dp0.."
cd /d "%PROJECT_ROOT%"

echo ==========================================
echo   CAMPUS ANPR - DATABASE MIGRATION FIX
echo ==========================================

:: Try to find python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found in PATH.
    pause
    exit /b
)

:: Check for backend dir
if not exist "backend\migrations\run_migration.py" (
    echo [ERROR] Migration script missing at backend\migrations\run_migration.py
    pause
    exit /b
)

:: Set PYTHONPATH to project root
set PYTHONPATH=%cd%

echo [INFO] Running database migration...
python backend\migrations\run_migration.py

if %errorlevel% equ 0 (
    echo ==========================================
    echo   SUCCESS! Database updated.
    echo   You can now restart your backend server.
    echo ==========================================
) else (
    echo [ERROR] Migration failed. Please check the logs above.
)

pause
