"""
Security Staff API — endpoints for managing security personnel.
Separated from admin.py to keep the admin module untouched.
"""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc

from app.models.user import User, AccountStatus, UserRole
from app.models.vehicle import Vehicle
from app.utils.database import get_db
from app.utils.security import require_admin, get_password_hash

router = APIRouter()


from app.models.ocr_scan import OcrScan


def _serialize_officer(u: User) -> dict:
    """Serialize a User model into a frontend-friendly dict for security staff."""
    initials = ""
    if u.first_name and u.last_name:
        initials = u.first_name[0].upper() + u.last_name[0].upper()
    elif u.full_name:
        parts = u.full_name.split()
        initials = "".join(p[0].upper() for p in parts[:2])
    else:
        initials = u.username[0].upper() if u.username else "?"

    id_number = u.staff_id or u.student_id or u.faculty_id or "—"

    last_login = "Never"
    if u.last_login_at:
        last_login = u.last_login_at.strftime("%b %d %I:%M %p")

    vehicle_list = []
    if u.vehicles:
        for v in u.vehicles:
            vehicle_list.append({
                "plate": v.plate_number,
                "type": v.type.value if v.type else "car",
                "status": v.status.value.title() if v.status else "Unknown",
                "brand": v.brand or "—",
                "color": v.color or "—",
            })

    return {
        "id": str(u.id),
        "name": u.full_name or u.username,
        "email": u.email,
        "username": u.username,
        "role": u.role.value.title() if u.role else "Unknown",
        "idNumber": id_number,
        "status": u.status.value.title() if u.status else "Unknown",
        "registered": u.created_at.astimezone(timezone.utc).strftime("%b %d, %Y") if u.created_at else "—",
        "last_login": last_login,
        "vehicle_count": len(u.vehicles) if u.vehicles else 0,
        "vehicles": vehicle_list,
        "avatar": initials,
        "phone": u.phone_number or "—",
        "address": u.address or "—",
        "sex": u.sex.value if u.sex else "—",
        "birth_date": u.birth_date.strftime("%b %d, %Y") if u.birth_date else "—",
        "nationality": u.nationality or "—",
        "department": u.department or u.staff_department or "—",
        "position": u.position or u.job_title or "—",
        "employment_type": u.employment_type or u.employment_status or "—",
        "drivers_license": u.drivers_license_no or "—",
        "license_expiry": u.license_expiry_date.strftime("%b %d, %Y") if u.license_expiry_date else "—",
    }


@router.get("/{officer_id}/logs")
def get_officer_logs(
    officer_id: UUID,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Fetch recent activity logs for a specific officer (e.g., OCR verifications)."""
    
    # Query OCR scans verified by this officer
    scans = (
        db.query(OcrScan)
        .options(joinedload(OcrScan.user))
        .filter(OcrScan.verified_by == officer_id)
        .order_by(desc(OcrScan.created_at))
        .limit(50)
        .all()
    )
    
    logs = []
    for s in scans:
        target_name = s.user.full_name if s.user else "Unknown User"
        logs.append({
            "id": str(s.id),
            "type": "OCR Verification",
            "description": f"Verified {s.scan_type.replace('_', ' ').title()} for {target_name}",
            "timestamp": s.created_at.strftime("%b %d, %I:%M %p") if s.created_at else "Just now",
            "status": "Success",
            "icon": "verified_user" if s.is_verified else "error"
        })
        
    return {
        "status": "success",
        "logs": logs
    }


@router.post("/create-officer")
def create_security_officer(
    data: dict,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Create a new security officer account (admin-provisioned)."""

    first_name = data.get("first_name", "").strip()
    last_name = data.get("last_name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not first_name or not last_name or not email or not password:
        raise HTTPException(
            status_code=400,
            detail="First name, last name, email, and password are required.",
        )

    # Check for duplicate email
    existing = db.query(User).filter(func.lower(User.email) == func.lower(email)).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )

    # Generate unique username from email
    username = email.split("@")[0].lower()
    base_username = username
    counter = 1
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1

    middle_name = data.get("middle_name", "").strip() or None
    phone = data.get("phone", "").strip() or None
    address = data.get("address", "").strip() or None
    badge_id = data.get("badge_id", "").strip() or None
    sex = data.get("sex", "").strip() or None
    birth_date = data.get("birth_date", "").strip() or None
    nationality = data.get("nationality", "").strip() or "Filipino"
    department = data.get("department", "").strip() or None

    new_user = User(
        email=email,
        username=username,
        password_hash=get_password_hash(password),
        first_name=first_name,
        middle_name=middle_name,
        last_name=last_name,
        role=UserRole.security,
        status=AccountStatus.active,
        phone_number=phone,
        address=address,
        staff_id=badge_id,
        sex=sex,
        nationality=nationality,
        birth_date=birth_date if birth_date else None,
        staff_department=department or "Security Department",
        job_title="Security Officer",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "status": "success",
        "user": _serialize_officer(new_user),
        "message": f"Officer {new_user.full_name} has been commissioned successfully.",
    }
