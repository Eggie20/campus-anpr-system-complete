# Complete Setup Guide - Campus ANPR System
## Step-by-Step Installation & Configuration

---

## 🗄️ Database Recommendation

### **PostgreSQL (Recommended ⭐)**

**Why PostgreSQL?**
- ✅ **JSONB support** - Store camera metadata, ANPR results flexibly
- ✅ **Full-text search** - Search plate numbers efficiently
- ✅ **PostGIS extension** - If you need location tracking (gates/parking)
- ✅ **Robust & reliable** - Battle-tested for production
- ✅ **Great Python support** - Works perfectly with SQLAlchemy
- ✅ **Free & open-source**

**Comparison:**

| Database | Best For | Pros | Cons |
|----------|----------|------|------|
| **PostgreSQL** ⭐ | Production, Complex queries | Advanced features, Reliable, JSONB | Slightly more complex |
| **MySQL** | Simple apps, Shared hosting | Popular, Easy to find tutorials | Limited JSON support |
| **SQLite** | Development, Small projects | No setup, File-based | Not for production, No concurrent writes |

### **Recommendation: Use PostgreSQL for production, SQLite for quick development**

---

## 🚀 Complete Setup Process

### Step 1: System Requirements

**What you need installed:**
- Python 3.10+ 
- Node.js 18+
- PostgreSQL 14+
- Git

**Check if installed:**
```bash
python --version
node --version
psql --version
git --version
```

---

## 📥 Step 2: Install Required Software

### **Windows Installation**

#### 2.1 Install Python
```powershell
# Download from python.org or use Chocolatey
choco install python --version=3.11

# Verify
python --version
```

#### 2.2 Install Node.js
```powershell
# Download from nodejs.org or use Chocolatey
choco install nodejs-lts

# Verify
node --version
npm --version
```

#### 2.3 Install PostgreSQL
```powershell
# Download installer from postgresql.org
# Or use Chocolatey
choco install postgresql14

# During installation:
# - Set password (remember this!)
# - Port: 5432 (default)
# - Locale: Default
```

#### 2.4 Install MQTT Broker (Mosquitto)
```powershell
# Download from mosquitto.org
# Or use Chocolatey
choco install mosquitto

# Start service
net start mosquitto
```

---

### **Linux (Ubuntu/Debian) Installation**

#### 2.1 Install Python
```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip
```

#### 2.2 Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### 2.3 Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create password for postgres user
sudo -u postgres psql
ALTER USER postgres PASSWORD 'your_password';
\q
```

#### 2.4 Install MQTT Broker
```bash
sudo apt install mosquitto mosquitto-clients

# Start Mosquitto
sudo systemctl start mosquitto
sudo systemctl enable mosquitto
```

---

### **macOS Installation**

#### 2.1 Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2.2 Install All Dependencies
```bash
# Python
brew install python@3.11

# Node.js
brew install node

# PostgreSQL
brew install postgresql@14
brew services start postgresql@14

# Mosquitto
brew install mosquitto
brew services start mosquitto
```

---

## 📂 Step 3: Create Project Structure

```bash
# Create main project folder
mkdir campus-anpr-system
cd campus-anpr-system

# Create backend and frontend folders
mkdir backend frontend iot-devices
```

---

## 🔧 Step 4: Setup Backend (FastAPI)

### 4.1 Create Backend Structure
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Create folder structure
mkdir -p app/{api,models,schemas,services,iot,websocket,utils}
touch app/__init__.py
touch app/main.py
touch app/config.py
```

### 4.2 Install Python Dependencies
```bash
# Create requirements.txt
cat > requirements.txt << EOF
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
alembic==1.13.1
pydantic==2.5.3
pydantic-settings==2.1.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
paho-mqtt==1.6.1
redis==5.0.1
websockets==12.0
python-dotenv==1.0.0
psycopg2-binary==2.9.9
aiosqlite==0.19.0
EOF

# Install all dependencies
pip install -r requirements.txt
```

### 4.3 Create Database Configuration

**backend/.env**
```bash
# Create .env file
cat > .env << EOF
# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/campus_anpr
# For development, you can use SQLite:
# DATABASE_URL=sqlite:///./campus_anpr.db

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# MQTT
MQTT_BROKER=localhost
MQTT_PORT=1883

# Redis (optional)
REDIS_URL=redis://localhost:6379

# CORS
FRONTEND_URL=http://localhost:5173
EOF
```

### 4.4 Setup PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE campus_anpr;

# Verify
\l

# Exit
\q
```

### 4.5 Create Database Models

**backend/app/models/base.py**
```python
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, DateTime
from datetime import datetime

Base = declarative_base()

class TimestampMixin:
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

**backend/app/models/user.py**
```python
from sqlalchemy import Column, Integer, String, Boolean, Enum
from .base import Base, TimestampMixin
import enum

class UserRole(enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"
    SECURITY = "security"

class User(Base, TimestampMixin):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    student_id = Column(String, unique=True, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
```

**backend/app/models/vehicle.py**
```python
from sqlalchemy import Column, Integer, String, ForeignKey, Date, Boolean
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Vehicle(Base, TimestampMixin):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plate_number = Column(String, unique=True, index=True, nullable=False)
    vehicle_type = Column(String)  # motorcycle, car
    brand = Column(String)
    model = Column(String)
    color = Column(String)
    registration_date = Column(Date)
    expiry_date = Column(Date)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    owner = relationship("User", back_populates="vehicles")
    entry_logs = relationship("EntryLog", back_populates="vehicle")
```

**backend/app/models/entry_log.py**
```python
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from .base import Base
from datetime import datetime
import enum

class EntryType(enum.Enum):
    ENTRY = "entry"
    EXIT = "exit"

class EntryLog(Base):
    __tablename__ = "entry_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    plate_number = Column(String, index=True)
    gate = Column(String)
    entry_type = Column(Enum(EntryType))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    confidence = Column(String)
    camera_id = Column(String)
    
    # Relationships
    vehicle = relationship("Vehicle", back_populates="entry_logs")
```

**backend/app/models/__init__.py**
```python
from .base import Base
from .user import User, UserRole
from .vehicle import Vehicle
from .entry_log import EntryLog, EntryType
```

### 4.6 Create Database Connection

**backend/app/utils/database.py**
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=True  # Set to False in production
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from app.models import Base
    Base.metadata.create_all(bind=engine)
```

### 4.7 Create Configuration

**backend/app/config.py**
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    MQTT_BROKER: str = "localhost"
    MQTT_PORT: int = 1883
    FRONTEND_URL: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### 4.8 Create Main Application

**backend/app/main.py**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.utils.database import init_db

app = FastAPI(
    title="Campus ANPR API",
    description="Campus Security ANPR System API",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Initialize database
    init_db()
    print("✅ Database initialized")

@app.get("/")
async def root():
    return {
        "message": "Campus ANPR API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### 4.9 Test Backend
```bash
# Make sure you're in backend folder with venv activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Open browser: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## ⚛️ Step 5: Setup Frontend (React)

### 5.1 Create React App
```bash
# Go back to main project folder
cd ../frontend

# Create Vite React app
npm create vite@latest . -- --template react

# Install dependencies
npm install

# Install additional packages
npm install axios react-router-dom @tanstack/react-query socket.io-client
npm install -D tailwindcss postcss autoprefixer
```

### 5.2 Setup Tailwind CSS
```bash
# Initialize Tailwind
npx tailwindcss init -p
```

**frontend/tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**frontend/src/index.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5.3 Create Frontend Structure
```bash
cd src
mkdir -p components/{layout,widgets,common} pages/{student,admin,auth} services hooks context utils

# Create files
touch services/api.js
touch services/authService.js
touch services/vehicleService.js
```

### 5.4 Setup API Service

**frontend/.env**
```bash
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

**frontend/src/services/api.js**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 5.5 Create Simple Test Page

**frontend/src/App.jsx**
```javascript
import { useState, useEffect } from 'react';
import api from './services/api';

function App() {
  const [apiStatus, setApiStatus] = useState('checking...');

  useEffect(() => {
    // Test API connection
    api.get('/health')
      .then(res => setApiStatus('✅ Connected'))
      .catch(err => setApiStatus('❌ Failed to connect'));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Campus ANPR System
        </h1>
        <p className="text-gray-600">
          API Status: {apiStatus}
        </p>
      </div>
    </div>
  );
}

export default App;
```

### 5.6 Test Frontend
```bash
# In frontend folder
npm run dev

# Open browser: http://localhost:5173
```

---

## 🔌 Step 6: Setup MQTT Integration

### 6.1 Test MQTT Broker
```bash
# Terminal 1 - Subscribe
mosquitto_sub -h localhost -t "test/topic"

# Terminal 2 - Publish
mosquitto_pub -h localhost -t "test/topic" -m "Hello MQTT"

# You should see "Hello MQTT" in Terminal 1
```

### 6.2 Create MQTT Client for Backend

**backend/app/iot/mqtt_client.py**
```python
import paho.mqtt.client as mqtt
import json
from app.config import settings

class MQTTClient:
    def __init__(self):
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        
    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("✅ Connected to MQTT Broker!")
            # Subscribe to ANPR topics
            client.subscribe("anpr/+/plate_detected")
        else:
            print(f"❌ Failed to connect, return code {rc}")
        
    def on_message(self, client, userdata, msg):
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            
            print(f"📥 Received: {topic}")
            print(f"   Plate: {payload.get('plate')}")
            print(f"   Gate: {payload.get('gate')}")
            
            # TODO: Process the detection
            # - Check if vehicle is registered
            # - Create entry log
            # - Broadcast to WebSocket clients
            
        except Exception as e:
            print(f"❌ Error processing message: {e}")
    
    def connect(self):
        try:
            self.client.connect(settings.MQTT_BROKER, settings.MQTT_PORT, 60)
            self.client.loop_start()
            print(f"🔌 Connecting to MQTT Broker at {settings.MQTT_BROKER}:{settings.MQTT_PORT}")
        except Exception as e:
            print(f"❌ Could not connect to MQTT: {e}")
    
    def disconnect(self):
        self.client.loop_stop()
        self.client.disconnect()

# Create singleton instance
mqtt_client = MQTTClient()
```

### 6.3 Integrate MQTT with FastAPI

**backend/app/main.py** (updated)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.utils.database import init_db
from app.iot.mqtt_client import mqtt_client

app = FastAPI(
    title="Campus ANPR API",
    description="Campus Security ANPR System API",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Initialize database
    init_db()
    print("✅ Database initialized")
    
    # Connect to MQTT
    mqtt_client.connect()
    print("✅ MQTT client started")

@app.on_event("shutdown")
async def shutdown_event():
    mqtt_client.disconnect()
    print("👋 MQTT client disconnected")

@app.get("/")
async def root():
    return {
        "message": "Campus ANPR API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### 6.4 Create Test IoT Device Simulator

**iot-devices/simulate_camera.py**
```python
import paho.mqtt.client as mqtt
import json
import time
from datetime import datetime
import random

# Sample plate numbers
PLATES = ["ABC 1234", "XYZ 5678", "DEF 9012", "GHI 3456"]
GATES = ["Main Gate", "Back Gate", "Parking Gate A"]

def simulate_detection():
    client = mqtt.Client()
    client.connect("localhost", 1883, 60)
    
    print("🎥 ANPR Camera Simulator Started")
    print("   Publishing to: anpr/gate1/plate_detected")
    print("   Press Ctrl+C to stop\n")
    
    try:
        while True:
            # Simulate plate detection
            plate = random.choice(PLATES)
            gate = random.choice(GATES)
            
            payload = {
                "plate": plate,
                "gate": gate,
                "timestamp": datetime.now().isoformat(),
                "confidence": round(random.uniform(0.85, 0.99), 2),
                "camera_id": "CAM-001"
            }
            
            # Publish to MQTT
            topic = "anpr/gate1/plate_detected"
            client.publish(topic, json.dumps(payload))
            
            print(f"📸 Detected: {plate} at {gate} ({payload['confidence']} confidence)")
            
            # Wait 5-10 seconds before next detection
            time.sleep(random.randint(5, 10))
            
    except KeyboardInterrupt:
        print("\n👋 Simulator stopped")
        client.disconnect()

if __name__ == "__main__":
    simulate_detection()
```

---

## ✅ Step 7: Verify Everything Works

### 7.1 Start All Services

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - MQTT Subscriber (Test):**
```bash
mosquitto_sub -h localhost -t "anpr/#" -v
```

**Terminal 4 - Camera Simulator:**
```bash
cd iot-devices
python simulate_camera.py
```

### 7.2 Check Everything
- ✅ Backend: http://localhost:8000
- ✅ API Docs: http://localhost:8000/docs
- ✅ Frontend: http://localhost:5173
- ✅ MQTT: Should see messages in Terminal 3
- ✅ Simulator: Should detect plates every 5-10 seconds

---

## 📊 Step 8: Database Management Tools

### Option 1: pgAdmin (GUI for PostgreSQL)
```bash
# Windows: Download from pgadmin.org
# Linux: sudo apt install pgadmin4
# Mac: brew install --cask pgadmin4
```

### Option 2: DBeaver (Universal Database Tool)
```bash
# Download from dbeaver.io
# Free, supports PostgreSQL, MySQL, SQLite
```

### Option 3: Command Line
```bash
# Connect to database
psql -U postgres -d campus_anpr

# Useful commands:
\dt              # List all tables
\d users         # Describe users table
SELECT * FROM users;
\q               # Quit
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Port 8000 already in use"
```bash
# Find process using port
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :8000
kill -9 <PID>
```

### Issue 2: "Cannot connect to PostgreSQL"
```bash
# Check if PostgreSQL is running
# Windows:
net start postgresql

# Linux:
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Issue 3: "Module not found"
```bash
# Make sure virtual environment is activated
# Backend:
cd backend
source venv/bin/activate  # or venv\Scripts\activate
pip install -r requirements.txt

# Frontend:
cd frontend
npm install
```

### Issue 4: "MQTT connection refused"
```bash
# Check if Mosquitto is running
# Windows:
net start mosquitto

# Linux:
sudo systemctl status mosquitto
sudo systemctl start mosquitto

# Test connection:
mosquitto_sub -h localhost -t test
```

---

## 📝 Quick Reference

### Start Development Environment
```bash
# Terminal 1 - Database (if not running as service)
# N/A if PostgreSQL runs as service

# Terminal 2 - Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Terminal 3 - Frontend  
cd frontend && npm run dev

# Terminal 4 - MQTT Broker (if not running as service)
mosquitto -v
```

### Environment Variables Summary
```
Backend (.env):
- DATABASE_URL
- SECRET_KEY
- MQTT_BROKER
- FRONTEND_URL

Frontend (.env):
- VITE_API_URL
- VITE_WS_URL
```

---

## 🎯 Next Steps

Now that everything is set up:

1. ✅ **Add Authentication** (JWT tokens, login/register)
2. ✅ **Create API Endpoints** (CRUD for vehicles, users, logs)
3. ✅ **Build React Components** (Dashboard, Vehicle list, etc.)
4. ✅ **Implement WebSocket** (Real-time updates)
5. ✅ **Add ANPR Processing** (Integrate with actual cameras)

Would you like me to create:
- 🔐 **Complete authentication system**?
- 📋 **All CRUD API endpoints**?
- 🎨 **React dashboard components**?
- 📡 **WebSocket real-time updates**?

Just let me know what to build next!