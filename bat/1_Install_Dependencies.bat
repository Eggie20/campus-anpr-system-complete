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

echo ==========================================
echo   CAMPUS ANPR - INSTALLATION WIZARD
echo ==========================================

:: Check for Python
echo [1/5] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please run bat\0_Install_Prerequisites.bat first.
    pause
    exit /b
)
echo [OK] Python found.

:: Backend Setup
echo [2/5] Setting up Backend Virtual Environment...
cd /d "%PROJECT_ROOT%\backend"
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
if not exist "%PROJECT_ROOT%\api\smart_anpr" (
    echo [WARNING] ANPR Engine folder not found. Skipping...
    goto :frontend_setup
)
cd /d "%PROJECT_ROOT%\api\smart_anpr"
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
    echo   Ensure Microsoft Visual C++ Redistributable 2015-2022 is installed.
)
echo [OK] ANPR Engine setup complete.

:: Frontend/Desktop Setup
:frontend_setup
echo [4/5] Setting up Web and Desktop Apps...
cd /d "%PROJECT_ROOT%\frontend"
echo Checking for Node.js/NPM...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js/NPM is not installed.
    echo Please run bat\0_Install_Prerequisites.bat first.
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
        echo   Download from: https://github.com/UB-Mannheim/tesseract/wiki
        echo   Install to: C:\Program Files\Tesseract-OCR
    )
) else (
    echo [OK] Tesseract found in PATH.
)

echo ==========================================
echo   INSTALLATION COMPLETE!
echo ==========================================
echo.
echo   Next step: Run bat\2_Setup_Database.bat
echo ==========================================
pause
