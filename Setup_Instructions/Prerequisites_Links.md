# External Prerequisites - Manual Download Links

If you cannot use the automated `Install_Prerequisites_Winget.bat` script, download and install each of the following manually **before** running `1_Install_Dependencies.bat`.

---

## 1. Python 3.11+

| Item | Details |
|------|---------|
| **Download** | https://www.python.org/downloads/ |
| **Version** | 3.11 or higher |
| **Install Note** | ✅ Check **"Add Python to PATH"** during installation |

---

## 2. Node.js 20 LTS

| Item | Details |
|------|---------|
| **Download** | https://nodejs.org/en/download |
| **Version** | 20.x LTS (recommended) |
| **Install Note** | ✅ Check **"Add to PATH"** during installation |

---

## 3. PostgreSQL 15

| Item | Details |
|------|---------|
| **Download** | https://www.enterprisedb.com/downloads/postgres-postgresql-downloads |
| **Version** | 15.x (14+ is compatible) |
| **Install Notes** | See below |

**During installation:**
1. Set a **master password** for the `postgres` superuser — you will need this when running `2_Setup_Database.bat`.
2. Leave the default port as **5432**.
3. After installation, **add the PostgreSQL `bin` directory to your System PATH**:
   - Default: `C:\Program Files\PostgreSQL\15\bin`
   - This allows the backend to establish TCP/IP connections via SQLAlchemy.

**How to add to PATH:**
1. Press `Win + R`, type `sysdm.cpl`, press Enter.
2. Go to **Advanced** → **Environment Variables**.
3. Under **System variables**, find `Path`, click **Edit**.
4. Click **New** and paste: `C:\Program Files\PostgreSQL\15\bin`
5. Click **OK** on all dialogs and **restart your terminal**.

---

## 4. Tesseract OCR

| Item | Details |
|------|---------|
| **Download** | https://github.com/UB-Mannheim/tesseract/wiki |
| **Version** | Latest (5.x recommended) |
| **Install Path** | `C:\Program Files\Tesseract-OCR` (default) |
| **Install Notes** | See below |

**After installation:**
1. **Add `C:\Program Files\Tesseract-OCR` to your System PATH** (same method as PostgreSQL above).
2. The backend's `pytesseract` library looks for the `tesseract.exe` binary in PATH or at the default install location. Without this, you will get `FileNotFoundError` exceptions during OCR ID scanning.

---

## 5. Microsoft Visual C++ Redistributable 2015-2022 (x64)

| Item | Details |
|------|---------|
| **Download** | https://aka.ms/vs/17/release/vc_redist.x64.exe |
| **Why** | Required by PaddleOCR's C-based tensor operations |
| **Install Note** | Just run the `.exe` and follow the prompts |

> **Note:** Most modern Windows 10/11 PCs already have this installed. If PaddleOCR fails with DLL errors, install this redistributable.

---

## Verification

After installing all prerequisites and **restarting your computer**, open a new Command Prompt and run:

```
python --version
node --version
npm --version
psql --version
tesseract --version
```

All five commands should return version numbers. If any fails, the corresponding tool is not in your PATH.
