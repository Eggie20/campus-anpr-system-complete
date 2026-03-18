# Campus ANPR System - Database Schema Design (PostgreSQL)

This document defines the normalized database schema for the Campus ANPR System, designed to support role-based access, OCR registration, and real-time tracking.

## 🏗️ Schema Overview (ERD Description)

The schema is built around the **User** and **Vehicle** core entities.

1.  **Users Table**: Central identity store for Students, Faculty, Security, and Admins.
    - One User usually owns One or Many Vehicles.
    - Linked to **OCR Scans** for identity verification.
2.  **Vehicles Table**: Stores vehicle details and registration status.
    - Linked to a specific User.
3.  **Cameras Table**: Represents physical ANPR devices and gates.
4.  **Entry Logs Table**: The high-volume table recording every detection event.
    - Links to **Cameras** (where it happened).
    - Links to **Vehicles** (what was detected).
5.  **Notifications & Logs**: Support tables for system alerts and audit trails.

---

## 💾 SQL Schema Definition

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums for status and roles
CREATE TYPE user_role AS ENUM ('admin', 'student', 'faculty', 'security');
CREATE TYPE account_status AS ENUM ('pending', 'active', 'suspended', 'rejected');
CREATE TYPE vehicle_status AS ENUM ('pending', 'approved', 'rejected', 'blacklisted');
CREATE TYPE entry_direction AS ENUM ('entry', 'exit');

-- =============================================
-- 1. USERS TABLE
-- Stores all system users with role-based access
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    status account_status NOT NULL DEFAULT 'pending',

    -- Extracted from OCR or Profile
    student_id VARCHAR(50), -- Nullable (Faculty/Security won't have it)
    department VARCHAR(100),
    phone_number VARCHAR(20),

    -- Metadata
    profile_image_url TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete support
);

-- Index for fast login lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =============================================
-- 2. OCR SCANS TABLE
-- Stores proof of identity documents (Driver's License)
-- =============================================
CREATE TABLE ocr_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    front_image_url TEXT NOT NULL,
    back_image_url TEXT NOT NULL,

    -- JSONB for flexibility in changing ID formats
    extracted_data JSONB,

    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. VEHICLES TABLE
-- Registered vehicles belonging to users
-- =============================================
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    plate_number VARCHAR(20) UNIQUE NOT NULL,
    make VARCHAR(50),
    model VARCHAR(50),
    color VARCHAR(30),
    type VARCHAR(20), -- Car, Motorcycle, etc.

    status vehicle_status NOT NULL DEFAULT 'pending',

    -- Identifying registration document (OR/CR)
    registration_proof_url TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Index for fast ANPR lookups
CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);

-- =============================================
-- 4. CAMERAS TABLE
-- Physical camera and gate configuration
-- =============================================
CREATE TABLE cameras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    location_name VARCHAR(100) NOT NULL, -- "Main Gate", "Back Gate"

    ip_address VARCHAR(45),
    stream_url TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. ENTRY LOGS TABLE (High Volume)
-- Records all vehicle movements
-- =============================================
CREATE TABLE entry_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camera_id UUID REFERENCES cameras(id),

    -- The detected text (may not match a registered vehicle)
    detected_plate_number VARCHAR(20) NOT NULL,

    -- Link to registered vehicle if matched
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,

    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    direction entry_direction NOT NULL, -- Entry/Exit logic

    confidence_score DECIMAL(5,2), -- e.g., 98.50
    snapshot_image_url TEXT, -- Proof image

    is_violation BOOLEAN DEFAULT FALSE,
    violation_reason VARCHAR(255) -- "Unregistered", "Blacklisted"
);

-- Partition or heavy indexing recommended for production
CREATE INDEX idx_logs_timestamp ON entry_logs(timestamp);
CREATE INDEX idx_logs_plate ON entry_logs(detected_plate_number);
CREATE INDEX idx_logs_vehicle ON entry_logs(vehicle_id);

-- =============================================
-- 6. NOTIFICATIONS TABLE
-- Real-time alerts for users and guards
-- =============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info', -- info, warning, success, error

    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. SYSTEM LOGS TABLE (Audit)
-- Admin audit trail
-- =============================================
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,

    action VARCHAR(100) NOT NULL, -- "USER_LOGIN", "APPROVE_VEHICLE"
    details JSONB, -- Flexible metadata storage

    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. SETTINGS TABLE
-- Global configuration
-- =============================================
CREATE TABLE settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔄 Relationships Summary

- **Users 1:N Vehicles**: A student can register multiple cars/bikes.
- **Users 1:1 OCR Scan**: Each user has one identity verification record.
- **Vehicles 1:N Logs**: One vehicle generates many entry/exit logs.
- **Cameras 1:N Logs**: One camera captures many logs.

## 🔐 Security & Optimization Notes

1.  **Passwords**: Store only bcrypt/Argon2 hashes in `password_hash`.
2.  **Soft Deletes**: `users` and `vehicles` use `deleted_at`. Queries should always filter `WHERE deleted_at IS NULL`.
3.  **JSONB**: Used for `extracted_data` in OCR Scans to allow for different ID types (Driver's License vs Student ID) without changing the schema.
4.  **Indexes**: added to high-lookup fields (`email`, `plate_number`, `timestamp`) to ensure Dashboard and Login speeds remain fast as data grows.
