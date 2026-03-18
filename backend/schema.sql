-- =========================================================================================
-- CAMPUS ANPR SYSTEM - FULL DATABASE SCHEMA
-- Version: 1.0.0
-- Database: PostgreSQL 14+
-- Description: Normalized schema for User Management, Vehicle ANPR, and Admin Analytics
-- =========================================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'student', 'faculty', 'security');
CREATE TYPE account_status AS ENUM ('pending', 'active', 'suspended', 'rejected');
CREATE TYPE vehicle_status AS ENUM ('pending', 'approved', 'rejected', 'blacklisted');
CREATE TYPE entry_direction AS ENUM ('entry', 'exit');
CREATE TYPE violation_type AS ENUM ('unregistered', 'blacklisted', 'speeding', 'wrong_way', 'unauthorized_access');
CREATE TYPE gate_status AS ENUM ('open', 'closed', 'maintenance');

-- =========================================================================================
-- 3. CORE TABLES
-- =========================================================================================

-- [USERS] Central identity store
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    status account_status NOT NULL DEFAULT 'pending',
    
    -- Role-Specific Data
    student_id VARCHAR(50), 
    department VARCHAR(100),
    phone_number VARCHAR(20),
    profile_image_url TEXT,
    
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- [OCR_SCANS] Registration proofs
CREATE TABLE ocr_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    front_image_url TEXT NOT NULL,
    back_image_url TEXT NOT NULL,
    extracted_data JSONB, -- Stores name, license_no, address, etc.
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [VEHICLES] Registered vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    make VARCHAR(50),
    model VARCHAR(50),
    color VARCHAR(30),
    type VARCHAR(20), -- 'car', 'motorcycle'
    
    status vehicle_status NOT NULL DEFAULT 'pending',
    registration_proof_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);

-- [BLACKLIST_RECORDS] History of vehicle blacklisting
CREATE TABLE blacklist_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    added_by UUID REFERENCES users(id), -- Admin
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE, -- Null = permanent
    is_active BOOLEAN DEFAULT TRUE
);

-- =========================================================================================
-- 4. INFRASTRUCTURE TABLES (Gates & Cameras)
-- =========================================================================================

-- [GATES] Physical entry/exit points
CREATE TABLE gates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- e.g., "Main Entrance"
    location_description TEXT,
    status gate_status DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [CAMERAS] ANPR Devices
CREATE TABLE cameras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gate_id UUID REFERENCES gates(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    stream_url TEXT,
    direction entry_direction DEFAULT 'entry',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================================
-- 5. LOGGING & TRACKING TABLES
-- =========================================================================================

-- [ENTRY_LOGS] High-volume detection logs
CREATE TABLE entry_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camera_id UUID REFERENCES cameras(id),
    
    detected_plate_number VARCHAR(20) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL, -- Matched vehicle
    
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    direction entry_direction NOT NULL,
    confidence_score DECIMAL(5,2),
    snapshot_image_url TEXT,
    
    is_violation BOOLEAN DEFAULT FALSE,
    requires_manual_verification BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_logs_timestamp ON entry_logs(timestamp);
CREATE INDEX idx_logs_plate ON entry_logs(detected_plate_number);

-- [VIOLATIONS] Specific incidents linked to logs
CREATE TABLE violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_log_id UUID REFERENCES entry_logs(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    type violation_type NOT NULL,
    description TEXT,
    fine_amount DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, paid, disputed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [NOTIFICATIONS] User alerts
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [SYSTEM_LOGS] Admin audit trail
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [SETTINGS] Global configuration
CREATE TABLE settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================================
-- 6. DEFAULT DATA (Seeding)
-- =========================================================================================

-- Default Settings
INSERT INTO settings (key, value, description) VALUES
('ocr_threshold', '85', 'Minimum confidence score for auto-approval'),
('allow_guest_entry', 'false', 'Whether generic plates can enter without match');

-- Initial Gate
INSERT INTO gates (name, status) VALUES ('Main Gate', 'open');

