# 🛠️ Campus ANPR System - Technology Stack

> A comprehensive guide to all technologies, tools, and frameworks used in the Campus ANPR Vehicle Logging System.

---

## 📊 Stack Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│            React + Vite + Tailwind CSS                          │
├─────────────────────────────────────────────────────────────────┤
│                      API / REAL-TIME                            │
│           REST API (Axios) + WebSocket (Socket.io)              │
├─────────────────────────────────────────────────────────────────┤
│                         BACKEND                                  │
│              Python FastAPI + SQLAlchemy                        │
├───────────────────────────┬─────────────────────────────────────┤
│       DATABASE            │           IoT LAYER                 │
│      PostgreSQL           │    MQTT (Mosquitto) + Cameras       │
└───────────────────────────┴─────────────────────────────────────┘
```

---

## 🗄️ Database

### PostgreSQL (Recommended ⭐)

| Aspect      | Details                     |
| ----------- | --------------------------- |
| **Version** | 14+                         |
| **Purpose** | Primary production database |
| **Driver**  | `psycopg2-binary`           |

#### Why PostgreSQL?

| Feature               | Benefit                                       |
| --------------------- | --------------------------------------------- |
| **JSONB Support**     | Store flexible camera metadata & ANPR results |
| **Full-Text Search**  | Efficiently search plate numbers              |
| **PostGIS Extension** | Location tracking for campus gates            |
| **Reliability**       | Battle-tested for production environments     |
| **Python Support**    | Works perfectly with SQLAlchemy ORM           |
| **Cost**              | 100% Free & Open-source                       |

### SQLite (Development Only)

| Aspect      | Details                                  |
| ----------- | ---------------------------------------- |
| **Purpose** | Quick development & prototyping          |
| **Pros**    | No setup, file-based, portable           |
| **Cons**    | No concurrent writes, not for production |

---

## 🔧 Backend Stack

### Core Framework

| Technology  | Version | Purpose                    |
| ----------- | ------- | -------------------------- |
| **Python**  | 3.10+   | Core programming language  |
| **FastAPI** | 0.109.0 | Modern async web framework |
| **Uvicorn** | 0.27.0  | Lightning-fast ASGI server |

### Why FastAPI?

- ⚡ **High Performance** - One of the fastest Python frameworks
- 📝 **Auto Documentation** - Swagger UI & ReDoc built-in
- ✅ **Type Safety** - Full Python type hints support
- 🔐 **Security** - OAuth2, JWT authentication support
- 🔄 **Async Support** - Native async/await for real-time features

### Database & ORM

| Technology            | Version | Purpose                         |
| --------------------- | ------- | ------------------------------- |
| **SQLAlchemy**        | 2.0.25  | Python SQL toolkit & ORM        |
| **Alembic**           | 1.13.1  | Database schema migrations      |
| **Pydantic**          | 2.5.3   | Data validation & serialization |
| **pydantic-settings** | 2.1.0   | Environment configuration       |

### Authentication & Security

| Technology          | Version | Purpose                     |
| ------------------- | ------- | --------------------------- |
| **python-jose**     | 3.3.0   | JWT token encoding/decoding |
| **passlib[bcrypt]** | 1.7.4   | Secure password hashing     |

### IoT & Real-Time

| Technology     | Version | Purpose                               |
| -------------- | ------- | ------------------------------------- |
| **paho-mqtt**  | 1.6.1   | MQTT client for IoT devices           |
| **websockets** | 12.0    | Real-time bidirectional communication |
| **redis**      | 5.0.1   | Caching & session storage (optional)  |

### Utilities

| Technology           | Version | Purpose                      |
| -------------------- | ------- | ---------------------------- |
| **python-multipart** | 0.0.6   | File upload handling         |
| **python-dotenv**    | 1.0.0   | Environment variable loading |
| **aiosqlite**        | 0.19.0  | Async SQLite support         |

---

## ⚛️ Frontend Stack

### Core Framework

| Technology | Purpose                                 |
| ---------- | --------------------------------------- |
| **React**  | Component-based UI library              |
| **Vite**   | Next-generation build tool & dev server |

### Why React + Vite?

- ⚡ **Instant HMR** - Hot Module Replacement for fast development
- 📦 **Optimized Builds** - Tree-shaking & code splitting
- 🔧 **Modern DX** - TypeScript support, ESM-native
- 🌍 **Large Ecosystem** - Vast library & community support

### Styling

| Technology       | Purpose                     |
| ---------------- | --------------------------- |
| **Tailwind CSS** | Utility-first CSS framework |
| **PostCSS**      | CSS transformations         |
| **Autoprefixer** | Automatic vendor prefixes   |

### State & Data Management

| Technology         | Purpose                           |
| ------------------ | --------------------------------- |
| **TanStack Query** | Server state management & caching |
| **React Context**  | Global application state          |
| **React Hooks**    | Component logic encapsulation     |

### HTTP & Real-Time

| Technology           | Purpose                           |
| -------------------- | --------------------------------- |
| **Axios**            | HTTP client for API calls         |
| **Socket.io-client** | Real-time WebSocket communication |

### Routing

| Technology           | Purpose                          |
| -------------------- | -------------------------------- |
| **React Router DOM** | Client-side routing & navigation |

---

## 🔌 IoT & Messaging

### MQTT Protocol

| Component            | Technology     |
| -------------------- | -------------- |
| **Broker**           | Mosquitto      |
| **Client (Backend)** | paho-mqtt      |
| **Port**             | 1883 (default) |

#### MQTT Topic Structure

```
anpr/
├── gate1/
│   └── plate_detected     # Camera detections from Gate 1
├── gate2/
│   └── plate_detected     # Camera detections from Gate 2
```

#### Message Payload Example

```json
{
  "plate": "ABC 1234",
  "gate": "Main Gate",
  "timestamp": "2026-01-03T21:30:00",
  "confidence": 0.95,
  "camera_id": "CAM-001"
}
```

### WebSocket

| Aspect      | Details                                     |
| ----------- | ------------------------------------------- |
| **Purpose** | Real-time updates to frontend               |
| **Events**  | Vehicle detected, alerts, notifications     |
| **Library** | websockets (backend) / Socket.io (frontend) |

---

## 🐳 DevOps & Infrastructure

### Containerization

| Technology         | Purpose                            |
| ------------------ | ---------------------------------- |
| **Docker**         | Container runtime                  |
| **Docker Compose** | Multi-container orchestration      |
| **Nginx**          | Reverse proxy & static file server |

### CI/CD

| Technology         | Purpose                        |
| ------------------ | ------------------------------ |
| **GitHub Actions** | Automated testing & deployment |
| **Git**            | Version control                |

### Container Structure

```yaml
services:
  backend: # FastAPI application
  frontend: # React app (Nginx)
  postgres: # PostgreSQL database
  mosquitto: # MQTT broker
  redis: # Caching (optional)
```

---

## 💻 Development Environment

### Required Software

| Software       | Minimum Version | Purpose          |
| -------------- | --------------- | ---------------- |
| **Python**     | 3.10+           | Backend runtime  |
| **Node.js**    | 18+             | Frontend runtime |
| **PostgreSQL** | 14+             | Database server  |
| **Git**        | Latest          | Version control  |
| **Mosquitto**  | 2.0+            | MQTT broker      |

### Package Managers

| OS          | Recommended |
| ----------- | ----------- |
| **Windows** | Chocolatey  |
| **macOS**   | Homebrew    |
| **Linux**   | apt / dnf   |

### IDE Recommendations

| IDE          | Best For               |
| ------------ | ---------------------- |
| **VS Code**  | Full-stack development |
| **PyCharm**  | Python-heavy work      |
| **WebStorm** | Frontend-focused       |

---

## 📦 Complete Dependencies

### Backend (requirements.txt)

```txt
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
```

### Frontend (package.json)

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.0.0",
    "socket.io-client": "^4.6.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/campus_anpr

# Security
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# MQTT
MQTT_BROKER=localhost
MQTT_PORT=1883

# Redis (optional)
REDIS_URL=redis://localhost:6379

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

---

## 🏗️ Architecture Diagram

```mermaid
flowchart TB
    subgraph Frontend["Frontend (React)"]
        UI[React Components]
        API[Axios API Client]
        WS[WebSocket Client]
    end

    subgraph Backend["Backend (FastAPI)"]
        REST[REST API]
        WSS[WebSocket Server]
        MQTT[MQTT Handler]
        SVC[Business Services]
        ORM[SQLAlchemy ORM]
    end

    subgraph Database["Database Layer"]
        PG[(PostgreSQL)]
        RD[(Redis Cache)]
    end

    subgraph IoT["IoT Devices"]
        CAM[ANPR Cameras]
        GATE[Gate Controllers]
    end

    subgraph Broker["Message Broker"]
        MQ[Mosquitto MQTT]
    end

    UI --> API
    UI --> WS
    API --> REST
    WS --> WSS
    REST --> SVC
    SVC --> ORM
    ORM --> PG
    SVC --> RD
    CAM --> MQ
    GATE --> MQ
    MQ --> MQTT
    MQTT --> SVC
    WSS --> WS
```

---

## 📚 Quick Reference

| Layer    | Technology   | Port |
| -------- | ------------ | ---- |
| Frontend | React (Vite) | 5173 |
| Backend  | FastAPI      | 8000 |
| Database | PostgreSQL   | 5432 |
| Cache    | Redis        | 6379 |
| MQTT     | Mosquitto    | 1883 |

---

## 🎯 Summary

This technology stack provides:

- ✅ **Scalability** - Async Python + React for high performance
- ✅ **Real-time** - MQTT + WebSocket for instant updates
- ✅ **Security** - JWT authentication + bcrypt hashing
- ✅ **Maintainability** - Type-safe code + ORM
- ✅ **DevOps Ready** - Docker containerization
- ✅ **Cost Effective** - 100% open-source stack
