-- Additive migration for existing campus_anpr databases (run after backup).
-- psql -U postgres -d campus_anpr -f migration_anpr.sql

CREATE TYPE anpr_alert_kind AS ENUM (
    'access',
    'anomaly_unregistered',
    'anomaly_low_confidence',
    'anomaly_rapid_movement',
    'anomaly_frequent_unregistered',
    'breach_blacklisted',
    'breach_expired',
    'breach_rejected'
);

CREATE TABLE IF NOT EXISTS anpr_plate_captures (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_normalized        VARCHAR(20) NOT NULL,
    plate_raw               VARCHAR(40),
    confidence_score        DECIMAL(5,2),
    brand                   VARCHAR(80),
    color                   VARCHAR(80),
    vehicle_type_detected   VARCHAR(50),
    camera_id               UUID REFERENCES cameras(id) ON DELETE SET NULL,
    gate_id                 UUID REFERENCES gates(id) ON DELETE SET NULL,
    vehicle_id              UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    recorded_by             UUID REFERENCES users(id) ON DELETE SET NULL,
    alert_kind              anpr_alert_kind NOT NULL,
    payload                 JSONB,
    entry_log_id            UUID REFERENCES entry_logs(id) ON DELETE SET NULL,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anpr_captures_plate ON anpr_plate_captures(plate_normalized);
CREATE INDEX IF NOT EXISTS idx_anpr_captures_created ON anpr_plate_captures(created_at);

CREATE TABLE IF NOT EXISTS anpr_anomaly_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capture_id      UUID NOT NULL REFERENCES anpr_plate_captures(id) ON DELETE CASCADE,
    kind            anpr_alert_kind NOT NULL,
    status          VARCHAR(20) DEFAULT 'open',
    notes           TEXT,
    tags            JSONB DEFAULT '[]'::jsonb,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anpr_anomalies_capture ON anpr_anomaly_events(capture_id);
CREATE INDEX IF NOT EXISTS idx_anpr_anomalies_status ON anpr_anomaly_events(status);
