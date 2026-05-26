"""
Registration file retrieval endpoints.
Admin-only access to ID photos, OR/CR documents, and QR codes
stored in the secure_uploads directory.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.utils.security import require_admin
from app.models.user import User
import os

router = APIRouter()


@router.get("/{token}/id-photo")
async def get_id_photo(token: str, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    """Retrieve the ID photo for a registration (admin audit only)."""
    user = db.query(User).filter(User.registration_token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail="Registration not found")
    if not user.id_photo_path or not os.path.exists(user.id_photo_path):
        raise HTTPException(status_code=404, detail="ID photo not found")
    return FileResponse(user.id_photo_path, media_type="image/jpeg")


@router.get("/{token}/orcr-photo")
async def get_orcr_photo(token: str, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    """Retrieve the OR/CR document for a registration (admin audit only)."""
    user = db.query(User).filter(User.registration_token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail="Registration not found")
    if not user.orcr_photo_path or not os.path.exists(user.orcr_photo_path):
        raise HTTPException(status_code=404, detail="OR/CR document not found")
    return FileResponse(user.orcr_photo_path, media_type="image/jpeg")


@router.get("/{token}/qr-code")
async def get_qr_code(token: str, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    """Retrieve the QR code image for a registration (admin audit only)."""
    user = db.query(User).filter(User.registration_token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail="Registration not found")
    if not user.qr_code_path or not os.path.exists(user.qr_code_path):
        raise HTTPException(status_code=404, detail="QR code not found")
    return FileResponse(user.qr_code_path, media_type="image/png")
