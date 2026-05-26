# 🚗 Campus ANPR System - Practical User Guide

Welcome to the **Campus Automatic Number Plate Recognition (ANPR) System**. This guide provides a practical overview of setting up, running, and using the various modules within the system. It is designed to match the actual setup scripts, backend/frontend architecture, and user roles present in the repository.

---

## 📋 Table of Contents

1. [Setup & Installation](#1-setup--installation)
2. [Running the System](#2-running-the-system)
3. [Login Roles & Portals](#3-login-roles--portals)
4. [Main Functions by Module](#4-main-functions-by-module)
5. [Troubleshooting](#5-troubleshooting)

---

## 🛠️ 1. Setup & Installation

The project uses automated batch scripts located in the root directory to make installation simple and portable. 

**Prerequisites:** Ensure you have **Python 3.10+**, **Node.js 18+**, and **PostgreSQL 14+** installed and added to your system PATH.

### Step 1: Install Dependencies
1. Double-click **`1_Install_Dependencies.bat`** in the main folder.
2. This script detects your Python/Node.js installations and automatically installs all required backend (pip) and frontend (npm) packages.
3. Wait until the terminal says "INSTALLATION COMPLETE!".

### Step 2: Setup Database
1. Double-click **`2_Setup_Database.bat`**.
2. When prompted, enter your local PostgreSQL username and password.
3. The script automatically creates the `campus_anpr` database, applies the schema, seeds test data, and configures the backend `.env` file with your credentials.

---

## ▶️ 2. Running the System

The application is split into three main pieces that must run concurrently:

1. **Campus Backend (`:8000`)**: The core FastAPI server handling database operations, business logic, and user authentication.
2. **SMART-PLATE Engine (`:8003`)**: A separate standalone OCR engine using FastAPI dedicated purely to analyzing images and returning plate numbers.
3. **Frontend Application (`:5173`)**: The React/Vite user interface (which can be run as an Electron Desktop App).

### Automated Start (Recommended)
1. Double-click **`3_Run_System.bat`**.
2. This will sequentially launch the Campus Backend, the ANPR Engine, and the Frontend Desktop App in separate windows.

### Manual Controls (Inside `scripts/` folder)
If you only need to run or test a specific piece, use the individual scripts provided in the `scripts/` directory:
- `run_main_backend.bat` — Starts ONLY the Campus API.
- `run_anpr_engine.bat` — Starts ONLY the SMART-PLATE Engine.
- `run_frontend_desktop.bat` — Starts ONLY the UI.
- `stop_all.bat` — Use this to forcefully kill ports 8000, 8003, and 5173 if they get stuck in the background.

---

## 🔐 3. Login Roles & Portals

Because the system serves different types of users, it uses distinct login portals to route them to the correct interfaces. After running the database seeder (via Step 2), use the following test credentials:

| Role | Login Portal | Test Email | Test Password |
|------|--------------|------------|---------------|
| **Administrator** | `/admin-login` | admin@example.com | AdminPassword123 |
| **Security Staff** | `/security-login` | security@example.com | SecurityPassword123 |
| **Student** | `/login` | student@example.com | StudentPassword123 |
| **Faculty** | `/login` | faculty@example.com | FacultyPassword123 |
| **Staff** | `/login` | staff@example.com | StaffPassword123 |
| **Visitor** | `/login` | visitor@example.com | VisitorPassword123 |

> **Tip:** Students can also log into the main portal using their Student ID (e.g., `2024-0001`).

---

## 🧩 4. Main Functions by Module

The application provides dedicated dashboards and features based on the logged-in user's role.

### 👑 System Administrator Module
Accessed via the Admin Portal, this is the command center for the entire system.
- **Analytics & Dashboard:** View overarching metrics, total vehicles, and entry/exit frequencies.
- **User Management:** Create, edit, and deactivate accounts for Students, Faculty, Staff, Visitors, and Security personnel.
- **Vehicle & Registration Management:** Review, approve, or reject vehicle registration requests submitted by standard users.
- **Camera / IoT Integration:** Manage the configuration of ANPR cameras, simulated video feeds, and hardware endpoints.
- **Entry Logs Directory:** Search and filter historical logs of every vehicle that has entered or exited the campus.

### 🛡️ Security Personnel Module
Accessed via the Security Portal, this module is optimized for active monitoring at the campus gates.
- **Live Feed Dashboard:** A specialized interface displaying real-time camera streams (or simulated active feeds).
- **Instant Alerts & Toasts:** The interface flashes visual and audible alerts when an unregistered vehicle, blacklisted plate, or expired registration is detected by the SMART-PLATE engine.
- **Manual Overrides:** Allows the guard to manually log an entry, open a barrier, or input a plate number if the OCR engine is hindered by mud or bad weather.
- **Shift Statistics:** Displays real-time metrics for the guard's current shift (e.g., vehicles processed today).

### 🎓 Standard Users (Student, Faculty, Staff, Visitor)
Accessed via the Main Portal, providing self-service functionality.
- **Personal Dashboard:** View current active vehicles and a history of their own recent campus entries/exits.
- **Vehicle Registration Requests:** Users can submit new vehicles (plate number, make, model, color) for the administration to approve.
- **Profile Management:** Update contact information and view current standing (e.g., if their access is active or expired).

---

## ⚠️ 5. Troubleshooting

* **"Port is busy" or "Address already in use":** 
  If you closed a terminal window but the server didn't stop, go to the `scripts/` folder and run `stop_all.bat`. This will clear the ports.
* **Database Connection Errors:** 
  If the backend fails to connect to the DB, run `2_Setup_Database.bat` again and double-check that you typed your local PostgreSQL password correctly. Ensure the PostgreSQL service is running in Windows Services (`services.msc`).
* **Powershell Script Errors (`npm.ps1 cannot be loaded`):** 
  If you get execution policy errors, run the `.bat` files rather than running npm commands directly in powershell, as the batch files use standard command prompt syntax.
