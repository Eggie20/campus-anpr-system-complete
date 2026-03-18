@echo off
setlocal
set "BASE_DIR=%~dp0"
cd /d "%BASE_DIR%"

echo ==========================================
echo   CAMPUS ANPR - INSTALLATION WIZARD
echo ==========================================

:: Check for Python
echo [1/4] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.9+ from python.org
    pause
    exit /b
)
echo [OK] Python found.

:: Backend Setup
echo [2/4] Setting up Backend Virtual Environment...
cd /d "%BASE_DIR%backend"
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
) else (
    echo Virtual environment already exists.
)

echo Installing Backend dependencies...
call venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org
if %errorlevel% neq 0 (
    echo [WARNING] Some Backend dependencies failed to install.
)
echo [OK] Backend setup complete.

:: Frontend Setup
echo [3/4] Setting up Frontend...
cd /d "%BASE_DIR%frontend"
echo Checking for Node.js/NPM...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js/NPM is not installed.
    echo Please install Node.js from nodejs.org
    pause
    exit /b
)

echo Installing Frontend dependencies (this may take a while)...
call npm install
if %errorlevel% neq 0 (
    echo [WARNING] Frontend dependencies failed to install.
)
echo [OK] Frontend setup complete.

:: Final Check for Tesseract
echo [4/4] Checking for Tesseract OCR...
where tesseract >nul 2>&1
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Tesseract-OCR\tesseract.exe" (
        echo [OK] Tesseract found at default location.
    ) else (
        echo [INFO] Tesseract OCR not found in PATH or default location.
        echo Please download it from: https://github.com/UB-Mannheim/tesseract/wiki
    )
) else (
    echo [OK] Tesseract found in PATH.
)

echo ==========================================
echo   INSTALLATION COMPLETE!
echo   You can now run the app using: run_app.bat
echo ==========================================
pause
