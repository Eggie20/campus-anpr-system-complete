@echo off
setlocal EnableDelayedExpansion

echo ==========================================
echo   STOP SMART-PLATE ANPR (port 8003)
echo ==========================================
echo.
set "FOUND=0"

:: Kill exact port 8003 match only (space after port prevents matching :80030 etc)
echo [STEP 1] Checking port 8003...
for /f "tokens=5" %%P in ('netstat -ano 2^>nul ^| findstr /R " [^ ]*:8003 "') do (
    echo %%P | findstr /r "^[1-9][0-9]*$" >nul 2>&1
    if not errorlevel 1 (
        set "FOUND=1"
        echo [INFO ] Found PID %%P on port 8003
        taskkill /F /PID %%P >nul 2>&1
        if errorlevel 1 (echo [WARN ] Could not kill PID %%P -- run as Administrator) else (echo [OK  ] Stopped PID %%P)
    )
)
if "!FOUND!"=="0" echo [INFO ] No process on port 8003.

:: Kill winpty ghost processes
echo.
echo [STEP 2] Checking winpty-agent.exe...
tasklist /FI "IMAGENAME eq winpty-agent.exe" 2>nul | findstr /I "winpty-agent" >nul
if not errorlevel 1 (
    set "FOUND=1"
    taskkill /F /IM winpty-agent.exe >nul 2>&1
    if errorlevel 1 (echo [WARN ] Could not kill winpty-agent.exe) else (echo [OK  ] Stopped winpty-agent.exe)
) else (echo [INFO ] No winpty-agent.exe found.)

:: Kill leftover python/uvicorn by name (only if port check found nothing)
if "!FOUND!"=="0" (
    echo.
    echo [STEP 3] Port was clear but checking for orphan python/uvicorn...
    for %%N in (python.exe python3.exe uvicorn.exe) do (
        tasklist /FI "IMAGENAME eq %%N" 2>nul | findstr /I "%%N" >nul
        if not errorlevel 1 (
            set "FOUND=1"
            taskkill /F /IM %%N >nul 2>&1
            if errorlevel 1 (echo [WARN ] Could not kill %%N) else (echo [OK  ] Stopped %%N)
        )
    )
)

echo.
echo ==========================================
if "!FOUND!"=="0" (
    echo [INFO ] Port 8003 is already free.
) else (
    echo [DONE ] Stopped. Run run_anpr_engine.bat again.
)
echo ==========================================
echo.
pause
