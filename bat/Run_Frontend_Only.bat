@echo off
set "PROJECT_ROOT=%~dp0.."
echo Launching Frontend Desktop Interface...
cd /d "%PROJECT_ROOT%"
call bat\run_frontend_desktop.bat
pause
