# 🚗 CSUCC Campus ANPR System

A secure **Automatic Number Plate Recognition (ANPR)** portal for vehicle identification and campus access management at Caraga State University - Cabadbaran City Campus.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Test Credentials](#-test-credentials)
- [Login Portals](#-login-portals)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

- **User Authentication** - Role-based login for Students, Faculty, Staff, Visitors, Security, and Admins
- **Vehicle Registration** - Register and manage vehicle information
- **Entry/Exit Logging** - Real-time tracking of vehicle movements
- **Dashboard Analytics** - Visual insights for different user roles
- **Dark/Light Theme** - User-customizable interface theme
- **Responsive Design** - Works on desktop and mobile devices

---

## 🛠 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM
- **bcrypt** - Password hashing
- **PyJWT** - Token authentication

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **CSS3** - Styling (no CSS frameworks)

---

## 📦 Prerequisites

Before running this application, ensure you have:

1. **Python 3.10+** - [Download Python](https://www.python.org/downloads/)
2. **Node.js 18+** - [Download Node.js](https://nodejs.org/)
3. **PostgreSQL 14+** - [Download PostgreSQL](https://www.postgresql.org/download/)
4. **Git** - [Download Git](https://git-scm.com/downloads)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd campus-anpr-system
```

### 2. Database Setup

1. Open **pgAdmin** or PostgreSQL command line
2. Create a new database:

```sql
CREATE DATABASE campus_anpr;
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (Command Prompt):
venv\Scripts\activate
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/campus_anpr
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

> ⚠️ Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

### 5. Seed the Database

```bash
# Make sure you're in the backend directory with venv activated
python seed_db.py
```

This will create test users and sample data.

### 6. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

---

## ▶️ Running the Application

### Option A: Simplified Setup (Windows)

The easiest way to get started is to use the provided batch scripts:

1. **Install Dependencies**: Run `install_dependencies.bat`. This will set up your Python virtual environment and install all backend and frontend packages.
2. **Run Application**: Run `run_app.bat`. This will:
   - Check if the required ports (8000) are available.
   - Verify Tesseract OCR installation.
   - Start the Backend and Frontend in separate windows.

### Option B: Manual Commands

---

### Option B: If npm/npx Commands Fail (PowerShell Execution Policy)

If you see an error like:
> `npm.ps1 cannot be loaded because running scripts is disabled on this system`

Use these alternative commands:

**Backend:**
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Frontend:**
```bash
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173
```

---

### 🌐 Access the Application

Once both servers are running:

| Service | URL |
|---------|-----|
| **Frontend** | http://127.0.0.1:5173 |
| **Backend API** | http://127.0.0.1:8000 |
| **API Docs** | http://127.0.0.1:8000/docs |

---

## 🔐 Test Credentials

After running `seed_db.py`, use these credentials to test the system:

| Role | Email | Password | Login Portal |
|------|-------|----------|--------------|
| **Admin** | admin@example.com | AdminPassword123 | /admin-login |
| **Security** | security@example.com | SecurityPassword123 | /security-login |
| **Student** | student@example.com | StudentPassword123 | /login |
| **Faculty** | faculty@example.com | FacultyPassword123 | /login |
| **Staff** | staff@example.com | StaffPassword123 | /login |
| **Visitor** | visitor@example.com | VisitorPassword123 | /login |

> 💡 **Student ID Login:** You can also login as a student using ID: `2024-0001`

---

## 🚪 Login Portals

The system has three separate login portals:

| Portal | URL | User Types |
|--------|-----|------------|
| **Main Portal** | `/login` | Student, Faculty, Staff, Visitor |
| **Admin Portal** | `/admin-login` | System Administrators |
| **Security Portal** | `/security-login` | Security Personnel |

### Post-Login Redirects

| User Role | Dashboard URL |
|-----------|---------------|
| Admin | `/admin/dashboard` |
| Security | `/security/dashboard` |
| Student/Faculty | `/dashboard` |
| Staff | `/staff/dashboard` |
| Visitor | `/visitor/dashboard` |

---

## 📁 Project Structure

```
campus-anpr-system/
├── backend/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utilities (auth, db)
│   │   └── main.py        # FastAPI app entry
│   ├── requirements.txt   # Python dependencies
│   ├── seed_db.py         # Database seeder
│   └── .env               # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── pages/     # Page components
│   │   │   ├── layouts/   # Layout components
│   │   │   └── common/    # Shared components
│   │   ├── contexts/      # React contexts
│   │   ├── routes/        # Routing config
│   │   └── App.jsx        # Root component
│   ├── public/            # Static assets
│   └── package.json       # Node dependencies
│
└── README.md              # This file
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. PowerShell Execution Policy Error
**Error:** `npm.ps1 cannot be loaded because running scripts is disabled`

**Solution:** Use Command Prompt instead of PowerShell, or run:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

#### 2. Database Connection Error
**Error:** `Could not connect to PostgreSQL`

**Solution:**
- Verify PostgreSQL is running (check Services.msc)
- Confirm database `campus_anpr` exists
- Check your `.env` file has correct password

#### 3. Port Already in Use
**Error:** `Address already in use`

**Solution:** Kill the process using the port:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

#### 4. Module Not Found Errors
**Backend:**
```bash
pip install -r requirements.txt
```

**Frontend:**
```bash
npm install
```

---

## 🧪 Running Tests

### Backend Login Test
```bash
cd backend
python test_login.py
```

This verifies all seeded users can authenticate successfully.

---

## 📄 API Documentation

Once the backend is running, access the interactive API docs:

- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## 📜 License

This project is developed for **Caraga State University - Cabadbaran City Campus**.

---

## 👥 Support

For issues or questions, please contact the IT department or create an issue in the repository.

---
 
 ## 👥 Support
 
 For issues or questions, please contact the IT department or create an issue in the repository.
