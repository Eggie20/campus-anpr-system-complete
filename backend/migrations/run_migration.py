import sys
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add parent directory to path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables from the same directory as this script (backend/.env)
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("[ERROR] DATABASE_URL not found in .env file.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

migration_sql = """
-- 1. Update USERS table
ALTER TABLE users ADD COLUMN IF NOT EXISTS section VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS faculty_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS position VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS visitor_purpose VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS visitor_host VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS visitor_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS visitor_valid_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS visitor_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS visitor_duration VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS entry_motive VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS drivers_license_no VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS license_expiry_date DATE;

-- 2. Update VEHICLES table
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS other_vehicle_type VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS anpr_flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS anpr_flag_msg TEXT;
"""

def run_migration():
    if DATABASE_URL:
        db_host = DATABASE_URL.split('@')[-1]
        print(f"[INFO] Connecting to database at {db_host}")
    else:
        print("[ERROR] DATABASE_URL is not set.")
        return
    try:
        with engine.connect() as conn:
            # We need to run each statement separately or use a transaction
            # but simple text execution of the block usually works in Postgres
            conn.execute(text(migration_sql))
            conn.commit()
            print("[SUCCESS] Database migration completed. All missing columns added.")
    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")

if __name__ == "__main__":
    run_migration()
