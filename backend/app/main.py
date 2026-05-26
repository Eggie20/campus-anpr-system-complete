from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users, students, vehicles, entry_logs, dashboard, notifications, admin, ocr, anpr, registration, settings, security_staff, analytics
from app.services.alerts_ws import alerts_ws_manager

app = FastAPI(
    title="Campus ANPR System API",
    description="Backend API for Automatic Number Plate Recognition System",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8003",
        "http://127.0.0.1:8003",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(ocr.router, prefix="/api/v1/ocr", tags=["OCR"])
# app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
# app.include_router(students.router, prefix="/api/v1/students", tags=["Students"])
app.include_router(vehicles.router, prefix="/api/v1/vehicles", tags=["Vehicles"])
app.include_router(entry_logs.router, prefix="/api/v1/entry-logs", tags=["Entry Logs"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(anpr.router, prefix="/api/v1/anpr", tags=["ANPR"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(security_staff.router, prefix="/api/v1/security-staff", tags=["Security Staff"])
app.include_router(registration.router, prefix="/api/v1/registration", tags=["Registration"])
app.include_router(settings.router, prefix="/api/v1/settings", tags=["Settings"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Campus ANPR System API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.websocket("/ws/alerts")
async def ws_alerts(websocket: WebSocket):
    await alerts_ws_manager.connect(websocket)
    try:
        while True:
            # Accept lightweight keepalive pings from clients.
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        alerts_ws_manager.disconnect(websocket)
