@echo off
set "PROJECT_ROOT=%~dp0.."
echo Launching SMART-PLATE ANPR Engine...
cd /d "%PROJECT_ROOT%"
call bat\run_anpr_engine.bat
pause
