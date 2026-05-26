"""
Settings API — Global system configuration endpoint.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.settings import Setting
from app.utils.database import get_db

router = APIRouter()


def get_settings(db: Session | None = None):
    """Return all settings as a flat dict. Can be called with or without a DB session."""
    if db is None:
        from app.utils.database import SessionLocal
        db = SessionLocal()
        try:
            rows = db.query(Setting).all()
            return {r.key: r.value for r in rows}
        finally:
            db.close()
    rows = db.query(Setting).all()
    return {r.key: r.value for r in rows}


from pydantic import BaseModel
from typing import Dict, Any

class SettingsUpdate(BaseModel):
    settings: Dict[str, Any]

@router.get("")
def list_settings(db: Session = Depends(get_db)):
    """Return all system settings."""
    return get_settings(db)

@router.post("")
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_db)):
    """Update system settings."""
    for key, value in payload.settings.items():
        setting = db.query(Setting).filter(Setting.key == key).first()
        if setting:
            setting.value = value
        else:
            setting = Setting(key=key, value=value)
            db.add(setting)
    db.commit()
    return {"status": "success"}
