-- SMART-PLATE ANPR Detection Tables (added to campus_anpr database)

CREATE TABLE IF NOT EXISTS detected_vehicles (
    id SERIAL PRIMARY KEY,
    detection_id VARCHAR(50) UNIQUE NOT NULL,
    camera_id INT NOT NULL,
    plate_number VARCHAR(20),
    plate_confidence FLOAT,
    vehicle_type VARCHAR(30),
    vehicle_brand VARCHAR(50),
    vehicle_model VARCHAR(50),
    vehicle_color VARCHAR(30),
    detection_model VARCHAR(20),
    detection_confidence FLOAT,
    ocr_model VARCHAR(20),
    ocr_confidence FLOAT,
    frame_timestamp TIMESTAMP NOT NULL,
    detection_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_path VARCHAR(255),
    plate_image_path VARCHAR(255),
    raw_ocr_text VARCHAR(100),
    normalized_plate_text VARCHAR(20),
    is_authorized BOOLEAN,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_det_detection_id ON detected_vehicles (detection_id);
CREATE INDEX IF NOT EXISTS idx_det_camera_id ON detected_vehicles (camera_id);
CREATE INDEX IF NOT EXISTS idx_det_plate_number ON detected_vehicles (plate_number);
CREATE INDEX IF NOT EXISTS idx_det_frame_timestamp ON detected_vehicles (frame_timestamp);

CREATE TABLE IF NOT EXISTS anpr_camera_config (
    id SERIAL PRIMARY KEY,
    camera_id INT UNIQUE NOT NULL,
    camera_name VARCHAR(100) NOT NULL,
    camera_type VARCHAR(20) CHECK (camera_type IN ('usb', 'rtsp', 'file')) NOT NULL,
    camera_source VARCHAR(255) NOT NULL,
    location VARCHAR(100),
    gate_id VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    frame_width INT DEFAULT 1920,
    frame_height INT DEFAULT 1080,
    fps INT DEFAULT 30,
    resolution VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_anpr_cam_camera_id ON anpr_camera_config (camera_id);
CREATE INDEX IF NOT EXISTS idx_anpr_cam_is_active ON anpr_camera_config (is_active);

INSERT INTO anpr_camera_config (camera_id, camera_name, camera_type, camera_source, location, gate_id, is_active)
VALUES
    (1, 'Main Gate Camera', 'usb', '0', 'Main Gate', 'GATE_01', TRUE),
    (2, 'Side Gate Camera', 'rtsp', 'rtsp://192.168.1.101:554/stream', 'Side Gate', 'GATE_02', TRUE)
ON CONFLICT (camera_id) DO NOTHING;
