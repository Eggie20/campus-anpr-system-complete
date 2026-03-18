-- =========================================================================================
-- CAMPUS ANPR SYSTEM - COMPREHENSIVE DATABASE SCHEMA v2.0
-- =========================================================================================
-- Database:    PostgreSQL 14+
-- File:        schema_all.sql
-- Description: Full normalized schema for the Campus ANPR System covering:
--              User Management, Vehicle Registration, ANPR Detection,
--              Camera Surveillance, Security Personnel, Visitor Management,
--              Analytics, Notifications, Audit Logging & System Configuration.
--
-- Usage:       psql -U postgres -d campus_anpr -f schema_all.sql
--              OR import via pgAdmin query tool
-- =========================================================================================


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  0. CLEAN SLATE (Drop existing objects if re-importing)                    │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS duty_logs CASCADE;
DROP TABLE IF EXISTS security_shifts CASCADE;
DROP TABLE IF EXISTS camera_settings CASCADE;
DROP TABLE IF EXISTS visitor_vehicles CASCADE;
DROP TABLE IF EXISTS visitors CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS violations CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS entry_logs CASCADE;
DROP TABLE IF EXISTS blacklist_records CASCADE;
DROP TABLE IF EXISTS cameras CASCADE;
DROP TABLE IF EXISTS gates CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS ocr_scans CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop ENUMs
DROP TYPE IF EXISTS sex_type CASCADE;
DROP TYPE IF EXISTS log_category CASCADE;
DROP TYPE IF EXISTS camera_recording_mode CASCADE;
DROP TYPE IF EXISTS duty_status CASCADE;
DROP TYPE IF EXISTS gate_status CASCADE;
DROP TYPE IF EXISTS violation_type CASCADE;
DROP TYPE IF EXISTS entry_direction CASCADE;
DROP TYPE IF EXISTS vehicle_type CASCADE;
DROP TYPE IF EXISTS vehicle_status CASCADE;
DROP TYPE IF EXISTS account_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  1. EXTENSIONS                                                             │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  2. ENUM TYPES (11 total)                                                  │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TYPE user_role AS ENUM (
    'admin', 'student', 'faculty', 'staff', 'security', 'visitor'
);

CREATE TYPE account_status AS ENUM (
    'pending', 'active', 'suspended', 'rejected', 'inactive'
);

CREATE TYPE vehicle_status AS ENUM (
    'pending', 'approved', 'rejected', 'blacklisted', 'expired'
);

CREATE TYPE vehicle_type AS ENUM (
    'car', 'motorcycle', 'van', 'truck', 'other'
);

CREATE TYPE entry_direction AS ENUM (
    'entry', 'exit'
);

CREATE TYPE violation_type AS ENUM (
    'unregistered', 'blacklisted', 'speeding',
    'wrong_way', 'unauthorized_access', 'expired_registration'
);

CREATE TYPE gate_status AS ENUM (
    'open', 'closed', 'maintenance'
);

CREATE TYPE duty_status AS ENUM (
    'on_duty', 'standby', 'off_duty'
);

CREATE TYPE camera_recording_mode AS ENUM (
    'always', 'motion', 'plate'
);

CREATE TYPE log_category AS ENUM (
    'entry', 'exit', 'alert', 'system'
);

CREATE TYPE sex_type AS ENUM (
    'Male', 'Female', 'Other'
);


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  3. CORE IDENTITY TABLES                                                   │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- ─── USERS ──────────────────────────────────────────────────────────────────
-- Central identity store for all campus members
-- Roles: admin, student, faculty, staff, security, visitor
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email               VARCHAR(255) UNIQUE NOT NULL,
    username            VARCHAR(50) UNIQUE NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    role                user_role NOT NULL DEFAULT 'student',
    status              account_status NOT NULL DEFAULT 'pending',

    -- Legal Identity
    first_name          VARCHAR(100) NOT NULL,
    middle_name         VARCHAR(100),
    last_name           VARCHAR(100) NOT NULL,
    full_name           VARCHAR(255) GENERATED ALWAYS AS (
                            TRIM(first_name || ' ' || COALESCE(middle_name || ' ', '') || last_name)
                        ) STORED,
    sex                 sex_type,
    birth_date          DATE,
    nationality         VARCHAR(50) DEFAULT 'Filipino',

    -- Contact & Communications
    phone_number        VARCHAR(20),
    address             TEXT,

    -- Institutional Data
    student_id          VARCHAR(50),          -- STU-2024-XXXX, FAC-2024-XXX, etc.
    department          VARCHAR(100),
    academic_program    VARCHAR(100),         -- "BS Computer Science"
    year_level          VARCHAR(20),          -- "4th Year"

    -- Driver's License
    drivers_license_no  VARCHAR(50),
    license_expiry_date DATE,

    -- Media
    profile_image_url   TEXT,

    -- Timestamps
    last_login_at       TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at          TIMESTAMP WITH TIME ZONE  -- Soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_student_id ON users(student_id);


-- ─── OCR_SCANS ──────────────────────────────────────────────────────────────
-- Stores ID scan proofs from registration (driver's license, OR/CR)
CREATE TABLE ocr_scans (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    scan_type           VARCHAR(30) DEFAULT 'drivers_license',  -- 'drivers_license', 'or_cr', 'plate'
    front_image_url     TEXT NOT NULL,
    back_image_url      TEXT,
    extracted_data      JSONB,               -- Raw OCR output: name, license_no, address, etc.
    confidence_score    DECIMAL(5,2),
    is_verified         BOOLEAN DEFAULT FALSE,
    verified_by         UUID REFERENCES users(id),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  4. VEHICLE TABLES                                                         │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- ─── VEHICLES ───────────────────────────────────────────────────────────────
-- All registered campus vehicles
CREATE TABLE vehicles (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID REFERENCES users(id) ON DELETE CASCADE,

    plate_number            VARCHAR(20) UNIQUE NOT NULL,
    type                    vehicle_type NOT NULL DEFAULT 'car',
    make                    VARCHAR(50),            -- Brand: Toyota, Honda
    model                   VARCHAR(50),            -- Model: Vios, Click 125i
    color                   VARCHAR(30),
    year                    INTEGER,                -- Manufacturing year
    engine_number           VARCHAR(50),

    status                  vehicle_status NOT NULL DEFAULT 'pending',
    registration_proof_url  TEXT,

    -- Permit tracking
    registration_date       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date             TIMESTAMP WITH TIME ZONE,
    approved_by             UUID REFERENCES users(id),
    approved_at             TIMESTAMP WITH TIME ZONE,

    -- Real-time campus tracking
    is_on_campus            BOOLEAN DEFAULT FALSE,
    last_seen_gate          VARCHAR(100),
    last_seen_at            TIMESTAMP WITH TIME ZONE,

    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at              TIMESTAMP WITH TIME ZONE  -- Soft delete
);

CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX idx_vehicles_user ON vehicles(user_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);


-- ─── BLACKLIST_RECORDS ──────────────────────────────────────────────────────
-- Vehicle blacklisting history
CREATE TABLE blacklist_records (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id      UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    reason          TEXT NOT NULL,
    added_by        UUID REFERENCES users(id),
    start_date      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date        TIMESTAMP WITH TIME ZONE,       -- NULL = permanent
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  5. VISITOR MANAGEMENT                                                     │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- ─── VISITORS ───────────────────────────────────────────────────────────────
-- Guest/visitor check-in records
CREATE TABLE visitors (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name           VARCHAR(255) NOT NULL,
    phone_number        VARCHAR(20),
    purpose_of_visit    TEXT,
    host_user_id        UUID REFERENCES users(id),   -- Faculty/Staff being visited
    id_type             VARCHAR(50),                  -- "Driver's License", "Company ID"
    id_number           VARCHAR(50),

    check_in_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    check_out_at        TIMESTAMP WITH TIME ZONE,
    gate_id             UUID,                         -- FK added after gates table
    created_by          UUID REFERENCES users(id),    -- Security officer who logged them
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ─── VISITOR_VEHICLES ───────────────────────────────────────────────────────
-- Temporary vehicle permits for visitors
CREATE TABLE visitor_vehicles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id      UUID REFERENCES visitors(id) ON DELETE CASCADE,
    plate_number    VARCHAR(20) NOT NULL,
    type            vehicle_type DEFAULT 'car',
    make            VARCHAR(50),
    model           VARCHAR(50),
    color           VARCHAR(30),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  6. INFRASTRUCTURE TABLES (Gates & Cameras)                                │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- ─── GATES ──────────────────────────────────────────────────────────────────
-- Physical entry/exit points on campus
CREATE TABLE gates (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                    VARCHAR(100) NOT NULL,      -- "Main Gate", "Back Gate"
    location_description    TEXT,
    status                  gate_status DEFAULT 'open',
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add FK from visitors to gates now that gates table exists
ALTER TABLE visitors
    ADD CONSTRAINT fk_visitors_gate
    FOREIGN KEY (gate_id) REFERENCES gates(id);


-- ─── CAMERAS ────────────────────────────────────────────────────────────────
-- ANPR surveillance nodes linked to gates
CREATE TABLE cameras (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gate_id         UUID REFERENCES gates(id) ON DELETE SET NULL,
    name            VARCHAR(100) NOT NULL,          -- "Main Gate - Front Left"
    position        VARCHAR(50),                    -- "Front Left", "Rear Right"
    ip_address      VARCHAR(45),
    stream_url      TEXT,                           -- RTSP URL
    direction       entry_direction DEFAULT 'entry',
    is_active       BOOLEAN DEFAULT TRUE,
    is_streaming    BOOLEAN DEFAULT FALSE,

    -- Status tracking
    last_plate_detected     VARCHAR(20),
    last_plate_detected_at  TIMESTAMP WITH TIME ZONE,
    offline_since           TIMESTAMP WITH TIME ZONE,

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ─── CAMERA_SETTINGS ────────────────────────────────────────────────────────
-- Per-camera configuration (detection threshold, recording mode)
CREATE TABLE camera_settings (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camera_id               UUID UNIQUE REFERENCES cameras(id) ON DELETE CASCADE,
    detection_threshold     INTEGER DEFAULT 85 CHECK (detection_threshold BETWEEN 0 AND 100),
    recording_mode          camera_recording_mode DEFAULT 'motion',
    ai_night_vision         BOOLEAN DEFAULT TRUE,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  7. SECURITY PERSONNEL                                                     │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- ─── SECURITY_SHIFTS ────────────────────────────────────────────────────────
-- Shift scheduling and duty assignment for security officers
CREATE TABLE security_shifts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id        VARCHAR(20),                -- "SEC-001"
    duty_status     duty_status DEFAULT 'off_duty',
    assigned_post   VARCHAR(50),                -- "Main Gate", "Back Gate", "Roving"
    shift_start     TIME NOT NULL,              -- e.g. "06:00:00"
    shift_end       TIME NOT NULL,              -- e.g. "14:00:00"
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ─── DUTY_LOGS ──────────────────────────────────────────────────────────────
-- Daily clock-in/out and activity tracking per officer
CREATE TABLE duty_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id        UUID REFERENCES security_shifts(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    clock_in        TIMESTAMP WITH TIME ZONE,
    clock_out       TIMESTAMP WITH TIME ZONE,
    vehicles_logged INTEGER DEFAULT 0,
    notes           TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  8. LOGGING & TRACKING                                                     │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- ─── ENTRY_LOGS ─────────────────────────────────────────────────────────────
-- High-volume ANPR detection logs (every plate read)
CREATE TABLE entry_logs (
    id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camera_id                       UUID REFERENCES cameras(id),
    gate_id                         UUID REFERENCES gates(id),

    detected_plate_number           VARCHAR(20) NOT NULL,
    vehicle_id                      UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    user_id                         UUID REFERENCES users(id) ON DELETE SET NULL,

    timestamp                       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    direction                       entry_direction NOT NULL,
    category                        log_category DEFAULT 'entry',
    confidence_score                DECIMAL(5,2),
    snapshot_image_url              TEXT,

    -- Authorization result
    authorization_status            VARCHAR(30) DEFAULT 'authorized',  -- authorized, unregistered, expired, blacklisted
    is_violation                    BOOLEAN DEFAULT FALSE,
    requires_manual_verification    BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_logs_timestamp ON entry_logs(timestamp);
CREATE INDEX idx_logs_plate ON entry_logs(detected_plate_number);
CREATE INDEX idx_logs_direction ON entry_logs(direction);
CREATE INDEX idx_logs_gate ON entry_logs(gate_id);
CREATE INDEX idx_logs_vehicle ON entry_logs(vehicle_id);


-- ─── VIOLATIONS ─────────────────────────────────────────────────────────────
-- Security incidents linked to specific entry log detections
CREATE TABLE violations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_log_id    UUID REFERENCES entry_logs(id) ON DELETE CASCADE,
    vehicle_id      UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    type            violation_type NOT NULL,
    description     TEXT,
    fine_amount     DECIMAL(10, 2) DEFAULT 0.00,
    status          VARCHAR(20) DEFAULT 'unresolved',  -- unresolved, resolved, escalated
    resolved_by     UUID REFERENCES users(id),
    resolved_at     TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ─── NOTIFICATIONS ──────────────────────────────────────────────────────────
-- User-facing alerts and messages
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    message     TEXT NOT NULL,
    type        VARCHAR(20) DEFAULT 'info',     -- info, success, warning, danger
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);


-- ─── SYSTEM_LOGS ────────────────────────────────────────────────────────────
-- Admin audit trail for all system actions
CREATE TABLE system_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,          -- "user.create", "vehicle.approve", etc.
    category    log_category DEFAULT 'system',
    details     JSONB,                          -- Flexible payload for any action
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_system_logs_actor ON system_logs(actor_id);
CREATE INDEX idx_system_logs_action ON system_logs(action);


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  9. SYSTEM CONFIGURATION                                                   │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- ─── SETTINGS ───────────────────────────────────────────────────────────────
-- Global key-value configuration store
CREATE TABLE settings (
    key             VARCHAR(50) PRIMARY KEY,
    value           JSONB NOT NULL,
    description     TEXT,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  10. SEED DATA                                                             │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- ─── Default System Settings ────────────────────────────────────────────────
INSERT INTO settings (key, value, description) VALUES
    ('system_name',             '"CampusSecure ANPR"',      'System name displayed across dashboards'),
    ('institution_name',        '"Caraga State University"', 'Operating institution'),
    ('timezone',                '"Asia/Manila"',             'System-wide timezone (UTC+8)'),
    ('ocr_threshold',           '85',                        'Minimum OCR confidence score for auto-approval'),
    ('plate_read_precision',    '"medium"',                  'ANPR accuracy level: low, medium, high'),
    ('auto_logout_minutes',     '30',                        'Session timeout in minutes of inactivity'),
    ('log_retention_days',      '90',                        'Days to retain entry/exit logs before purge'),
    ('allow_guest_entry',       'false',                     'Allow unregistered plates to enter campus'),
    ('intrusion_alerts',        'true',                      'Push alerts for unregistered vehicle detections'),
    ('camera_offline_alerts',   'true',                      'Notify admin when a camera node disconnects'),
    ('nightly_analytics',       'false',                     'Send daily traffic summary to administrators'),
    ('save_plate_snapshots',    'true',                      'Archive a photo of each detected plate'),
    ('max_vehicles_student',    '2',                         'Maximum vehicles per student account'),
    ('max_vehicles_faculty',    '3',                         'Maximum vehicles per faculty account');


-- ─── Default Gates ──────────────────────────────────────────────────────────
INSERT INTO gates (name, location_description, status) VALUES
    ('Main Gate', 'Primary entrance/exit at the front of the campus', 'open'),
    ('Back Gate', 'Secondary entrance/exit at the rear of the campus', 'open');


-- ─── Default Accounts (From README) ──────────────────────────────────────────
-- Passwords match the README documentation (e.g. AdminPassword123)
-- Uses bcrypt hashes for security
INSERT INTO users (email, username, password_hash, role, status, first_name, last_name) VALUES
    ('admin@example.com', 'admin_user', '$2b$12$76g/j6y6OukPEsicwZ113e3o.StqrTAc4tGdP8ZpVMEU/AsjpEe1O', 'admin', 'active', 'System', 'Admin'),
    ('security@example.com', 'security_user', '$2b$12$qjRJvLxj5fQq1RX/pXbvuePTBo25uwkhhccotqvXM3Z1sXDVpVLf6', 'security', 'active', 'Security', 'Officer'),
    ('student@example.com', 'student_user', '$2b$12$Xt.dh/Od3OnlOFdep5trw.sVctDR92IdEING0Z7QflgX7MzMHQYs.', 'student', 'active', 'Campus', 'Student'),
    ('faculty@example.com', 'faculty_user', '$2b$12$/MzQrlnLN1Lse0TnRPFJYOeeRjUjxNVCSeAZhk2Fqg0AIW4pS1V9C', 'faculty', 'active', 'Campus', 'Faculty'),
    ('staff@example.com', 'staff_user', '$2b$12$P54KHyzcd83WZBbEjv/TTuU0rAaDIlOnU7gBCfBWmT11k6WtTXor.', 'staff', 'active', 'Campus', 'Staff'),
    ('visitor@example.com', 'visitor_user', '$2b$12$kNzr4LSUeV5kpAkRWF5xnOzKFxoTHk8Xew6xkweyULNa9lMAIy5s.', 'visitor', 'active', 'Campus', 'Visitor');


-- =========================================================================================
-- SCHEMA COMPLETE — 16 tables, 11 ENUMs, 14 settings, 2 gates, 1 admin user
-- =========================================================================================
