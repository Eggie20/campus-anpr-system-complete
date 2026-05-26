import os
import uuid as uid_mod
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.utils.database import get_db
from app.utils.security import get_current_user
from app.models.user import User
from app.models.vehicle import Vehicle, VehicleType, VehicleStatus
from app.services.anpr_lookup import find_vehicle_by_plate
from app.utils.plates import format_plate_display
from pydantic import BaseModel, UUID4

router = APIRouter()

SECURE_UPLOADS_DIR = Path("secure_uploads")
SECURE_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

def _save_upload(upload_file: UploadFile, destination: str):
    import shutil
    with open(destination, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

# --- Pydantic Schemas ---
class VehicleCreate(BaseModel):
    plate_number: str
    type: str # car, motorcycle, etc.
    brand: str
    color: Optional[str] = None

class VehicleResponse(BaseModel):
    id: UUID4
    plate_number: str
    type: str
    brand: str
    color: Optional[str]
    status: str
    registration_date: Optional[datetime]
    expiry_date: Optional[datetime]
    orcr_photo_path: Optional[str] = None
    
    class Config:
        from_attributes = True

# --- Endpoints ---

@router.get("/me", response_model=List[VehicleResponse])
def get_my_vehicles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all vehicles belonging to the current user."""
    return db.query(Vehicle).filter(Vehicle.user_id == current_user.id).all()

@router.post("/", response_model=VehicleResponse)
def register_vehicle(
    vehicle_in: VehicleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register a new vehicle for the current user."""
    if find_vehicle_by_plate(db, vehicle_in.plate_number):
        raise HTTPException(status_code=400, detail="Vehicle with this plate number already registered")
    
    # Map string type to Enum
    try:
        v_type = VehicleType(vehicle_in.type.lower())
    except ValueError:
        v_type = VehicleType.other

    reg_date = datetime.now()
    new_vehicle = Vehicle(
        user_id=current_user.id,
        plate_number=format_plate_display(vehicle_in.plate_number) or vehicle_in.plate_number.upper().strip(),
        type=v_type,
        brand=vehicle_in.brand,
        color=vehicle_in.color,
        status=VehicleStatus.pending, # Always pending initially
        registration_date=reg_date,
        expiry_date=reg_date + timedelta(days=365),  # 12-month rolling permit
    )
    
    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)
    return new_vehicle

@router.post("/register-with-docs", response_model=VehicleResponse)
async def register_vehicle_with_docs(
    plateNumber: str = Form(...),
    vehicleType: str = Form("car"),
    brand: str = Form(...),
    color: str = Form(""),
    orcrPhoto: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register a new vehicle with OR/CR document upload."""
    plate = format_plate_display(plateNumber) or plateNumber.upper().strip()
    if find_vehicle_by_plate(db, plate):
        raise HTTPException(status_code=400, detail="Vehicle with this plate number already registered")

    try:
        v_type = VehicleType(vehicleType.lower())
    except ValueError:
        v_type = VehicleType.other

    reg_date = datetime.now()
    new_vehicle = Vehicle(
        user_id=current_user.id,
        plate_number=plate,
        type=v_type,
        brand=brand,
        color=color or None,
        status=VehicleStatus.pending,
        registration_date=reg_date,
        expiry_date=reg_date + timedelta(days=365),
    )

    db.add(new_vehicle)
    db.flush()

    if orcrPhoto and orcrPhoto.filename:
        ext = os.path.splitext(orcrPhoto.filename)[1] or ".jpg"
        orcr_filename = f"vehicle_{new_vehicle.id}_orcr{ext}"
        orcr_dest = str(SECURE_UPLOADS_DIR / orcr_filename)
        _save_upload(orcrPhoto, orcr_dest)
        new_vehicle.orcr_photo_path = orcr_dest

    db.commit()
    db.refresh(new_vehicle)
    return new_vehicle

@router.patch("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: UUID4,
    vehicle_in: VehicleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update details of a vehicle belonging to the current user."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.user_id == current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Check if plate number is changed and if new plate already exists
    new_plate = format_plate_display(vehicle_in.plate_number) or vehicle_in.plate_number.upper().strip()
    if new_plate != vehicle.plate_number:
        if find_vehicle_by_plate(db, new_plate):
            raise HTTPException(status_code=400, detail="Vehicle with this plate number already registered")
        vehicle.plate_number = new_plate

    # Update other fields
    try:
        vehicle.type = VehicleType(vehicle_in.type.lower())
    except ValueError:
        pass
        
    vehicle.brand = vehicle_in.brand
    vehicle.color = vehicle_in.color

    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.post("/{vehicle_id}/upload-orcr", response_model=VehicleResponse)
async def upload_orcr(
    vehicle_id: UUID4,
    orcrPhoto: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload or replace OR/CR document for an existing vehicle."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.user_id == current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Remove old file if exists
    if vehicle.orcr_photo_path and os.path.exists(vehicle.orcr_photo_path):
        try:
            os.remove(vehicle.orcr_photo_path)
        except OSError:
            pass

    ext = os.path.splitext(orcrPhoto.filename)[1] or ".jpg"
    orcr_filename = f"vehicle_{vehicle.id}_orcr{ext}"
    orcr_dest = str(SECURE_UPLOADS_DIR / orcr_filename)
    _save_upload(orcrPhoto, orcr_dest)
    vehicle.orcr_photo_path = orcr_dest

    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: UUID4,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a vehicle belonging to the current user."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.user_id == current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Clean up uploaded documents
    if vehicle.orcr_photo_path and os.path.exists(vehicle.orcr_photo_path):
        try:
            os.remove(vehicle.orcr_photo_path)
        except OSError:
            pass
    
    db.delete(vehicle)
    db.commit()
    return {"message": "Vehicle removed successfully"}
