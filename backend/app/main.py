from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users, students, vehicles, entry_logs, dashboard, notifications, admin, ocr

app = FastAPI(
    title="Campus ANPR System API",
    description="Backend API for Automatic Number Plate Recognition System",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
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
# app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Campus ANPR System API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
