# CSUCC ANPR — System diagrams (Figures 3–8)

Documentation for the architecture and analysis views referenced in `CSUCC_ANPR_Dashboard_Prompt.md`. Diagrams use [Mermaid](https://mermaid.js.org/) (render in GitHub, VS Code, or export to PNG/SVG).

---

## Figure 3 — Current DFD (Diagram 0)

Manual gate process before ANPR automation.

```mermaid
flowchart LR
  SG[Security Guard]
  LB[Manual logbook entry]
  PR[Paper records]
  V[Visitor sign-in / out]

  SG --> LB
  LB --> PR
  V --> LB
```

---

## Figure 4 — Proposed context DFD

External entities and the CSUCC ANPR system boundary.

```mermaid
flowchart LR
  O[Vehicle Owner / Driver]
  SO[Security Officer]
  AD[Administrator]
  CN[Camera node]
  SP[SMART-PLATE API\nPaddleOCR]
  SYS[CSUCC ANPR System]

  O --> SYS
  SO --> SYS
  AD --> SYS
  CN --> SYS
  SYS --> SP
```

---

## Figure 5 — Proposed Diagram 0 DFD (main processes)

```mermaid
flowchart TB
  P1[1. Vehicle Registration\nTesseractOCR → users, vehicles, ocr_scans]
  P2[2. Live Detection\nCamera → PaddleOCR → anpr_plate_captures → entry_logs]
  P3[3. Alert Management\nanpr_anomaly_events → Dismiss/Escalate/Resolve → violations, system_logs]
  P4[4. Vehicle Tracking\nentry/exit → vehicles.is_on_campus → stats]
  P5[5. Reporting\nentry_logs, anpr_plate_captures → analytics]

  P1 --> P2
  P2 --> P3
  P2 --> P4
  P3 --> P5
  P4 --> P5
```

---

## Figure 6 — Use case diagram

```mermaid
flowchart TB
  D[Driver]
  SEC[Security Officer]
  ADM[System Admin]

  D --> UC1[Register vehicle]
  D --> UC2[Enter campus]
  D --> UC3[View own entry logs]

  SEC --> UC4[Monitor live feed]
  SEC --> UC5[Manage alerts]
  SEC --> UC6[Simulate detection]
  SEC --> UC7[View vehicle info]

  ADM --> UC8[Manage users]
  ADM --> UC9[Approve vehicles]
  ADM --> UC10[View reports]
  ADM --> UC11[Manage cameras]
  ADM --> UC12[Reset vehicle counts]
  ADM --> UC13[Configure settings]
```

---

## Figure 7 — ERD (primary relationships)

Aligned with `schema_all.sql` v2.0.

```mermaid
erDiagram
  users ||--o{ vehicles : owns
  vehicles ||--o{ entry_logs : generates
  cameras ||--o{ entry_logs : records
  cameras ||--o{ anpr_plate_captures : produces
  anpr_plate_captures ||--o{ anpr_anomaly_events : may_raise
  entry_logs ||--o| anpr_plate_captures : links
  vehicles ||--o{ blacklist_records : may_have
  users ||--o{ ocr_scans : submits
  gates ||--o{ cameras : has
  visitors ||--o{ visitor_vehicles : temporary
  users ||--o{ notifications : receives
  entry_logs ||--o{ violations : may_trigger
```

---

## Figure 8 — System architecture (layers)

```mermaid
flowchart TB
  subgraph client["Client layer"]
    R[React security dashboard]
  end

  subgraph api["API layer"]
    F[FastAPI :8000]
  end

  subgraph db["Database layer"]
    PG[(PostgreSQL 14\ncampus_anpr)]
  end

  subgraph ocr["OCR services"]
    P[PaddleOCR\nPOST /api/detect]
    T[TesseractOCR\nPOST /api/register/ocr-scan]
  end

  subgraph hw["Hardware"]
    CAM[Webcam / IP cameras\nRTSP → camera nodes]
  end

  R <--> F
  F <--> PG
  F --> P
  F --> T
  CAM --> F
```

---

*These diagrams match the entity relationships described in `backend/schema_all.sql` and the API surface under `backend/app/api/`.*
