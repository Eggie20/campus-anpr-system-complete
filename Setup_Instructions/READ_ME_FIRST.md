# Campus ANPR System - Setup & Execution Guide

This project is fully portable and can be placed anywhere on your computer (e.g., Desktop, Documents, D: Drive). The `.bat` scripts use relative paths (`%~dp0`), meaning they automatically detect where the project is located and will work flawlessly on any PC or Laptop.

---

## ⚙️ Step 0: Install External Prerequisites (New PC Only)

Before running anything, the target computer **must** have these external tools installed:

| Software | Why It's Needed | Install Method |
|----------|-----------------|----------------|
| **Python 3.11+** | Backend API, OCR processing | [python.org](https://www.python.org/downloads/) |
| **Node.js 20 LTS** | Frontend React/Electron app | [nodejs.org](https://nodejs.org/) |
| **PostgreSQL 15** | Database server | [EDB Downloads](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) |
| **Tesseract OCR** | ID card scanning (pytesseract) | [UB-Mannheim Tesseract](https://github.com/UB-Mannheim/tesseract/wiki) |
| **VC++ Redistributable 2015-2022** | Required by PaddleOCR | [Microsoft Download](https://aka.ms/vs/17/release/vc_redist.x64.exe) |

### Automated Installation (Recommended)
1. Open the `Setup_Instructions` folder.
2. **Right-click** `Install_Prerequisites_Winget.bat` → **Run as Administrator**.
3. It will use Windows Package Manager (`winget`) to install everything automatically.
4. **Restart your computer** after it finishes to refresh PATH variables.

### Manual Installation (If winget is unavailable)
- Open `Setup_Instructions/Prerequisites_Links.md` for direct download links and step-by-step PATH configuration instructions.

### Critical PATH Requirements
After installing, ensure these directories are in your **System Environment Variables PATH**:
- `C:\Program Files\PostgreSQL\15\bin` — for database connections
- `C:\Program Files\Tesseract-OCR` — for OCR ID scanning

---

## 🚀 How to Install on a New PC/Laptop

If you just copied this project folder to a new computer, follow these 3 steps in exact order:

### Step 1: Install Dependencies
1. Double-click the file **`1_Install_Dependencies.bat`** (located in the main folder).
2. It will automatically detect your Python/Node.js installations and install all required libraries for the backend, ANPR engine, and frontend.
3. Wait until it says "INSTALLATION COMPLETE!".

### Step 2: Setup Database
1. Double-click the file **`2_Setup_Database.bat`**.
2. It will ask for your PostgreSQL username and password.
3. It will automatically create the database, import the tables and sample data, and update your backend configuration to match the exact password you just typed.

### Step 3: Run the Application
1. Double-click **`3_Run_System.bat`**.
2. This will launch all three core services automatically:
   - FastAPI Backend (Port 8000)
   - SMART-PLATE Engine (Port 8003)
   - Electron React Frontend (Port 5173 / Desktop Window)

---

## 🛠 Advanced / Manual Controls (Inside `scripts/` folder)

If you only want to start specific parts of the system or need to stop it cleanly, you can use the files inside the `scripts/` folder:

* **`run_main_backend.bat`** — Starts ONLY the main Campus API.
* **`run_anpr_engine.bat`** — Starts ONLY the SMART-PLATE OCR Engine.
* **`run_frontend_desktop.bat`** — Starts ONLY the Electron User Interface.
* **`stop_all.bat`** — The most important tool! If you close your terminal windows by accident and the ports get stuck, run this to forcefully kill Port 8000, 8003, and the Electron app.

## ⚠️ Troubleshooting

1. **"Port 8000 is busy" / "Port 8003 is busy"**
   * Go to the `scripts/` folder and run `stop_all.bat`. This will forcefully terminate the background processes holding the ports hostage.
2. **"Python/Node.js is not recognized"**
   * The new PC does not have Python or Node installed. Use `Setup_Instructions/Install_Prerequisites_Winget.bat` or download manually from the links in `Setup_Instructions/Prerequisites_Links.md`.
3. **Database connection errors**
   * Run `2_Setup_Database.bat` again to ensure you typed the correct PostgreSQL password for that specific PC.
4. **Tesseract not found / OCR errors**
   * Ensure Tesseract is installed at `C:\Program Files\Tesseract-OCR` and that directory is added to your system PATH.
5. **PaddleOCR DLL errors**
   * Install the Microsoft Visual C++ Redistributable 2015-2022 (x64) from `https://aka.ms/vs/17/release/vc_redist.x64.exe`.
