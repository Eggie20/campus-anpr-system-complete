-- OCR scans compatibility migration (PostgreSQL)
-- Makes OCR scan persistence compatible with registration flow payload.

ALTER TABLE IF EXISTS ocr_scans
    ALTER COLUMN front_image_url DROP NOT NULL;

ALTER TABLE IF EXISTS ocr_scans
    ADD COLUMN IF NOT EXISTS scan_type VARCHAR(30) DEFAULT 'drivers_license',
    ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,2),
    ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS scan_id VARCHAR(80),
    ADD COLUMN IF NOT EXISTS raw_text TEXT;
