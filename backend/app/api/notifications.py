from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime

from app.utils.database import get_db
from app.utils.security import get_current_user
from app.models.user import User
from app.models.notification import Notification
from pydantic import BaseModel, UUID4

router = APIRouter()

# --- Schemas ---
class NotificationResponse(BaseModel):
    id: UUID4
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class PaginatedNotifications(BaseModel):
    items: List[NotificationResponse]
    total: int
    limit: int
    skip: int

# --- Endpoints ---

@router.get("/me", response_model=PaginatedNotifications)
def get_my_notifications(
    limit: int = 10,
    skip: int = 0,
    unread_only: bool = False,
    type: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
        
    if type and type != 'all':
        query = query.filter(Notification.type == type)
        
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Notification.title.ilike(search_term)) | 
            (Notification.message.ilike(search_term))
        )
        
    total = query.count()
    items = query.order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()

    
    return {
        "items": items,
        "total": total,
        "limit": limit,
        "skip": skip
    }



@router.put("/{notif_id}/read")
def mark_as_read(
    notif_id: UUID4,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.is_read = True
    db.commit()
    return {"status": "success"}

@router.put("/{notif_id}/unread")
def mark_as_unread(
    notif_id: UUID4,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.is_read = False
    db.commit()
    return {"status": "success"}


@router.put("/read-all")
def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"status": "success"}
