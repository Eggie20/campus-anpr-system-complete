from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional, Tuple

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.anpr import AnprAlertKind
from app.models.blacklist import BlacklistRecord
from app.models.user import AccountStatus
from app.models.vehicle import Vehicle, VehicleStatus
from app.utils.plates import format_plate_display, normalize_plate_key


def find_vehicle_by_plate(db: Session, plate_raw: str) -> Optional[Vehicle]:
    """Match plate ignoring whitespace differences."""
    key = normalize_plate_key(plate_raw)
    if not key:
        return None
    return (
        db.query(Vehicle)
        .options(joinedload(Vehicle.owner))
        .filter(
            func.regexp_replace(func.upper(Vehicle.plate_number), r"\s+", "", "g") == key
        )
        .first()
    )


def mask_owner_name(full_name: Optional[str]) -> str:
    if not full_name or not full_name.strip():
        return "Unknown Owner/Driver"
    parts = full_name.strip().split()
    out = []
    for p in parts[:4]:
        if not p:
            continue
        out.append(p[0].upper() + "***")
    return " ".join(out) if out else "Unknown Owner/Driver"


def classify_plate(
    db: Session,
    plate_raw: str,
    ocr_confidence: Optional[float] = None,
    min_confidence: float = 70.0,
) -> Tuple[AnprAlertKind, Optional[Vehicle], str]:
    """
    Return (alert_kind, vehicle_or_none, human_message).
    Pending vehicle/user still yields access (campus integration rule).
    """
    key = normalize_plate_key(plate_raw)
    if not key:
        return AnprAlertKind.anomaly_unregistered, None, "Empty plate"

    vehicle = find_vehicle_by_plate(db, plate_raw)

    if not vehicle:
        # Check if frequent unregistered
        from app.models.anpr import AnprPlateCapture
        from datetime import timedelta
        
        recent_count = db.query(func.count(AnprPlateCapture.id)).filter(
            AnprPlateCapture.plate_normalized == key,
            AnprPlateCapture.created_at >= datetime.now(timezone.utc) - timedelta(days=7)
        ).scalar() or 0
        
        if recent_count >= 3:
            return AnprAlertKind.anomaly_frequent_unregistered, None, f"Frequent unregistered plate ({recent_count} times in 7 days)"

        if ocr_confidence is not None and ocr_confidence < min_confidence:
            return (
                AnprAlertKind.anomaly_low_confidence,
                None,
                "Low confidence read; plate not in registry",
            )
        return AnprAlertKind.anomaly_unregistered, None, "Plate not registered"

    active_bl = (
        db.query(BlacklistRecord)
        .filter(
            BlacklistRecord.vehicle_id == vehicle.id,
            BlacklistRecord.is_active.is_(True),
        )
        .first()
    )

    if vehicle.status == VehicleStatus.blacklisted or active_bl:
        return AnprAlertKind.breach_blacklisted, vehicle, "Blacklisted vehicle"

    if vehicle.status == VehicleStatus.rejected:
        return AnprAlertKind.breach_rejected, vehicle, "Registration rejected"

    if vehicle.expiry_date:
        exp = vehicle.expiry_date
        if exp.tzinfo:
            exp_d = exp.astimezone(timezone.utc).date()
        else:
            exp_d = exp.date()
        if datetime.now(timezone.utc).date() > exp_d:
            return AnprAlertKind.breach_expired, vehicle, "Vehicle registration expired"

    owner = vehicle.owner
    if owner and owner.status == AccountStatus.suspended:
        return AnprAlertKind.breach_rejected, vehicle, "Account suspended"

    return AnprAlertKind.access, vehicle, "Vehicle is registered"


def vehicle_to_public_dict(vehicle: Vehicle) -> dict[str, Any]:
    return {
        "id": str(vehicle.id),
        "plate_number": vehicle.plate_number,
        "type": vehicle.type.value if vehicle.type else None,
        "brand": vehicle.brand,
        "color": vehicle.color,
        "status": vehicle.status.value if vehicle.status else None,
    }


def build_lookup_payload(
    db: Session,
    plate_raw: str,
    ocr_confidence: Optional[float] = None,
) -> dict[str, Any]:
    kind, vehicle, message = classify_plate(db, plate_raw, ocr_confidence)
    owner_masked = mask_owner_name(vehicle.owner.full_name if vehicle and vehicle.owner else None)
    user_status = None
    if vehicle and vehicle.owner:
        user_status = vehicle.owner.status.value

    payload: dict[str, Any] = {
        "kind": kind.value,
        "message": message,
        "owner_name_masked": owner_masked,
        "user_status": user_status,
        "vehicle": vehicle_to_public_dict(vehicle) if vehicle else None,
        "plate_normalized": normalize_plate_key(plate_raw),
        "plate_display": format_plate_display(plate_raw),
    }
    return payload
