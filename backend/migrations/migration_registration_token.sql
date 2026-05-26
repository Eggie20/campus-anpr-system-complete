-- =============================================================================
-- MIGRATION: Add registration token & secure file paths to users table
-- Version: 1.1.0
-- Date: 2026-04-03
-- Description: Adds UUID registration_token, and server-side file paths for
--              ID photo, OR/CR document, and QR code image storage.
-- =============================================================================

-- Ensure uuid-ossp extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add registration token column (unique, auto-generated UUID)
ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_token UUID DEFAULT uuid_generate_v4() UNIQUE;

-- Add secure file path columns (server-side only, never publicly accessible)
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_photo_path TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS orcr_photo_path TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS qr_code_path TEXT;

-- Backfill existing users with registration tokens
UPDATE users SET registration_token = uuid_generate_v4() WHERE registration_token IS NULL;
