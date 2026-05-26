# Campus ANPR ERD - Reference Style

This version follows the requested arrangement and includes real schema connections. Dark lines show the main ANPR flow; lighter lines show additional real foreign-key connections.

## Relationships

| Parent | Child | Cardinality | Child FK |
| --- | --- | --- | --- |
| USERS | VEHICLES | 1 to 0..N | `vehicles.user_id` |
| USERS | VEHICLES | 1 to 0..N | `vehicles.approved_by` |
| VEHICLES | ENTRY_LOGS | 1 to 0..N | `entry_logs.vehicle_id` |
| USERS | ENTRY_LOGS | 1 to 0..N | `entry_logs.user_id` |
| CAMERAS | ENTRY_LOGS | 1 to 0..N | `entry_logs.camera_id` |
| GATES | ENTRY_LOGS | 1 to 0..N | `entry_logs.gate_id` |
| ENTRY_LOGS | ANPR_PLATE_CAPTURES | 1 to 0..N | `anpr_plate_captures.entry_log_id` |
| VEHICLES | ANPR_PLATE_CAPTURES | 1 to 0..N | `anpr_plate_captures.vehicle_id` |
| USERS | ANPR_PLATE_CAPTURES | 1 to 0..N | `anpr_plate_captures.recorded_by` |
| CAMERAS | ANPR_PLATE_CAPTURES | 1 to 0..N | `anpr_plate_captures.camera_id` |
| GATES | ANPR_PLATE_CAPTURES | 1 to 0..N | `anpr_plate_captures.gate_id` |
| ANPR_PLATE_CAPTURES | ANPR_ANOMALY_EVENTS | 1 to 0..N | `anpr_anomaly_events.capture_id` |
| ENTRY_LOGS | VIOLATIONS | 1 to 0..N | `violations.entry_log_id` |
| VEHICLES | VIOLATIONS | 1 to 0..N | `violations.vehicle_id` |
| USERS | VIOLATIONS | 1 to 0..N | `violations.resolved_by` |
| VEHICLES | BLACKLIST_RECORDS | 1 to 0..N | `blacklist_records.vehicle_id` |
| USERS | BLACKLIST_RECORDS | 1 to 0..N | `blacklist_records.added_by` |
| GATES | CAMERAS | 1 to 0..N | `cameras.gate_id` |
| CAMERAS | CAMERA_SETTINGS | 1 to 0..1 | `camera_settings.camera_id` |
| USERS | NOTIFICATIONS | 1 to 0..N | `notifications.user_id` |
| USERS | OCR_SCANS | 1 to 0..N | `ocr_scans.user_id` |
| USERS | OCR_SCANS | 1 to 0..N | `ocr_scans.verified_by` |

`SETTINGS` exists in the schema but has no foreign-key relationship, so it is intentionally not connected.
