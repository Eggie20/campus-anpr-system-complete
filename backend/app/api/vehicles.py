from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.utils.database import get_db
from app.utils.security import get_current_user
from app.models.user import User
from app.models.vehicle import Vehicle, VehicleType, VehicleStatus
from pydantic import BaseModel, UUID4

router = APIRouter()

# --- Pydantic Schemas ---
class VehicleCreate(BaseModel):
    plate_number: str
    type: str # car, motorcycle, etc.
    make: str
    model: str
    color: Optional[str] = None

class VehicleResponse(BaseModel):
    id: UUID4
    plate_number: str
    type: str
    make: str
    model: str
    color: Optional[str]
    status: str
    registration_date: Optional[datetime]
    expiry_date: Optional[datetime]
    
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
    # Check if plate already exists
    if db.query(Vehicle).filter(Vehicle.plate_number == vehicle_in.plate_number).first():
        raise HTTPException(status_code=400, detail="Vehicle with this plate number already registered")
    
    # Map string type to Enum
    try:
        v_type = VehicleType(vehicle_in.type.lower())
    except ValueError:
        v_type = VehicleType.other

    new_vehicle = Vehicle(
        user_id=current_user.id,
        plate_number=vehicle_in.plate_number.upper(),
        type=v_type,
        make=vehicle_in.make,
        model=vehicle_in.model,
        color=vehicle_in.color,
        status=VehicleStatus.pending, # Always pending initially
        registration_date=datetime.now()
    )
    
    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)
    return new_vehicle
