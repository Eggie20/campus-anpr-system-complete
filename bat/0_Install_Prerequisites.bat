@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

echo ==========================================
echo   CAMPUS ANPR - PREREQUISITES INSTALLER
echo ==========================================
echo.
echo   This script uses Windows Package Manager
echo   (winget) to install all required external
echo   software automatically.
echo.
echo   The following will be installed:
echo     1. Python 3.11
echo     2. Node.js 20 LTS
echo     3. PostgreSQL 15
echo     4. Tesseract OCR
echo     5. Microsoft Visual C++ Redistributable
echo.
echo   NOTE: You must run this as Administrator!
echo.
pause

:: Check for winget
where winget >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] winget is not available on this system.
    echo.
    echo   winget comes pre-installed on Windows 10 (1709+) and Windows 11.
    echo   If it is missing, install "App Installer" from the Microsoft Store:
    echo   https://apps.microsoft.com/detail/9nblggh4nns1
    echo.
    echo   Alternatively, use the manual download links in:
    echo   Setup_Instructions\Prerequisites_Links.md
    echo.
    pause
    exit /b 1
)

echo [OK] winget detected.
echo.

:: 1. Python 3.11
echo [1/5] Installing Python 3.11...
python --version 2>nul | findstr "3.1" >nul 2>&1
if %errorlevel% equ 0 (
    echo [SKIP] Python 3.x is already installed.
) else (
    winget install --id Python.Python.3.11 --source winget --accept-package-agreements --accept-source-agreements --silent
    if %errorlevel% neq 0 ( echo [WARNING] Python install may have failed. ) else ( echo [OK] Python 3.11 installed. )
)
echo.

:: 2. Node.js 20 LTS
echo [2/5] Installing Node.js 20 LTS...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [SKIP] Node.js is already installed.
) else (
    winget install --id OpenJS.NodeJS.LTS --source winget --accept-package-agreements --accept-source-agreements --silent
    if %errorlevel% neq 0 ( echo [WARNING] Node.js install may have failed. ) else ( echo [OK] Node.js 20 LTS installed. )
)
echo.

:: 3. PostgreSQL 15
echo [3/5] Installing PostgreSQL 15...
where psql >nul 2>&1
if %errorlevel% equ 0 (
    echo [SKIP] PostgreSQL is already installed.
) else (
    winget install --id PostgreSQL.PostgreSQL.15 --source winget --accept-package-agreements --accept-source-agreements --silent
    if %errorlevel% neq 0 ( echo [WARNING] PostgreSQL install may have failed. ) else (
        echo [OK] PostgreSQL 15 installed.
        echo.
        echo   IMPORTANT: Set a password for 'postgres' superuser.
        echo   Add to PATH: C:\Program Files\PostgreSQL\15\bin
    )
)
echo.

:: 4. Tesseract OCR
echo [4/5] Installing Tesseract OCR...
where tesseract >nul 2>&1
if %errorlevel% equ 0 (
    echo [SKIP] Tesseract OCR is already installed.
) else if exist "C:\Program Files\Tesseract-OCR\tesseract.exe" (
    echo [SKIP] Tesseract OCR found at default location.
) else (
    winget install --id UB-Mannheim.TesseractOCR --source winget --accept-package-agreements --accept-source-agreements --silent
    if %errorlevel% neq 0 ( echo [WARNING] Tesseract install may have failed. ) else (
        echo [OK] Tesseract OCR installed.
        echo   Add to PATH: C:\Program Files\Tesseract-OCR
    )
)
echo.

:: 5. Microsoft Visual C++ Redistributable
echo [5/5] Installing Microsoft Visual C++ Redistributable 2015-2022...
winget install --id Microsoft.VCRedist.2015+.x64 --source winget --accept-package-agreements --accept-source-agreements --silent
if %errorlevel% neq 0 ( echo [INFO] VC++ Redistributable may already be installed. ) else ( echo [OK] VC++ Redistributable installed. )
echo.

:: 6. Configure Path environment variables automatically
echo [6/5] Configuring User Environment Variables...
powershell -Command "$p=[Environment]::GetEnvironmentVariable('Path','User'); $add='C:\Program Files\Tesseract-OCR;C:\Program Files\PostgreSQL\15\bin'; foreach($a in $add.Split(';')){if($p -notlike '*'+$a+'*'){$p=$p+';'+$a}}; [Environment]::SetEnvironmentVariable('Path',$p,'User')"
if %errorlevel% equ 0 (
    echo [OK] PATH updated successfully.
) else (
    echo [WARNING] Failed to update PATH environment variable automatically.
)
echo.

echo ==========================================
echo   PREREQUISITES INSTALLATION COMPLETE!
echo ==========================================
echo.
echo   1. RESTART your computer to refresh PATH.
echo   2. Then run: bat\1_Install_Dependencies.bat
echo.
echo ==========================================
pause
