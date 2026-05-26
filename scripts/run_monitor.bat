@echo off
TITLE SMART-PLATE LIVE MONITOR
color 0e
echo =======================================================
echo          STARTING SMART-PLATE LIVE MONITOR...
echo =======================================================
echo.

cd /d "%~dp0\.."

:: Install required missing libs quietly
call backend\venv\Scripts\activate.bat
pip install websockets colorama -q

:: Run the CLI dashboard
python scripts\monitor_cli.py

pause
