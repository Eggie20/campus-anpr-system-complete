@echo off
set "PROJECT_ROOT=%~dp0.."
echo Launching Campus API Backend...
cd /d "%PROJECT_ROOT%"
call bat\run_main_backend.bat
pause
