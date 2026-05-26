@echo off
setlocal
set "BASE_DIR=%~dp0"
cd /d "%BASE_DIR%"

echo ==========================================
echo   CAMPUS ANPR - INSTALLATION WIZARD
echo ==========================================

:: Check for Python
echo [1/5] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.9+ from python.org
    echo Or run: Setup_Instructions\Install_Prerequisites_Winget.bat
    pause
    exit /b
)
echo [OK] Python found.

:: Backend Setup
echo [2/5] Setting up Backend Virtual Environment...
cd /d "%BASE_DIR%..\backend"
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
) else (
    echo Virtual environment already exists.
)

echo Installing Backend dependencies...
venv\Scripts\python.exe -m pip install --upgrade pip --quiet
venv\Scripts\python.exe -m pip install -r requirements.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org
if %errorlevel% neq 0 (
    echo [WARNING] Some Backend dependencies failed to install.
)
echo [OK] Backend setup complete.

:: ANPR Engine Setup
echo [3/5] Setting up SMART-PLATE ANPR Engine...
cd /d "%BASE_DIR%..\api\smart_anpr"
if not exist "%BASE_DIR%..\api\smart_anpr" (
    echo [WARNING] ANPR Engine folder not found. Skipping...
    goto :frontend_setup
)
if not exist venv311 (
    echo Creating ANPR Engine virtual environment (venv311)...
    python -m venv venv311
) else (
    echo ANPR Engine virtual environment already exists.
)

echo Installing ANPR Engine dependencies...
venv311\Scripts\python.exe -m pip install --upgrade pip --quiet
venv311\Scripts\python.exe -m pip install -r requirements.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org
if %errorlevel% neq 0 (
    echo [WARNING] Some ANPR Engine dependencies failed to install.
    echo   Ensure Microsoft Visual C++ Redistributable 2015-2022 is installed
    echo   for PyTorch and EasyOCR to compile correctly.
)
echo [OK] ANPR Engine setup complete.

:: Frontend/Desktop Setup
:frontend_setup
echo [4/5] Setting up Web and Desktop Apps...
cd /d "%BASE_DIR%..\frontend"
echo Checking for Node.js/NPM...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js/NPM is not installed.
    echo Please install Node.js from nodejs.org
    echo Or run: Setup_Instructions\Install_Prerequisites_Winget.bat
    pause
    exit /b
)

echo Installing Web and Electron dependencies (this may take a while)...
call npm install
if %errorlevel% neq 0 (
    echo [WARNING] Web/Desktop dependencies had some issues installing.
)
echo [OK] Web and Desktop setup complete.

:: Final Check for Tesseract
echo [5/5] Checking for Tesseract OCR...
where tesseract >nul 2>&1
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Tesseract-OCR\tesseract.exe" (
        echo [OK] Tesseract found at default location.
    ) else (
        echo [INFO] Tesseract OCR not found in PATH or default location.
        echo   The ID scanning feature requires Tesseract OCR.
        echo   Download it from: https://github.com/UB-Mannheim/tesseract/wiki
        echo   Install to: C:\Program Files\Tesseract-OCR
        echo   Then add that directory to your system PATH.
    )
) else (
    echo [OK] Tesseract found in PATH.
)

echo ==========================================
echo   INSTALLATION COMPLETE!
echo ==========================================
echo.
echo   Next step: Run 2_Setup_Database.bat
echo     to configure your PostgreSQL database.
echo.
echo ==========================================
pause
