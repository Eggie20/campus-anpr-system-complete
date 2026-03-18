from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime

from app.utils.database import get_db
from app.utils.security import get_current_user
from app.models.user import User
from app.models.entry_log import EntryLog
from app.models.vehicle import Vehicle
from pydantic import BaseModel, UUID4

router = APIRouter()

# --- Schemas ---
class EntryLogResponse(BaseModel):
    id: UUID4
    plate_number: str
    direction: str
    gate_name: str
    timestamp: datetime
    confidence_score: Optional[float]
    
    class Config:
        from_attributes = True

# --- Endpoints ---

@router.get("/me", response_model=List[EntryLogResponse])
def get_my_logs(
    limit: int = 50,
    direction: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get entry logs for vehicles owned by the current user."""
    # Get user's vehicle IDs
    user_vehicle_ids = [v.id for v in user_vehicles(current_user, db)]
    
    if not user_vehicle_ids:
        return []

    query = db.query(EntryLog).filter(EntryLog.vehicle_id.in_(user_vehicle_ids))
    
    if direction:
        query = query.filter(EntryLog.direction == direction)
        
    return query.order_by(desc(EntryLog.timestamp)).limit(limit).all()

def user_vehicles(user: User, db: Session):
    return db.query(Vehicle).filter(Vehicle.user_id == user.id).all()
