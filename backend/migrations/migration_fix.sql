-- MIGRATION SCRIPT: Synchronize Database with latest Frontend features
-- Run this in your PostgreSQL query tool (pgAdmin) or via psql

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

-- 3. Verify changes
DO $$ 
BEGIN
    RAISE NOTICE 'Migration Complete: New columns added to users and vehicles tables.';
END $$;
