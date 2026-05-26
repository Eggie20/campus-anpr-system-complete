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
echo   DATABASE SETUP WIZARD
echo ==========================================
echo.

:: Locate Python from backend venv first, fallback to system python
set "PYTHON_EXE="
if exist "%PROJECT_ROOT%\backend\venv\Scripts\python.exe" (
    set "PYTHON_EXE=%PROJECT_ROOT%\backend\venv\Scripts\python.exe"
) else (
    where python >nul 2>&1
    if %errorlevel% equ 0 (
        set "PYTHON_EXE=python"
    ) else (
        echo [ERROR] Python is not found. Please run bat\1_Install_Dependencies first.
        pause
        exit /b
    )
)

echo [INFO] Using Python: !PYTHON_EXE!
echo.

set /p DB_USER="Enter PostgreSQL Username [postgres]: "
if "!DB_USER!"=="" set "DB_USER=postgres"

set /p DB_PASS="Enter PostgreSQL Password (will be visible): "
if "!DB_PASS!"=="" (
    echo [ERROR] Password cannot be empty.
    pause
    exit /b
)

set /p DB_HOST="Enter Database Host [localhost]: "
if "!DB_HOST!"=="" set "DB_HOST=localhost"

set /p DB_PORT="Enter Database Port [5432]: "
if "!DB_PORT!"=="" set "DB_PORT=5432"

set /p DB_NAME="Enter Database Name [campus_anpr]: "
if "!DB_NAME!"=="" set "DB_NAME=campus_anpr"

echo.
echo Do you want to seed the database with the backup file?
echo WARNING: This will DROP the existing database and recreate it!
set /p SEED_DB="Seed database? (Y/N) [Y]: "
if "!SEED_DB!"=="" set "SEED_DB=Y"

:: Write temporary Python script
set "SEED_SCRIPT=%PROJECT_ROOT%\__db_setup_temp.py"

(
echo import sys, os
echo try:
echo     import psycopg2
echo except ImportError:
echo     print("[INFO] Installing psycopg2-binary...")
echo     os.system(f'"{sys.executable}" -m pip install psycopg2-binary -q')
echo     import psycopg2
echo.
echo DB_USER = r"""!DB_USER!"""
echo DB_PASS = r"""!DB_PASS!"""
echo DB_HOST = r"""!DB_HOST!"""
echo DB_PORT = r"""!DB_PORT!"""
echo DB_NAME = r"""!DB_NAME!"""
echo SEED = r"""!SEED_DB!"""
echo.
echo print(f"[INFO] Connecting to PostgreSQL at {DB_HOST}:{DB_PORT} as {DB_USER}...")
echo try:
echo     conn = psycopg2.connect(dbname="postgres", user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
echo     conn.autocommit = True
echo     cur = conn.cursor()
echo     print("[OK] Connected to PostgreSQL server.")
echo except Exception as e:
echo     print(f"[ERROR] Connection failed: {e}")
echo     sys.exit(1)
echo.
echo # Check if database exists
echo cur.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'")
echo exists = cur.fetchone()
echo.
echo if SEED.upper() == "Y":
echo     if exists:
echo         print(f"[INFO] Dropping existing database '{DB_NAME}'...")
echo         cur.execute(f"DROP DATABASE \"{DB_NAME}\" WITH (FORCE)")
echo     print(f"[INFO] Creating database '{DB_NAME}'...")
echo     cur.execute(f"CREATE DATABASE \"{DB_NAME}\"")
echo     cur.close()
echo     conn.close()
echo.
echo     # Find the backup SQL file
echo     script_dir = os.path.dirname(os.path.abspath(__file__))
echo     sql_file = os.path.join(script_dir, "database", "anpr_database.sql")
echo     if not os.path.exists(sql_file):
echo         print(f"[ERROR] Backup file not found at: {sql_file}")
echo         sys.exit(1)
echo.
echo     print(f"[INFO] Restoring from {sql_file}...")
echo     import io, re
echo     conn2 = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
echo     conn2.autocommit = True
echo     cur2 = conn2.cursor()
echo.
echo     with open(sql_file, "r", encoding="utf-8") as f:
echo         content = f.read()
echo.
echo     # Normalize CRLF to LF
echo     content = content.replace('\r\n', '\n')
echo.
echo     lines = content.split('\n')
echo     current_copy_stmt = None
echo     copy_data = []
echo     sql_buffer = []
echo.
echo     for line in lines:
echo         line_stripped = line.strip()
echo.
echo         if line_stripped.startswith('\\') and line_stripped != '\\.':
echo             continue
echo.
echo         if current_copy_stmt:
echo             if line_stripped == '\\.':
echo                 data_str = '\n'.join(copy_data) + '\n'
echo                 if data_str.strip():
echo                     cur2.copy_expert(current_copy_stmt, io.StringIO(data_str))
echo                 current_copy_stmt = None
echo                 copy_data = []
echo             else:
echo                 copy_data.append(line)
echo         else:
echo             if line_stripped.startswith('COPY ') and line_stripped.endswith('FROM stdin;'):
echo                 if sql_buffer:
echo                     sql_str = '\n'.join(sql_buffer)
echo                     try:
echo                         if sql_str.strip(): cur2.execute(sql_str)
echo                     except Exception as e:
echo                         pass
echo                     sql_buffer = []
echo                 current_copy_stmt = line_stripped
echo             else:
echo                 sql_buffer.append(line)
echo                 if line_stripped.endswith(';') and not line_stripped.startswith('--'):
echo                     sql_str = '\n'.join(sql_buffer)
echo                     try:
echo                         if sql_str.strip(): cur2.execute(sql_str)
echo                     except Exception as e:
echo                         pass
echo                     sql_buffer = []
echo.
echo     if sql_buffer:
echo         sql_str = '\n'.join(sql_buffer)
echo         try:
echo             if sql_str.strip(): cur2.execute(sql_str)
echo         except Exception as e:
echo             pass
echo.
echo     cur2.close()
echo     conn2.close()
echo     print("[OK] Database seeded successfully!")
echo else:
echo     if not exists:
echo         print(f"[INFO] Creating database '{DB_NAME}'...")
echo         cur.execute(f"CREATE DATABASE \"{DB_NAME}\"")
echo         print("[OK] Database created.")
echo     else:
echo         print(f"[OK] Database '{DB_NAME}' already exists.")
echo     cur.close()
echo     conn.close()
echo.
echo # Update backend .env
echo env_path = os.path.join(script_dir, "backend", ".env")
echo db_url = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
echo.
echo lines_out = []
echo url_updated = False
echo if os.path.exists(env_path):
echo     with open(env_path, "r") as f:
echo         for line in f:
echo             if line.strip().startswith("DATABASE_URL="):
echo                 lines_out.append(f"DATABASE_URL={db_url}\n")
echo                 url_updated = True
echo             else:
echo                 lines_out.append(line)
echo if not url_updated:
echo     lines_out.append(f"DATABASE_URL={db_url}\n")
echo if not any("SECRET_KEY=" in l for l in lines_out):
echo     lines_out.append("SECRET_KEY=9a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z\n")
echo if not any("ALGORITHM=" in l for l in lines_out):
echo     lines_out.append("ALGORITHM=HS256\n")
echo if not any("ACCESS_TOKEN_EXPIRE_MINUTES=" in l for l in lines_out):
echo     lines_out.append("ACCESS_TOKEN_EXPIRE_MINUTES=10080\n")
echo with open(env_path, "w") as f:
echo     f.writelines(lines_out)
echo print(f"[OK] Updated backend/.env with DATABASE_URL={db_url}")
echo.
echo # Update ANPR Engine .env (api/smart_anpr/.env)
echo anpr_env_path = os.path.join(script_dir, "api", "smart_anpr", ".env")
echo if os.path.exists(os.path.dirname(anpr_env_path)):
echo     anpr_db_url = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
echo     anpr_lines = []
echo     anpr_keys_updated = set()
echo     if os.path.exists(anpr_env_path):
echo         with open(anpr_env_path, "r") as f:
echo             for line in f:
echo                 key = line.strip().split("=", 1)[0] if "=" in line and not line.strip().startswith("#") else None
echo                 if key == "DATABASE_URL":
echo                     anpr_lines.append(f"DATABASE_URL={anpr_db_url}\n")
echo                     anpr_keys_updated.add(key)
echo                 elif key == "DATABASE_HOST":
echo                     anpr_lines.append(f"DATABASE_HOST={DB_HOST}\n")
echo                     anpr_keys_updated.add(key)
echo                 elif key == "DATABASE_PORT":
echo                     anpr_lines.append(f"DATABASE_PORT={DB_PORT}\n")
echo                     anpr_keys_updated.add(key)
echo                 elif key == "DATABASE_USER":
echo                     anpr_lines.append(f"DATABASE_USER={DB_USER}\n")
echo                     anpr_keys_updated.add(key)
echo                 elif key == "DATABASE_PASSWORD":
echo                     anpr_lines.append(f"DATABASE_PASSWORD={DB_PASS}\n")
echo                     anpr_keys_updated.add(key)
echo                 elif key == "DATABASE_NAME":
echo                     anpr_lines.append(f"DATABASE_NAME={DB_NAME}\n")
echo                     anpr_keys_updated.add(key)
echo                 else:
echo                     anpr_lines.append(line)
echo     if "DATABASE_URL" not in anpr_keys_updated:
echo         anpr_lines.append(f"DATABASE_URL={anpr_db_url}\n")
echo     with open(anpr_env_path, "w") as f:
echo         f.writelines(anpr_lines)
echo     print(f"[OK] Updated api/smart_anpr/.env with database credentials")
echo else:
echo     print("[INFO] ANPR Engine folder not found, skipping .env update.")
echo.
echo print()
echo print("==========================================")
echo print("  SETUP COMPLETE! Database is ready.")
echo print("==========================================")
) > "!SEED_SCRIPT!"

:: Run the Python script
"!PYTHON_EXE!" "!SEED_SCRIPT!"

:: Cleanup
del "!SEED_SCRIPT!" 2>nul

echo.
pause
