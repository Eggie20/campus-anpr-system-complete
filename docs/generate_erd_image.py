import urllib.request
import sys

puml_diagram = b"""@startuml
!theme plain
hide circle
skinparam linetype ortho
skinparam nodesep 70
skinparam ranksep 80
skinparam padding 4
skinparam class {
    BackgroundColor white
    BorderColor black
    ArrowColor black
    ArrowThickness 1.2
    FontName "Segoe UI", Arial
    FontSize 12
    HeaderBackgroundColor #f0f0f0
}

entity "USERS" as users {
  PK  id
  --
  UK  email
  UK  username
      password_hash
      full_name
      role
      status
      student_id
      phone_number
      created_at
}

entity "VEHICLES" as vehicles {
  PK  id
  --
  FK  user_id
  UK  plate_number
      type
      brand
      color
      status
      is_on_campus
      last_seen_gate
      expiry_date
}

entity "GATES" as gates {
  PK  id
  --
      name
      location_description
      status
}

entity "CAMERAS" as cameras {
  PK  id
  --
  FK  gate_id
      name
      ip_address
      direction
      is_active
}

entity "ENTRY_LOGS" as entry_logs {
  PK  id
  --
  FK  camera_id
  FK  gate_id
  FK  vehicle_id
  FK  user_id
      detected_plate
      direction
      category
      auth_status
      is_violation
      timestamp
}

entity "ANPR_PLATE_CAPTURES" as captures {
  PK  id
  --
  FK  entry_log_id
  FK  camera_id
  FK  gate_id
  FK  vehicle_id
      plate_raw
      confidence
      alert_kind
      created_at
}

entity "ANPR_ANOMALY_EVENTS" as anomalies {
  PK  id
  --
  FK  capture_id
      kind
      status
      notes
      created_at
}

entity "VIOLATIONS" as violations {
  PK  id
  --
  FK  entry_log_id
  FK  vehicle_id
  FK  resolved_by
      type
      fine_amount
      status
      created_at
}

entity "BLACKLIST_RECORDS" as blacklist {
  PK  id
  --
  FK  vehicle_id
  FK  added_by
      reason
      end_date
      is_active
}

entity "NOTIFICATIONS" as notifications {
  PK  id
  --
  FK  user_id
      type
      title
      is_read
      created_at
}

entity "SYSTEM_LOGS" as system_logs {
  PK  id
  --
  FK  actor_id
      action
      category
      ip_address
}

entity "SETTINGS" as settings {
  PK  key
  --
      value
      description
}

' Define relationships with Crow's foot notation
users ||--o{ vehicles
users ||--o{ notifications
users ||--o{ system_logs

gates ||--o{ cameras
gates ||--o{ entry_logs
cameras ||--o{ entry_logs

vehicles ||--o{ entry_logs
vehicles ||--o{ blacklist

entry_logs ||--o| captures
captures ||--o{ anomalies

entry_logs ||--o{ violations
vehicles ||--o{ violations

@enduml
"""

print("Generating high-resolution PNG via Kroki API...")
try:
    req = urllib.request.Request("https://kroki.io/plantuml/png", data=puml_diagram, headers={'Content-Type': 'text/plain'})
    with urllib.request.urlopen(req, timeout=15) as response:
        with open("Figure7_ERD_Professional.png", "wb") as f:
            f.write(response.read())
    print("SUCCESS: Figure7_ERD_Professional.png created.")
except Exception as e:
    print(f"Failed to generate PNG: {e}")

print("Generating scalable SVG via Kroki API...")
try:
    req2 = urllib.request.Request("https://kroki.io/plantuml/svg", data=puml_diagram, headers={'Content-Type': 'text/plain'})
    with urllib.request.urlopen(req2, timeout=15) as response:
        with open("Figure7_ERD_Professional.svg", "wb") as f:
            f.write(response.read())
    print("SUCCESS: Figure7_ERD_Professional.svg created.")
except Exception as e:
    print(f"Failed to generate SVG: {e}")
