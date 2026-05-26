# CSUCC Campus ANPR System — System Specifications

> **Project:** Automatic Number Plate Recognition (ANPR) System  
> **Institution:** Caraga State University – Cabadbaran City Campus  
> **Last Updated:** April 16, 2026

---

## Table of Contents

- [1. Software Specifications](#1-software-specifications)
  - [1.1 Frontend Technologies](#11-frontend-technologies)
  - [1.2 Backend Technologies](#12-backend-technologies)
  - [1.3 Database](#13-database)
  - [1.4 OCR / ANPR Technologies](#14-ocr--anpr-technologies)
  - [1.5 Development Tools](#15-development-tools)
  - [1.6 Complete Software Stack Summary](#16-complete-software-stack-summary)
- [2. Hardware Specifications](#2-hardware-specifications)
  - [2.1 Minimum Hardware Requirements](#21-minimum-hardware-requirements)
  - [2.2 Recommended Hardware Requirements](#22-recommended-hardware-requirements)
  - [2.3 Hardware Justification](#23-hardware-justification)
- [3. Network Requirements](#3-network-requirements)
- [4. Architecture Overview](#4-architecture-overview)
- [5. System Overview & Objectives](#5-system-overview--objectives)
  - [5.1 Project Background](#51-project-background)
  - [5.2 System Objectives](#52-system-objectives)
  - [5.3 Scope & Limitations](#53-scope--limitations)
- [6. User Roles & Access Control](#6-user-roles--access-control)
  - [6.1 Role Definitions](#61-role-definitions)
  - [6.2 Login Portals](#62-login-portals)
  - [6.3 Dashboard Features per Role](#63-dashboard-features-per-role)
- [7. Core System Modules](#7-core-system-modules)
  - [7.1 Vehicle Registration Module](#71-vehicle-registration-module)
  - [7.2 Live ANPR Detection Module](#72-live-anpr-detection-module)
  - [7.3 Alert Management Module](#73-alert-management-module)
  - [7.4 Entry/Exit Logging & Vehicle Tracking](#74-entryexit-logging--vehicle-tracking)
  - [7.5 Dashboard Analytics & Reporting](#75-dashboard-analytics--reporting)
  - [7.6 Notification System](#76-notification-system)
  - [7.7 Blacklist & Visitor Vehicle Management](#77-blacklist--visitor-vehicle-management)
- [8. Database Schema Overview](#8-database-schema-overview)
  - [8.1 Core Tables](#81-core-tables)
  - [8.2 ANPR Tables](#82-anpr-tables)
  - [8.3 Infrastructure Tables](#83-infrastructure-tables)
  - [8.4 Enumerated Types](#84-enumerated-types)
  - [8.5 Entity Relationships](#85-entity-relationships)
- [9. API Endpoints Reference](#9-api-endpoints-reference)
- [10. Security Features](#10-security-features)
- [11. Deployment & Installation Guide](#11-deployment--installation-guide)
  - [11.1 Prerequisites](#111-prerequisites)
  - [11.2 Automated Setup (Windows)](#112-automated-setup-windows)
  - [11.3 Manual Setup](#113-manual-setup)
  - [11.4 Environment Variables](#114-environment-variables)
  - [11.5 Utility Scripts](#115-utility-scripts)
- [12. System Diagrams Reference](#12-system-diagrams-reference)

---

## 1. Software Specifications

### 1.1 Frontend Technologies

| Items | Specifications |
|-------|---------------|
| UI Library | React.js 18 |
| Markup & Styling | HTML5 (JSX), CSS3, JavaScript (ES Modules) |
| Build Tool | Vite 5 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Data Visualization | Chart.js (via react-chartjs-2) |
| Desktop Wrapper | Electron 28 (with electron-builder for Windows NSIS installer) |

**Key Frontend Details:**

- **React 18** provides the component-based UI architecture using functional components and hooks.
- **Vite 5** serves as the development server and production build tool, offering fast Hot Module Replacement (HMR) during development.
- **Electron 28** wraps the web application into a native desktop application, enabling system-level integration and offline capabilities.
- **Chart.js** renders interactive dashboard analytics including vehicle entry/exit statistics and trends.
- **Custom CSS** is used throughout — no CSS framework (e.g., Bootstrap, Tailwind) is used. All styles are hand-authored for full design control.

---

### 1.2 Backend Technologies

| Items | Specifications |
|-------|---------------|
| Language | Python 3.10+ |
| Web Framework | FastAPI |
| ASGI Server | Uvicorn (with standard extras) |
| ORM | SQLAlchemy |
| Database Migrations | Alembic |
| Data Validation | Pydantic, Pydantic-Settings |
| Authentication | PyJWT (JSON Web Tokens) |
| Password Security | bcrypt, passlib |
| Template Engine | Jinja2 |
| Email | emails, email-validator |
| Environment Config | python-dotenv |
| HTTP Requests | requests |
| File Upload Handling | python-multipart |
| WebSockets | websockets, wsproto |

**Key Backend Details:**

- **FastAPI** is a modern, high-performance Python web framework that supports asynchronous request handling and automatic API documentation (Swagger UI / ReDoc).
- **SQLAlchemy** provides object-relational mapping for database interactions, while **Alembic** handles schema migrations.
- **JWT-based authentication** secures all API endpoints with role-based access control for Admin, Security, Student, Faculty, Staff, and Visitor roles.
- **bcrypt** with **passlib** ensures passwords are securely hashed using industry-standard algorithms.

---

### 1.3 Database

| Items | Specifications |
|-------|---------------|
| Database System | PostgreSQL 14+ |
| Python Driver | psycopg2-binary |
| ORM | SQLAlchemy |
| Migration Tool | Alembic |

**Key Database Details:**

- **PostgreSQL** is used as the relational database management system, providing ACID compliance, advanced indexing, and robust data integrity.
- The database stores user accounts, vehicle registrations, entry/exit logs, OCR scan results, and system configuration data.
- **psycopg2-binary** is the PostgreSQL adapter for Python, enabling efficient communication between FastAPI and the database.

---

### 1.4 OCR / ANPR Technologies

| Items | Specifications |
|-------|---------------|
| Primary OCR Engine | Tesseract (via pytesseract) |
| Secondary OCR Engine | PaddleOCR (with PaddlePaddle deep learning framework) |
| Image Processing | OpenCV (opencv-python-headless) |
| Image Manipulation | Pillow (PIL) |
| Numerical Computing | NumPy |
| QR Code Generation | qrcode (with PIL support) |

**Key OCR/ANPR Details:**

- **Tesseract** provides traditional OCR capabilities for number plate text extraction.
- **PaddleOCR** (powered by **PaddlePaddle**) offers deep learning-based OCR, providing higher accuracy on complex or degraded plate images.
- **OpenCV** handles image preprocessing including grayscale conversion, thresholding, contour detection, and plate region isolation.
- **Pillow** and **NumPy** support image format conversions and pixel-level manipulation.
- The dual-engine approach (Tesseract + PaddleOCR) provides redundancy and improved recognition accuracy.

---

### 1.5 Development Tools

| Items | Specifications |
|-------|---------------|
| IDE / Code Editor | Visual Studio Code |
| Version Control | Git |
| Package Manager (Frontend) | npm |
| Package Manager (Backend) | pip (with virtual environment) |
| API Testing | FastAPI Swagger UI (http://localhost:8000/docs) |

---

### 1.6 Complete Software Stack Summary

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, Vite 5, React Router v6, Axios, Chart.js, Electron 28 |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, SQLAlchemy, Alembic, PyJWT, bcrypt |
| **Database** | PostgreSQL 14+ |
| **OCR / ANPR** | Tesseract, PaddleOCR, PaddlePaddle, OpenCV, Pillow, NumPy |
| **DevOps** | Git, npm, pip, VS Code |

---

## 2. Hardware Specifications

### 2.1 Minimum Hardware Requirements

| Items | Specifications |
|-------|---------------|
| Operating System | Windows 11 |
| Processor | Intel® Core™ i5-12400 (12th Gen) or AMD Ryzen 5 5600 |
| RAM | 16 GB DDR4-3200 |
| Hard Drive | 500 GB SSD (SATA or NVMe) |
| Graphics Card | Integrated Intel UHD 730 or AMD Radeon Vega Graphics |
| Motherboard | Intel B660 chipset (for Intel) / AMD B550 chipset (for AMD) |
| Monitor | 24-inch Full HD (1920 × 1080 pixels) |
| Mouse | A4TECH Mouse |
| Broadband | 50–100 Mbps |

---

### 2.2 Recommended Hardware Requirements

| Items | Specifications |
|-------|---------------|
| Operating System | Windows 11 Pro |
| Processor | Intel® Core™ i7-13700 (13th Gen, 16 cores / 24 threads) |
| RAM | 32 GB DDR4-3200 (dual-channel) |
| Hard Drive | 500 GB NVMe SSD or higher |
| Graphics Card | NVIDIA GeForce GTX 1650 (4 GB VRAM) or higher |
| Motherboard | Intel B760 chipset (LGA 1700 socket) |
| Monitor | 24-inch Full HD (1920 × 1080 pixels) |
| Mouse | A4TECH Mouse |
| Broadband | 50–100 Mbps |

---

### 2.3 Hardware Justification

#### Processor: Intel Core i7-13700

- **PaddleOCR** and **Tesseract** are CPU-intensive during plate recognition and text extraction.
- The i7-13700 features 16 cores (8 Performance + 8 Efficient) with 24 threads, providing substantial multi-threaded processing capability.
- Faster single-core performance accelerates real-time image preprocessing via OpenCV.
- Multi-core performance benefits concurrent OCR tasks when multiple vehicles are scanned simultaneously.

#### RAM: 32 GB DDR4

- **PaddleOCR + PaddlePaddle** deep learning models consume approximately 4–8 GB of RAM when loaded.
- Running the full development stack simultaneously requires significant memory:
  - PostgreSQL database server: ~1–2 GB
  - FastAPI + Uvicorn backend: ~500 MB–1 GB
  - Vite development server: ~500 MB
  - Electron desktop application: ~500 MB–1 GB
  - Web browser (for testing): ~1–2 GB
  - VS Code IDE: ~500 MB–1 GB
- **Total typical usage: 10–16 GB**, leaving 16 GB of headroom with 32 GB installed.
- 16 GB is the minimum viable amount; 32 GB ensures smooth operation without swap file reliance.

#### Storage: NVMe SSD

- PostgreSQL benefits significantly from SSD random read/write performance.
- PaddleOCR model files and Tesseract training data require fast sequential reads for efficient loading.
- NVMe SSDs provide 3–5× faster throughput compared to SATA SSDs, reducing application startup time.

#### Graphics Card: NVIDIA GTX 1650 (Recommended)

- **PaddlePaddle** supports **CUDA GPU acceleration** on NVIDIA graphics cards.
- GPU-accelerated OCR can provide **5–10× faster** plate recognition compared to CPU-only processing.
- The GTX 1650 offers 4 GB VRAM and CUDA cores sufficient for inference workloads.
- This is optional for basic operation but **strongly recommended** for production-level ANPR throughput.
- Integrated graphics (Intel UHD / AMD Radeon Vega) are sufficient for the minimum spec but do not support CUDA acceleration.

#### Motherboard: Intel B760 Chipset

- Compatible with Intel 13th Gen processors (LGA 1700 socket).
- Supports DDR4-3200 memory at dual-channel speeds.
- Provides PCIe 4.0 lanes for NVMe SSD and discrete GPU.

> **Note:** If using an AMD Ryzen processor, use an AMD B550 or B650 chipset motherboard with AM4 or AM5 socket respectively.

---

## 3. Network Requirements

| Items | Specifications |
|-------|---------------|
| **Broadband Speed** | 50–100 Mbps |
| **Connection Type** | Wired Ethernet (recommended) or Wi-Fi 5/6 |
| **Required Ports** | 8000 (Backend API), 5173 (Frontend Dev Server) |
| **Protocols** | HTTP/HTTPS, WebSocket |

**Network Details:**

- Stable internet connectivity is required for initial dependency installation (npm, pip packages).
- Once installed, the system operates on the **local network** — internet is not required for day-to-day ANPR operation.
- WebSocket connections are used for real-time notifications and live vehicle monitoring updates.

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│                                                         │
│  ┌─────────────────────┐   ┌─────────────────────────┐ │
│  │   Web Browser        │   │   Electron Desktop App  │ │
│  │   (React 18 + Vite)  │   │   (React 18 + Electron) │ │
│  └──────────┬──────────┘   └────────────┬────────────┘ │
│             │         Axios / HTTP       │               │
│             └────────────┬───────────────┘               │
└──────────────────────────┼───────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  API Layer  │
                    │  (FastAPI)  │
                    │  Port 8000  │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌─────▼──────┐  ┌──────▼──────┐
   │   Auth       │  │   ANPR     │  │  Database   │
   │  (JWT +      │  │ (Tesseract │  │ (PostgreSQL │
   │   bcrypt)    │  │ + PaddleOCR│  │  + SQLAlchemy│
   │              │  │ + OpenCV)  │  │  + Alembic) │
   └──────────────┘  └────────────┘  └─────────────┘
```

---

## 5. System Overview & Objectives

### 5.1 Project Background

The **CSUCC Campus ANPR System** is a capstone project developed for **Caraga State University — Cabadbaran City Campus (CSUCC)**. It addresses the limitations of the institution's existing manual vehicle gate monitoring process, where security guards manually log vehicle entries and exits using handwritten logbooks.

The system automates campus vehicle access management through **Automatic Number Plate Recognition (ANPR)** technology, replacing the error-prone manual process with real-time, AI-powered license plate detection and recognition.

**Key Problem Statement:**

- Manual logbook-based vehicle monitoring is slow, error-prone, and difficult to audit.
- No automated means to detect unregistered, blacklisted, or expired vehicles entering campus.
- Security personnel lack real-time visibility into campus vehicle traffic and incidents.
- Vehicle registration verification relies entirely on physical document inspection.

### 5.2 System Objectives

| # | Objective |
|---|----------|
| 1 | Automate vehicle identification at campus entry/exit gates using real-time license plate recognition via PaddleOCR. |
| 2 | Provide a role-based web dashboard for administrators, security officers, students, faculty, staff, and visitors. |
| 3 | Enable online vehicle registration with OCR-assisted document scanning (driver's license, OR/CR) using Tesseract. |
| 4 | Detect and flag security anomalies (unregistered vehicles, blacklisted plates, expired registrations) in real-time. |
| 5 | Maintain a comprehensive, searchable digital log of all vehicle entry and exit events. |
| 6 | Deliver real-time alert management (Dismiss, Escalate, Resolve) for security incidents. |
| 7 | Provide dashboard analytics including vehicle counts, traffic trends, and anomaly statistics. |
| 8 | Support both web browser and native Windows desktop deployment via Electron. |

### 5.3 Scope & Limitations

**In Scope:**

- License plate detection and recognition for Philippine plate formats.
- Vehicle registration with OCR document scanning.
- Real-time security monitoring and alert management.
- Role-based dashboards for six user types.
- Entry/exit logging with camera integration.
- Desktop application for security guard workstations.

**Limitations:**

- The system currently supports Philippine license plate formats only.
- Night-time and low-light plate detection accuracy depends on camera hardware quality.
- PaddleOCR inference speed is hardware-dependent; GPU acceleration (NVIDIA CUDA) is recommended but optional.
- The system operates on a local campus network and does not require internet connectivity for daily operations.

---

## 6. User Roles & Access Control

### 6.1 Role Definitions

The system implements **six distinct user roles**, each with specific permissions and dashboard views.

| Role | Description | Key Permissions |
|------|-------------|----------------|
| **Admin** | System administrator with full control | Manage users, approve/reject vehicles, manage cameras & gates, view all reports, configure system settings, view audit logs |
| **Security** | Campus security officer operating the gate | Monitor live camera feeds, manage alerts (Dismiss/Escalate/Resolve), simulate detection, view real-time vehicle info, track vehicles on campus |
| **Student** | Enrolled student with a registered vehicle | Register vehicles, view personal entry/exit logs, manage own profile, receive notifications |
| **Faculty** | Teaching staff member | View personal dashboard, receive notifications |
| **Staff** | Non-teaching campus personnel | Register vehicles, view personal entry/exit logs, manage own profile, receive notifications |
| **Visitor** | Temporary campus guest | Register temporary vehicle permits, view entry/exit logs, manage profile, receive notifications |

### 6.2 Login Portals

The system provides **three separate login portals** to segregate access by role category.

| Portal | URL Path | Authorized Roles | Authentication Method |
|--------|----------|-------------------|-----------------------|
| **Main Portal** | `/login` | Student, Faculty, Staff, Visitor | Email + Password, or Student ID + Password |
| **Admin Portal** | `/admin-login` | Admin | Email + Password |
| **Security Portal** | `/security-login` | Security | Email + Password |

### 6.3 Dashboard Features per Role

| Role | Dashboard URL | Available Modules |
|------|--------------|-------------------|
| **Admin** | `/admin/dashboard` | Dashboard Overview, Analytics, Camera Management, Entry Logs, System Logs, Security Staff Management, System Settings, User Management, Vehicle Management |
| **Security** | `/security/dashboard` | Live Camera Feeds (4 CCTV + Webcam), Real-Time Alerts Panel, Captured Vehicle Info, Vehicle Count Statistics, Simulate Detection |
| **Student** | `/dashboard` | Dashboard Overview, Entry Logs, My Vehicles, Notifications, Profile |
| **Faculty** | `/faculty/dashboard` | Dashboard Overview, Notifications |
| **Staff** | `/staff/dashboard` | Dashboard Overview, Entry Logs, My Vehicles, Notifications, Profile |
| **Visitor** | `/visitor/dashboard` | Dashboard Overview, Entry Logs, My Vehicles, Notifications, Profile |

---

## 7. Core System Modules

### 7.1 Vehicle Registration Module

The vehicle registration process is a multi-step workflow that combines manual form entry with OCR-assisted document scanning.

**Registration Flow:**

| Step | Action | Technology Used |
|------|--------|-----------------|
| 1 | **Personal Information** — User submits name, email, phone, and role-specific ID (student_id, faculty_id, etc.) | React form with Pydantic validation |
| 2 | **Document Upload & OCR** — User uploads driver's license (front/back) and OR/CR (vehicle registration proof) | Tesseract OCR via `pytesseract` |
| 3 | **Auto-Fill** — OCR-extracted data (name, license number, address, expiry, plate number) auto-fills the registration form | OpenCV preprocessing + Tesseract |
| 4 | **Vehicle Details** — Plate number, vehicle type, make, model, color, year | Manual entry or OCR-extracted |
| 5 | **Admin Approval** — Vehicle status defaults to `pending`; admin reviews and approves/rejects | Admin dashboard action |

**OCR Scan Storage:**

- All scanned documents are stored in the `ocr_scans` table with extracted data (JSONB), confidence score, and verification status.
- Scan types supported: `drivers_license`, `or_cr`, `plate`.

### 7.2 Live ANPR Detection Module

The real-time plate detection system uses **PaddleOCR** powered by the **PaddlePaddle** deep learning framework.

**Detection Pipeline:**

| Stage | Description |
|-------|-----------|
| 1. **Frame Capture** | Webcam or IP camera captures frames at ~2 fps (every 500ms) via a hidden `<canvas>` element |
| 2. **Frame Transmission** | Frame is encoded as base64 JPEG and sent to `POST /api/v1/anpr/detect` |
| 3. **Image Preprocessing** | OpenCV processes the frame: grayscale conversion, thresholding, contour detection |
| 4. **Plate Detection** | PaddleOCR identifies the plate region and extracts bounding box coordinates |
| 5. **Text Recognition** | PaddleOCR reads the plate text with a confidence score |
| 6. **Dwell Detection** | Server-side buffer tracks frame-to-frame stability; triggers only after 10+ consecutive matching frames (~5–10 seconds) |
| 7. **Database Lookup** | Detected plate is matched against the `vehicles` table |
| 8. **Event Classification** | Result classified as: `access` (registered), `anomaly_unregistered` (not found), `breach_blacklisted` (banned), etc. |
| 9. **Record Creation** | Writes to `anpr_plate_captures`, `entry_logs`, and optionally `anpr_anomaly_events` |
| 10. **WebSocket Broadcast** | Alert pushed to all connected security dashboards in real-time |

**SMART-PLATE Engine (Standalone API):**

The system includes a dedicated ANPR engine (`api/smart_anpr/`) with multiple detection and recognition models:

| Component | Models | Purpose |
|-----------|--------|---------|
| **Plate Detection** | Model A, Model B, Model C | Multiple detection algorithms for accuracy |
| **Plate Recognition** | Model A OCR, Model B OCR, Model C OCR | Multiple OCR models with factory pattern selection |
| **Vehicle Type Detection** | `vehicle_type_detector` | Classify: car, motorcycle, van, truck, other |
| **Brand Detection** | `brand_detector` | Identify vehicle manufacturer |
| **Color Detection** | `color_detector` | Identify vehicle color |

### 7.3 Alert Management Module

Security alerts are generated from ANPR detections and managed through the security dashboard.

**Alert Categories:**

| Category | Alert Kind | Description |
|----------|-----------|-------------|
| ✅ Access | `access` | Registered vehicle — authorized entry |
| ⚠️ Anomaly | `anomaly_unregistered` | Unregistered vehicle detected |
| ⚠️ Anomaly | `anomaly_low_confidence` | Low OCR confidence — manual check required |
| 🚨 Breach | `breach_blacklisted` | Blacklisted vehicle — access denied |
| 🚨 Breach | `breach_expired` | Vehicle registration expired |
| 🚨 Breach | `breach_rejected` | Previously rejected vehicle |

**Alert Actions:**

| Action | Database Operations |
|--------|--------------------|
| **Dismiss** | Update `anpr_anomaly_events.status = 'dismissed'` + insert `system_logs` entry |
| **Escalate** | Update `anpr_anomaly_events.status = 'escalated'` + update `violations.status = 'escalated'` + create admin `notification` + insert `system_logs` entry |
| **Resolve** | Update `anpr_anomaly_events.status = 'resolved'` + update `violations` with `resolved_by` and `resolved_at` + insert `system_logs` entry |

**Auto-Dismiss Behavior:** Maximum 5 active anomalies displayed. When a 6th arrives, the oldest is automatically dismissed.

### 7.4 Entry/Exit Logging & Vehicle Tracking

Every plate detection event is logged in the `entry_logs` table, creating a comprehensive digital record of all vehicle movements.

**Tracked Data Points:**

| Field | Description |
|-------|-----------|
| `detected_plate_number` | The plate text read by OCR |
| `vehicle_id` | Matched vehicle record (if registered) |
| `camera_id` | Which camera captured the detection |
| `direction` | `entry` or `exit` |
| `confidence_score` | OCR confidence percentage |
| `snapshot_image_url` | Captured frame image |
| `timestamp` | Detection timestamp |
| `is_violation` | Whether a violation was triggered |

**Vehicle Tracking:**

- The `vehicles.is_on_campus` flag is updated on entry (set `TRUE`) and exit (set `FALSE`).
- Real-time vehicle counts are aggregated by type (car, motorcycle, van, truck) and refreshed every 10 seconds on the security dashboard.

### 7.5 Dashboard Analytics & Reporting

**Security Dashboard Widgets:**

| Widget | Data Source | Refresh Interval |
|--------|------------|-------------------|
| Total Vehicles Today | `entry_logs` (today's entries) | 10 seconds |
| Currently on Campus | `vehicles WHERE is_on_campus = TRUE` | 10 seconds |
| Vehicle Count by Type | `vehicles` grouped by type | 10 seconds |
| Per-Minute Entry Rate | `entry_logs` (last 5 minutes) | 10 seconds |
| Live Alerts Feed | `anpr_anomaly_events` | Real-time (WebSocket) |
| Camera Status Grid | `cameras.is_active` | 30 seconds |

**Admin Dashboard Widgets:**

| Widget | Description |
|--------|-------------|
| User Management | CRUD operations for all user accounts |
| Vehicle Management | Approve, reject, or blacklist registered vehicles |
| Entry Logs Viewer | Paginated, filterable logs by date, gate, and direction |
| System Logs (Audit Trail) | Complete audit trail of all administrative actions |
| Analytics | Charts and statistics via Chart.js (react-chartjs-2) |
| Camera Management | Add, edit, activate/deactivate camera nodes |
| Security Staff Management | Manage security officer accounts and shifts |
| System Settings | Global configuration (OCR threshold, guest entry policy, etc.) |

### 7.6 Notification System

The system provides both persistent notifications (database-stored) and real-time push notifications.

| Mechanism | Technology | Use Case |
|-----------|-----------|----------|
| **Database Notifications** | PostgreSQL `notifications` table | Persistent alerts viewable in user dashboards |
| **Real-Time Push** | FastAPI WebSocket (`/ws/alerts`) | Instant alert delivery to security dashboards |
| **Toast Notifications** | React `GlobalToast` component | In-app popup alerts for user actions |

### 7.7 Blacklist & Visitor Vehicle Management

**Blacklist Management:**

- Administrators can blacklist vehicles with a reason, effective dates, and permanent/temporary duration.
- Blacklisted vehicles trigger `breach_blacklisted` alerts when detected by ANPR cameras.
- Blacklist records are stored in `blacklist_records` with `is_active` flag control.

**Visitor Vehicle Management:**

- Visitors receive temporary plate permits stored in `visitor_vehicles`.
- Permits have defined expiry dates; expired permits trigger `breach_expired` alerts.
- Visitors can register through the main portal with the `visitor` role.

---

## 8. Database Schema Overview

The system uses **PostgreSQL 14+** with UUID primary keys (`uuid-ossp` extension) and timezone-aware timestamps.

### 8.1 Core Tables

| Table | Primary Key | Description | Key Fields |
|-------|-------------|-------------|------------|
| `users` | UUID | Central identity store for all campus members | `email`, `username`, `password_hash`, `full_name`, `role`, `status`, `student_id`, `department`, `phone_number` |
| `vehicles` | UUID | Registered campus vehicles | `plate_number` (unique), `make`, `model`, `color`, `type`, `status`, `user_id` (FK → users) |
| `ocr_scans` | UUID | OCR document scan results | `user_id` (FK → users), `scan_type`, `extracted_data` (JSONB), `confidence_score`, `is_verified` |
| `blacklist_records` | UUID | Vehicle blacklist history | `vehicle_id` (FK → vehicles), `reason`, `start_date`, `end_date`, `is_active` |

### 8.2 ANPR Tables

| Table | Primary Key | Description | Key Fields |
|-------|-------------|-------------|------------|
| `entry_logs` | UUID | High-volume plate detection events | `detected_plate_number`, `vehicle_id` (FK), `camera_id` (FK), `direction`, `confidence_score`, `snapshot_image_url` |
| `anpr_plate_captures` | UUID | Processed ANPR reads with full details | `plate_number`, `confidence_score`, `vehicle_type`, `camera_id` (FK), `payload` (JSONB) |
| `anpr_anomaly_events` | UUID | Flagged security events | `plate_capture_id` (FK), `kind`, `status`, `resolved_by`, `resolved_at` |
| `violations` | UUID | Security incidents | `entry_log_id` (FK), `vehicle_id` (FK), `type`, `description`, `fine_amount`, `status` |

### 8.3 Infrastructure Tables

| Table | Primary Key | Description | Key Fields |
|-------|-------------|-------------|------------|
| `gates` | UUID | Physical entry/exit points | `name`, `location_description`, `status` |
| `cameras` | UUID | ANPR camera nodes | `gate_id` (FK → gates), `name`, `ip_address`, `stream_url`, `direction`, `is_active` |
| `notifications` | UUID | User-facing alerts | `user_id` (FK → users), `title`, `message`, `type`, `is_read` |
| `system_logs` | UUID | Admin audit trail | `actor_id` (FK → users), `action`, `details` (JSONB), `ip_address` |
| `settings` | VARCHAR(50) | Global key-value configuration | `key`, `value` (JSONB), `description` |

### 8.4 Enumerated Types

| Enum Type | Values |
|-----------|--------|
| `user_role` | `admin`, `student`, `faculty`, `security`, `staff`, `visitor` |
| `account_status` | `pending`, `active`, `suspended`, `rejected` |
| `vehicle_status` | `pending`, `approved`, `rejected`, `blacklisted`, `expired` |
| `vehicle_type` | `car`, `motorcycle`, `van`, `truck`, `other` |
| `entry_direction` | `entry`, `exit` |
| `violation_type` | `unregistered`, `blacklisted`, `speeding`, `wrong_way`, `unauthorized_access`, `expired_registration` |
| `gate_status` | `open`, `closed`, `maintenance` |
| `anpr_alert_kind` | `access`, `anomaly_unregistered`, `anomaly_low_confidence`, `breach_blacklisted`, `breach_expired`, `breach_rejected` |

### 8.5 Entity Relationships

```
users (1) ──< (many) vehicles
users (1) ──< (many) ocr_scans
users (1) ──< (many) notifications
vehicles (1) ──< (many) entry_logs
vehicles (1) ──< (many) blacklist_records
cameras (1) ──< (many) entry_logs
cameras (1) ──< (many) anpr_plate_captures
gates (1) ──< (many) cameras
entry_logs (1) ──1 anpr_plate_captures
anpr_plate_captures (1) ──< (many) anpr_anomaly_events
entry_logs (1) ──< (many) violations
visitors (1) ──< (many) visitor_vehicles
```

---

## 9. API Endpoints Reference

All API endpoints are served by **FastAPI** on port `8000` with the base path `/api/v1`.

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/login` | Authenticate user, return JWT access token |
| `POST` | `/register` | Register a new user account |
| `GET` | `/me` | Get current authenticated user profile |
| `POST` | `/forgot-password` | Initiate password reset flow |

### OCR (`/api/v1/ocr`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/scan` | Upload an image for Tesseract OCR text extraction |
| `POST` | `/scan-id` | Scan a driver's license and extract structured data |
| `GET` | `/scans` | List OCR scan history for current user |

### ANPR (`/api/v1/anpr`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/detect` | Receive base64 frame, run PaddleOCR, return plate + bounding box |
| `GET` | `/alerts` | List anomaly events with filters (status, kind, pagination) |
| `PATCH` | `/alerts/{id}/dismiss` | Dismiss an alert |
| `PATCH` | `/alerts/{id}/escalate` | Escalate an alert to admin |
| `PATCH` | `/alerts/{id}/resolve` | Resolve an alert |
| `POST` | `/simulate` | Inject a simulated detection event |
| `GET` | `/stats/vehicle-counts` | Aggregated vehicle counts by type, on-campus totals |
| `GET` | `/cameras` | List camera nodes with status |

### Vehicles (`/api/v1/vehicles`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List vehicles (filtered by current user or all for admin) |
| `POST` | `/` | Register a new vehicle |
| `GET` | `/{plate}` | Look up vehicle by plate number |
| `PUT` | `/{id}` | Update vehicle details |

### Entry Logs (`/api/v1/entry-logs`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Paginated entry logs with filters (date, gate, direction) |

### Admin (`/api/v1/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | List all users |
| `PUT` | `/users/{id}` | Update user account |
| `DELETE` | `/users/{id}` | Deactivate user account |
| `GET` | `/vehicles` | List all vehicles (pending, approved, rejected) |
| `PATCH` | `/vehicles/{id}/approve` | Approve a pending vehicle |
| `PATCH` | `/vehicles/{id}/reject` | Reject a pending vehicle |
| `GET` | `/system-logs` | View system audit trail |
| `GET` | `/analytics` | Dashboard analytics data |

### Notifications (`/api/v1/notifications`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List notifications for current user |
| `PATCH` | `/{id}/read` | Mark notification as read |

### Registration (`/api/v1/registration`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/user` | Register a new user account |
| `POST` | `/vehicle` | Register a vehicle with OCR-scanned documents |

### Security Staff (`/api/v1/security-staff`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List security staff members |
| `GET` | `/shifts` | View security shift schedules |

### Settings (`/api/v1/settings`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all system settings |
| `PUT` | `/{key}` | Update a system setting value |

### WebSocket

| Protocol | Endpoint | Description |
|----------|----------|-------------|
| `WS` | `/ws/alerts` | Real-time alert broadcasting to connected security dashboards |

---

## 10. Security Features

The system implements multiple layers of security to protect user data and system integrity.

| Feature | Implementation | Details |
|---------|---------------|---------|
| **Authentication** | JWT (JSON Web Tokens) via `PyJWT` | Access tokens with configurable expiration (default: 1440 minutes / 24 hours) |
| **Password Hashing** | `bcrypt` via `passlib` | Industry-standard one-way hashing with automatic salt generation |
| **Password Policy** | Minimum 8 characters | Enforced on all login portals (Admin, Security, Student/Staff) |
| **Role-Based Access Control** | Middleware + route-level guards | Each API endpoint validates the user's role before granting access |
| **CORS Protection** | FastAPI `CORSMiddleware` | Restricts API access to authorized frontend origins only |
| **Input Validation** | `Pydantic` models | All request data is validated against strict schemas before processing |
| **Standardized Error Messages** | Unified auth responses | Login failures return generic "Invalid ID or Email" to prevent user enumeration |
| **Secure File Uploads** | `python-multipart` | Uploaded documents (ID scans, snapshots) are validated and stored securely in `backend/secure_uploads/` |
| **Audit Logging** | `system_logs` table | All administrative actions are logged with actor ID, action type, details (JSONB), and IP address |
| **Data Encryption** | HTTPS-ready | Application supports HTTPS deployment; JWT tokens are signed with HS256 algorithm |
| **Session Management** | Token-based (stateless) | No server-side sessions; authentication state managed via JWT tokens |

---

## 11. Deployment & Installation Guide

### 11.1 Prerequisites

| Requirement | Minimum Version | Download Link |
|-------------|----------------|---------------|
| Python | 3.10+ | https://www.python.org/downloads/ |
| Node.js | 18+ | https://nodejs.org/ |
| PostgreSQL | 14+ | https://www.postgresql.org/download/ |
| Git | Latest | https://git-scm.com/downloads |
| Tesseract OCR | 5.0+ | https://github.com/tesseract-ocr/tesseract |

### 11.2 Automated Setup (Windows)

The project includes batch scripts for one-click setup:

1. Run `scripts/install_dependencies.bat` — Installs Python virtual environment, pip packages, and npm packages.
2. Run `scripts/run_app.bat` — Starts both backend (FastAPI) and frontend (Vite) servers.

### 11.3 Manual Setup

**Step 1 — Database:**

```sql
CREATE DATABASE campus_anpr;
```

**Step 2 — Backend:**

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python seed_db.py
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Step 3 — Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**Step 4 — Access:**

| Service | URL |
|---------|-----|
| Frontend | http://127.0.0.1:5173 |
| Backend API | http://127.0.0.1:8000 |
| API Documentation (Swagger) | http://127.0.0.1:8000/docs |
| API Documentation (ReDoc) | http://127.0.0.1:8000/redoc |

### 11.4 Environment Variables

**Backend (`backend/.env`):**

| Variable | Description | Example |
|----------|-------------|--------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/campus_anpr` |
| `SECRET_KEY` | JWT signing secret key | `your-super-secret-key-change-in-production` |
| `ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | `1440` |

**SMART-PLATE Engine (`api/smart_anpr/.env`):**

| Variable | Description | Example |
|----------|-------------|--------|
| `PADDLEOCR_LANG` | PaddleOCR language model | `en` |
| `TESSERACT_CMD` | Path to Tesseract binary | `C:\Program Files\Tesseract-OCR\tesseract.exe` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173` |

### 11.5 Utility Scripts

The `scripts/` directory contains the following operational scripts:

| Script | Description |
|--------|-------------|
| `install_dependencies.bat` | One-click dependency installation (Python + Node.js) |
| `run_app.bat` | Start backend + frontend together |
| `run_anpr_engine.bat` | Start the SMART-PLATE ANPR detection engine |
| `run_frontend_desktop.bat` | Launch Electron desktop application |
| `run_main_backend.bat` | Start FastAPI backend server only |
| `run_migration.bat` | Execute database migration scripts |
| `run_monitor.bat` | Start the CLI plate capture monitoring tool |
| `stop_all.bat` | Stop all running services |
| `stop_anpr_engine.bat` | Stop the ANPR engine specifically |
| `verify_system.ps1` | Verify system health and configuration |

---

## 12. System Diagrams Reference

Detailed system diagrams are maintained in a separate document for clarity. All diagrams use [Mermaid](https://mermaid.js.org/) notation and can be rendered in GitHub, VS Code, or exported to PNG/SVG.

**Reference Document:** `docs/CSUCC_System_Diagrams.md`

| Figure | Title | Description |
|--------|-------|-------------|
| Figure 3 | Current DFD (Diagram 0) | Manual gate process before ANPR automation — security guard → manual logbook → paper records |
| Figure 4 | Proposed Context DFD | External entities (Driver, Security, Admin, Camera, SMART-PLATE API) and the CSUCC ANPR system boundary |
| Figure 5 | Proposed Diagram 0 DFD | Five main processes: Vehicle Registration, Live Detection, Alert Management, Vehicle Tracking, Reporting |
| Figure 6 | Use Case Diagram | Three actors (Driver, Security Officer, System Admin) with all use cases mapped |
| Figure 7 | ERD (Entity-Relationship Diagram) | All 14 database entities with relationships aligned to `schema_all.sql` v2.0 |
| Figure 8 | System Architecture (Layers) | Client → API → Database → OCR Services → Hardware layers |

---

> **Document prepared for:** Capstone Research Paper — CSUCC Campus ANPR System  
> **Authors:** CSUCC ANPR Development Team  
> **Last Updated:** April 16, 2026
