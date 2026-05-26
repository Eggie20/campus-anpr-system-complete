@echo off
:: Trap errors immediately -- window can NEVER close without user pressing a key
if "%1"=="" (
    cmd /k ""%~f0" RUNNING"
    exit /b
)

setlocal EnableDelayedExpansion

echo ==========================================
echo   STOP ALL CAMPUS ANPR SERVICES
echo ==========================================
echo.

set "FOUND=0"

:: Kill by port 8000 and 8003 (exact match)
echo [PORT] Checking port 8000...
for /f "tokens=5" %%P in ('netstat -ano 2^>nul ^| findstr /R " [^ ]*:8000 "') do (
    echo %%P | findstr /r "^[1-9][0-9]*$" >nul 2>&1
    if not errorlevel 1 (
        set "FOUND=1"
        echo [INFO ] Killing PID %%P on port 8000
        taskkill /F /PID %%P >nul 2>&1
        if errorlevel 1 (echo [WARN ] Could not kill %%P) else (echo [OK  ] Stopped %%P)
    )
)

echo [PORT] Checking port 8003...
for /f "tokens=5" %%P in ('netstat -ano 2^>nul ^| findstr /R " [^ ]*:8003 "') do (
    echo %%P | findstr /r "^[1-9][0-9]*$" >nul 2>&1
    if not errorlevel 1 (
        set "FOUND=1"
        echo [INFO ] Killing PID %%P on port 8003
        taskkill /F /PID %%P >nul 2>&1
        if errorlevel 1 (echo [WARN ] Could not kill %%P) else (echo [OK  ] Stopped %%P)
    )
)

:: Kill by process name
echo.
echo [PROC] Stopping python / uvicorn / winpty...
for %%N in (python.exe python3.exe uvicorn.exe winpty-agent.exe) do (
    tasklist /FI "IMAGENAME eq %%N" 2>nul | findstr /I "%%N" >nul
    if not errorlevel 1 (
        set "FOUND=1"
        taskkill /F /IM %%N >nul 2>&1
        if errorlevel 1 (echo [WARN ] Could not kill %%N) else (echo [OK  ] Stopped %%N)
    )
)

echo.
echo [PROC] Stopping node / electron (frontend)...
for %%N in (node.exe electron.exe) do (
    tasklist /FI "IMAGENAME eq %%N" 2>nul | findstr /I "%%N" >nul
    if not errorlevel 1 (
        set "FOUND=1"
        taskkill /F /IM %%N >nul 2>&1
        if errorlevel 1 (echo [WARN ] Could not kill %%N) else (echo [OK  ] Stopped %%N)
    )
)

echo.
echo ==========================================
if "!FOUND!"=="0" (
    echo [INFO ] Nothing was running. All ports are free.
) else (
    echo [DONE ] All services stopped.
)
echo ==========================================
echo.
pause
