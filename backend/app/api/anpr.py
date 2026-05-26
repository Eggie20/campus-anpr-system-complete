from __future__ import annotations

import json
import random
import anyio
from datetime import datetime, timezone
from typing import Any, Optional
from uuid import UUID

import os

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, text
from sqlalchemy.orm import Session

from app.models.anpr import AnprAlertKind, AnprAnomalyEvent, AnprPlateCapture
from app.models.blacklist import BlacklistRecord
from app.models.camera import Camera
from app.models.entry_log import EntryLog, EntryDirection, LogCategory
from app.models.notification import Notification, NotificationType
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.violation import Violation, ViolationType
from app.services.alerts_ws import alerts_ws_manager
from app.services.anpr_lookup import build_lookup_payload, classify_plate, mask_owner_name
from app.utils.database import get_db
from app.utils.plates import format_plate_display, normalize_plate_key
from app.utils.security import require_security_or_admin

router = APIRouter()


class PlateCorrectionRequest(BaseModel):
    corrected_plate: str = Field(..., min_length=1, max_length=40)


class AnprCaptureRequest(BaseModel):
    plate: str = Field(..., min_length=1, max_length=40)
    confidence_score: Optional[float] = None
    brand: Optional[str] = None
    color: Optional[str] = None
    vehicle_type: Optional[str] = None
    camera_id: Optional[UUID] = None
    gate_id: Optional[UUID] = None
    gate_name: Optional[str] = None
    camera_name: Optional[str] = None
    gate_display: Optional[str] = None
    payload: Optional[dict[str, Any]] = None


class SmartAnprWebhookRequest(BaseModel):
    plate_number: str = Field(..., min_length=1, max_length=40)
    brand: Optional[str] = None
    color: Optional[str] = None
    vehicle_type: Optional[str] = None
    confidence: Optional[dict[str, float]] = None
    timestamp: Optional[float] = None
    evidence_image_base64: Optional[str] = None
    bbox: Optional[list[list[float]]] = None


def _log_system(db: Session, actor_id: Optional[UUID], action: str, details: Optional[dict] = None) -> None:
    db.execute(
        text(
            "INSERT INTO system_logs (actor_id, action, category, details) "
            "VALUES (CAST(:actor_id AS uuid), :action, 'system', CAST(:details AS jsonb))"
        ),
        {
            "actor_id": str(actor_id) if actor_id else None,
            "action": action,
            "details": json.dumps(details or {}),
        },
    )


def _kind_to_violation_type(kind: AnprAlertKind) -> ViolationType:
    if kind == AnprAlertKind.breach_blacklisted:
        return ViolationType.blacklisted
    if kind == AnprAlertKind.breach_expired:
        return ViolationType.expired_registration
    if kind == AnprAlertKind.breach_rejected:
        return ViolationType.unauthorized_access
    return ViolationType.unregistered


def _emit_alert_event(event: dict[str, Any]) -> None:
    """Bridge sync SQLAlchemy endpoints to async WebSocket broadcaster."""
    try:
        anyio.from_thread.run(alerts_ws_manager.broadcast, event)
    except RuntimeError:
        # No active async loop context (e.g., tests); skip realtime push.
        pass


def _run_capture(
    db: Session,
    body: AnprCaptureRequest,
    current_user: Optional[User],
) -> dict[str, Any]:
    if not normalize_plate_key(body.plate):
        raise HTTPException(status_code=400, detail="Invalid plate")

    # ── RESOLVE gate_name → gate_id ──
    if body.gate_name and not body.gate_id:
        from app.models.gate import Gate
        gate = db.query(Gate).filter(Gate.name == body.gate_name).first()
        if not gate:
            gate = Gate(name=body.gate_name)
            db.add(gate)
            db.flush()
        body.gate_id = gate.id

    if body.gate_display:
        if not body.payload:
            body.payload = {}
        body.payload["gate_display"] = body.gate_display

    kind, vehicle, _msg = classify_plate(db, body.plate, body.confidence_score)

    auth_status = kind.value
    is_violation = kind.value.startswith("breach_")
    requires_manual = kind != AnprAlertKind.access

    snap_url = None
    if body.payload and isinstance(body.payload, dict):
        snap_url = body.payload.get("snapshot_image_url")

    # ── SMART ENTRY/EXIT DIRECTION TOGGLE ──
    # For registered (access) vehicles, determine direction based on current campus state.
    # 1st detection → ENTRY (is_on_campus becomes True)
    # 2nd detection (after cooldown) → EXIT (is_on_campus becomes False)
    # Re-detection within cooldown → polling duplicate, skip creating a new log.
    COOLDOWN_SECONDS = 15
    direction = EntryDirection.entry
    category = LogCategory.entry
    is_cooldown_duplicate = False

    if vehicle and kind == AnprAlertKind.access:
        RAPID_MOVEMENT_SECONDS = 120
        if vehicle.is_on_campus:
            # Vehicle is already inside campus
            if vehicle.last_seen_at:
                elapsed = (datetime.now(timezone.utc) - vehicle.last_seen_at).total_seconds()
                if elapsed <= COOLDOWN_SECONDS:
                    # Within cooldown → polling duplicate, don't create a new log
                    is_cooldown_duplicate = True
                else:
                    # Beyond cooldown → this is an EXIT
                    direction = EntryDirection.exit
                    category = LogCategory.exit
                    if elapsed <= RAPID_MOVEMENT_SECONDS:
                        kind = AnprAlertKind.anomaly_rapid_movement
                        requires_manual = True
                        auth_status = kind.value
            else:
                # No last_seen_at but is_on_campus=True → treat as EXIT
                direction = EntryDirection.exit
                category = LogCategory.exit
        else:
            # Vehicle is NOT on campus → this is an ENTRY
            direction = EntryDirection.entry
            category = LogCategory.entry
            if vehicle.last_seen_at:
                elapsed = (datetime.now(timezone.utc) - vehicle.last_seen_at).total_seconds()
                if elapsed <= RAPID_MOVEMENT_SECONDS:
                    kind = AnprAlertKind.anomaly_rapid_movement
                    requires_manual = True
                    auth_status = kind.value

    # If this is a cooldown duplicate for an access vehicle, just update last_seen_at and return early
    if is_cooldown_duplicate and vehicle:
        vehicle.last_seen_at = datetime.now(timezone.utc)
        db.commit()
        return {
            "status": "ok",
            "capture_id": None,
            "entry_log_id": None,
            "kind": kind.value,
            "plate_display": format_plate_display(body.plate) or body.plate.strip(),
            "owner_name_masked": mask_owner_name(vehicle.owner.full_name if vehicle.owner else None),
            "vehicle_id": str(vehicle.id),
            "anomaly_id": None,
            "violation_id": None,
            "confidence_score": float(body.confidence_score) if body.confidence_score is not None else None,
            "brand": body.brand,
            "color": body.color,
            "vehicle_type": body.vehicle_type,
            "direction": "duplicate_skipped",
        }

    entry = EntryLog(
        detected_plate_number=format_plate_display(body.plate) or body.plate.upper().strip(),
        vehicle_id=vehicle.id if vehicle else None,
        user_id=vehicle.user_id if vehicle else None,
        direction=direction,
        category=category,
        confidence_score=body.confidence_score,
        authorization_status=auth_status,
        is_violation=is_violation,
        requires_manual_verification=requires_manual,
        camera_id=body.camera_id,
        gate_id=body.gate_id,
        snapshot_image_url=snap_url[:255] if snap_url and isinstance(snap_url, str) else None,
    )
    db.add(entry)
    db.flush()

    capture = AnprPlateCapture(
        plate_normalized=normalize_plate_key(body.plate),
        plate_raw=body.plate.strip()[:40],
        confidence_score=body.confidence_score,
        brand=(body.brand or "")[:80] or None,
        color=(body.color or "")[:80] or None,
        vehicle_type_detected=(body.vehicle_type or "")[:50] or None,
        camera_id=body.camera_id,
        gate_id=body.gate_id,
        vehicle_id=vehicle.id if vehicle else None,
        recorded_by=current_user.id if current_user else None,
        alert_kind=kind,
        payload=body.payload,
        entry_log_id=entry.id,
    )
    db.add(capture)
    db.flush()

    anomaly_id: Optional[str] = None
    violation_id: Optional[str] = None

    if kind != AnprAlertKind.access:
        ev = AnprAnomalyEvent(
            capture_id=capture.id,
            kind=kind,
            status="open",
        )
        db.add(ev)
        db.flush()
        anomaly_id = str(ev.id)

        vio = Violation(
            entry_log_id=entry.id,
            vehicle_id=vehicle.id if vehicle else None,
            type=_kind_to_violation_type(kind),
            description=f"ANPR auto-flag: {kind.value}",
            status="unresolved",
        )
        db.add(vio)
        db.flush()
        violation_id = str(vio.id)

    if vehicle:
        # Determine gate name — prefer the explicit gate_name sent by frontend
        resolved_gate_name = body.gate_name or "Main Gate"
        if not body.gate_name and body.gate_id:
            from app.models.gate import Gate
            gate = db.query(Gate).filter(Gate.id == body.gate_id).first()
            if gate and gate.name:
                resolved_gate_name = gate.name
        elif not body.gate_name and body.camera_id:
            cam = db.query(Camera).filter(Camera.id == body.camera_id).first()
            if cam and cam.gate and cam.gate.name:
                resolved_gate_name = cam.gate.name

        if direction == EntryDirection.exit:
            vehicle.is_on_campus = False
        else:
            vehicle.is_on_campus = True
        vehicle.last_seen_at = datetime.now(timezone.utc)
        vehicle.last_seen_gate = resolved_gate_name

    # ── CREATE NOTIFICATION for vehicle owner ──
    plate_display = format_plate_display(body.plate) or body.plate.upper().strip()
    if vehicle and vehicle.user_id:
        if kind == AnprAlertKind.access:
            if direction == EntryDirection.entry:
                notif = Notification(
                    user_id=vehicle.user_id,
                    type=NotificationType.SUCCESS,
                    title="Vehicle Entered Campus",
                    message=f"Your vehicle ({plate_display}) has entered the campus.",
                )
            else:
                notif = Notification(
                    user_id=vehicle.user_id,
                    type=NotificationType.INFO,
                    title="Vehicle Exited Campus",
                    message=f"Your vehicle ({plate_display}) has exited the campus.",
                )
            db.add(notif)
        elif kind in (AnprAlertKind.anomaly_unregistered, AnprAlertKind.anomaly_low_confidence, AnprAlertKind.anomaly_rapid_movement):
            notif = Notification(
                user_id=vehicle.user_id,
                type=NotificationType.WARNING,
                title="Vehicle Flagged",
                message=f"Your vehicle ({plate_display}) was flagged during ANPR scan. Please verify your registration or check with security.",
            )
            db.add(notif)

    db.commit()
    db.refresh(capture)

    owner_masked = mask_owner_name(vehicle.owner.full_name if vehicle and vehicle.owner else None)

    if kind != AnprAlertKind.access and anomaly_id:
        _emit_alert_event(
            {
                "type": "anomaly.created",
                "anomaly_id": anomaly_id,
                "capture_id": str(capture.id),
                "kind": kind.value,
                "status": "open",
                "plate_display": format_plate_display(body.plate) or body.plate.strip(),
                "owner_name_masked": owner_masked,
                "vehicle_id": str(vehicle.id) if vehicle else None,
                "camera_id": str(body.camera_id) if body.camera_id else None,
                "gate_id": str(body.gate_id) if body.gate_id else None,
                "gate_name": body.gate_name or "Main Gate",
                "gate_display": body.gate_display or body.gate_name or "Main Gate",
                "created_at": capture.created_at.isoformat() if capture.created_at else None,
            }
        )

    return {
        "status": "ok",
        "capture_id": str(capture.id),
        "entry_log_id": str(entry.id),
        "kind": kind.value,
        "plate_display": format_plate_display(body.plate) or body.plate.strip(),
        "owner_name_masked": owner_masked,
        "vehicle_id": str(vehicle.id) if vehicle else None,
        "anomaly_id": anomaly_id,
        "violation_id": violation_id,
        "confidence_score": float(body.confidence_score) if body.confidence_score is not None else None,
        "brand": body.brand,
        "color": body.color,
        "vehicle_type": body.vehicle_type,
        "direction": direction.value,
        "gate_name": body.gate_name or "Main Gate",
        "gate_display": body.gate_display or body.gate_name or "Main Gate",
    }


@router.get("/lookup/{plate}")
def lookup_plate(
    plate: str,
    confidence: Optional[float] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_security_or_admin),
):
    """Resolve plate against campus PostgreSQL registry (vehicles/users/blacklist)."""
    if not plate or not normalize_plate_key(plate):
        raise HTTPException(status_code=400, detail="Invalid plate")
    return build_lookup_payload(db, plate, ocr_confidence=confidence)


@router.post("/capture")
def ingest_capture(
    body: AnprCaptureRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_security_or_admin),
):
    """Persist detection from SMART-PLATE / security dashboard; creates entry_log + capture (+ anomaly row if needed)."""
    return _run_capture(db, body, current_user)


@router.post("/webhook/smart-anpr")
def smart_anpr_webhook(
    body: SmartAnprWebhookRequest,
    db: Session = Depends(get_db),
    x_webhook_token: Optional[str] = Header(default=None),
):
    """
    Ingest detection pushed by smart_anpr engine.
    Configure token with SMART_ANPR_WEBHOOK_TOKEN in backend environment.
    """
    required_token = os.getenv("SMART_ANPR_WEBHOOK_TOKEN", "").strip()
    if required_token and x_webhook_token != required_token:
        raise HTTPException(status_code=401, detail="Invalid webhook token")

    plate = (body.plate_number or "").strip()
    if not plate:
        raise HTTPException(status_code=400, detail="Missing plate_number")

    conf_payload = body.confidence or {}
    plate_conf = conf_payload.get("plate") if isinstance(conf_payload, dict) else None
    confidence_score = float(plate_conf) if plate_conf is not None else None

    capture_req = AnprCaptureRequest(
        plate=plate,
        confidence_score=confidence_score,
        brand=body.brand,
        color=body.color,
        vehicle_type=body.vehicle_type,
        payload={
            "source": "smart_anpr_webhook",
            "timestamp": body.timestamp,
            "snapshot_base64": body.evidence_image_base64,
            "plate_bbox": body.bbox,
            "confidence": body.confidence,
        },
    )
    return _run_capture(db, capture_req, None)


@router.get("/stats/vehicle-counts")
def stats_vehicle_counts(
    db: Session = Depends(get_db),
):
    """Live aggregates for security dashboard vehicle count panel."""
    row = db.execute(
        text(
            """
            SELECT
              (SELECT COUNT(*)::int FROM entry_logs
               WHERE (timestamp AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date
                 AND direction = 'entry' AND authorization_status = 'access') AS today_entries,
              (SELECT COUNT(*)::int FROM vehicles WHERE is_on_campus = TRUE AND deleted_at IS NULL) AS on_campus_total,
              (SELECT COUNT(*)::int FROM vehicles
               WHERE is_on_campus = TRUE AND type = 'other' AND deleted_at IS NULL) AS others,
              (SELECT COUNT(*)::int FROM entry_logs
               WHERE timestamp > NOW() - INTERVAL '5 minutes' AND direction = 'entry' AND authorization_status = 'access') AS entries_last_5m
            """
        )
    ).mappings().first()

    by_type_rows = db.execute(
        text(
            """
            SELECT type::text AS t, COUNT(*)::int AS c
            FROM vehicles
            WHERE is_on_campus = TRUE AND deleted_at IS NULL
            GROUP BY type
            """
        )
    ).mappings().all()

    by_type = {"car": 0, "motorcycle": 0, "van": 0, "truck": 0, "other": 0}
    for r in by_type_rows:
        k = r["t"]
        if k in by_type:
            by_type[k] = r["c"]

    today_type_rows = db.execute(
        text(
            """
            SELECT COALESCE(v.type::text, 'other') AS t, COUNT(*)::int AS c
            FROM entry_logs e
            LEFT JOIN vehicles v ON e.vehicle_id = v.id AND v.deleted_at IS NULL
            WHERE (e.timestamp AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date
              AND e.direction = 'entry' AND e.authorization_status = 'access'
            GROUP BY COALESCE(v.type::text, 'other')
            """
        )
    ).mappings().all()

    today_by_type = {"car": 0, "motorcycle": 0, "van": 0, "truck": 0, "other": 0}
    for r in today_type_rows:
        k = r["t"]
        if k in today_by_type:
            today_by_type[k] = r["c"]

    today = int(row["today_entries"] or 0)
    last5 = int(row["entries_last_5m"] or 0)
    rate_per_min = round(last5 / 5.0, 2) if last5 else 0.0

    return {
        "total_vehicles_today": today,
        "currently_inside": int(row["on_campus_total"] or 0),
        "others_count": int(row["others"] or 0),
        "entries_last_5_minutes": last5,
        "rate_per_minute_recent": rate_per_min,
        "on_campus_by_type": by_type,
        "today_entries_by_type": today_by_type,
    }


@router.get("/stats/alert-counts")
def stats_alert_counts(
    db: Session = Depends(get_db),
):
    """Tab badge counts per CSUCC spec (live from DB)."""
    row = db.execute(
        text(
            """
            SELECT
              (SELECT COUNT(*)::int FROM anpr_anomaly_events
               WHERE kind IN ('anomaly_unregistered', 'anomaly_low_confidence')
                 AND (created_at AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date) AS anomaly,
              (SELECT COUNT(*)::int FROM anpr_anomaly_events
               WHERE kind IN ('breach_blacklisted', 'breach_expired', 'breach_rejected')
                 AND (created_at AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date) AS breach,
              (SELECT COUNT(*)::int FROM anpr_plate_captures 
               WHERE vehicle_id IS NULL
                 AND (created_at AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date) AS unknown,
              (SELECT COUNT(*)::int FROM anpr_plate_captures 
               WHERE alert_kind = 'access'
                 AND (created_at AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date) AS access
            """
        )
    ).mappings().first()
    return {
        "anomaly": int(row["anomaly"] or 0),
        "breach": int(row["breach"] or 0),
        "unknown": int(row["unknown"] or 0),
        "access": int(row["access"] or 0),
    }


@router.post("/stats/reset-on-campus")
def stats_reset_on_campus(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_security_or_admin),
):
    """Clear is_on_campus for all vehicles; audit in system_logs."""
    n = db.execute(
        text("UPDATE vehicles SET is_on_campus = FALSE, updated_at = NOW() WHERE deleted_at IS NULL")
    ).rowcount
    _log_system(
        db,
        current_user.id,
        "vehicle_count.reset_on_campus",
        {"cleared_rows": n},
    )
    db.commit()
    return {"status": "ok", "updated": n}


@router.post("/simulate")
def simulate_detection(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_security_or_admin),
):
    """Insert a realistic detection row for demos; uses random plate scenarios when possible."""
    cams = (
        db.query(Camera)
        .filter(Camera.is_active.is_(True))
        .order_by(func.random())
        .limit(8)
        .all()
    )
    cam = random.choice(cams) if cams else None

    kind_roll = random.choice(
        [
            AnprAlertKind.access,
            AnprAlertKind.anomaly_unregistered,
            AnprAlertKind.breach_blacklisted,
        ]
    )

    plate: str
    if kind_roll == AnprAlertKind.access:
        v = (
            db.query(Vehicle)
            .filter(Vehicle.status == VehicleStatus.approved, Vehicle.deleted_at.is_(None))
            .order_by(func.random())
            .first()
        )
        plate = v.plate_number if v else f"DMO {random.randint(1000, 9999)}"
    elif kind_roll == AnprAlertKind.breach_blacklisted:
        v_bl = (
            db.query(Vehicle)
            .filter(Vehicle.status == VehicleStatus.blacklisted, Vehicle.deleted_at.is_(None))
            .first()
        )
        if v_bl:
            plate = v_bl.plate_number
        else:
            bl = (
                db.query(BlacklistRecord)
                .filter(BlacklistRecord.is_active.is_(True))
                .first()
            )
            if bl and bl.vehicle_id:
                v2 = db.query(Vehicle).filter(Vehicle.id == bl.vehicle_id).first()
                plate = v2.plate_number if v2 else f"BLK {random.randint(1000, 9999)}"
            else:
                plate = f"UNR {random.randint(10000, 99999)}"
                kind_roll = AnprAlertKind.anomaly_unregistered
    else:
        plate = f"UNR {random.randint(10000, 99999)}"

    conf = round(random.uniform(72.0, 99.0), 2)
    body = AnprCaptureRequest(
        plate=plate,
        confidence_score=conf,
        brand=random.choice(["Toyota", "Mitsubishi", "Honda", "Nissan", "Ford"]),
        color=random.choice(["Pearl White", "Navy Blue", "Metallic Gray", "Ruby Red"]),
        vehicle_type=random.choice(["car", "van", "motorcycle", "truck"]),
        camera_id=cam.id if cam else None,
        gate_id=cam.gate_id if cam else None,
        payload={
            "simulated": True,
            "requested_kind": kind_roll.value,
        },
    )

    # Re-classify from DB truth (plate may not match requested kind if DB empty)
    out = _run_capture(db, body, current_user)
    out["gate_label"] = cam.name if cam else "Simulated Gate"
    return out


def _get_anomaly_or_404(db: Session, anomaly_id: UUID) -> AnprAnomalyEvent:
    ev = db.query(AnprAnomalyEvent).filter(AnprAnomalyEvent.id == anomaly_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    return ev


@router.patch("/anomaly/{anomaly_id}/dismiss")
def dismiss_anomaly(
    anomaly_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_security_or_admin),
):
    ev = _get_anomaly_or_404(db, anomaly_id)
    ev.status = "dismissed"
    _log_system(
        db,
        current_user.id,
        "alert.dismissed",
        {"anomaly_id": str(anomaly_id), "capture_id": str(ev.capture_id), "plate": ev.capture.plate_raw if ev.capture else None},
    )
    db.commit()
    _emit_alert_event(
        {
            "type": "anomaly.status_changed",
            "anomaly_id": str(anomaly_id),
            "capture_id": str(ev.capture_id),
            "status": "dismissed",
        }
    )
    return {"status": "ok"}


@router.patch("/anomaly/{anomaly_id}/escalate")
def escalate_anomaly(
    anomaly_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_security_or_admin),
):
    ev = _get_anomaly_or_404(db, anomaly_id)
    ev.status = "escalated"

    # Promote anomaly → breach so the breach counter and entry logs reflect the escalation
    if ev.kind in (AnprAlertKind.anomaly_unregistered, AnprAlertKind.anomaly_low_confidence):
        ev.kind = AnprAlertKind.breach_rejected

    cap = ev.capture
    if cap:
        cap.alert_kind = ev.kind  # sync capture record

    entry = cap.entry_log if cap else None
    if entry:
        entry.authorization_status = ev.kind.value  # e.g. "breach_rejected"
        entry.is_violation = True
        vio = db.query(Violation).filter(Violation.entry_log_id == entry.id).first()
        if vio:
            vio.status = "escalated"

    admin = db.query(User).filter(User.role == UserRole.admin, User.deleted_at.is_(None)).first()
    if admin:
        plate = cap.plate_raw or cap.plate_normalized if cap else ""
        db.add(
            Notification(
                user_id=admin.id,
                title="ANPR alert escalated",
                message=f"Security escalated anomaly {anomaly_id} — plate {plate}",
                type=NotificationType.WARNING,
            )
        )

    _log_system(
        db,
        current_user.id,
        "alert.escalated",
        {"anomaly_id": str(anomaly_id), "capture_id": str(ev.capture_id), "plate": ev.capture.plate_raw if ev.capture else None},
    )
    db.commit()
    _emit_alert_event(
        {
            "type": "anomaly.status_changed",
            "anomaly_id": str(anomaly_id),
            "capture_id": str(ev.capture_id),
            "status": "escalated",
            "kind": ev.kind.value,
        }
    )
    return {"status": "ok"}


@router.patch("/anomaly/{anomaly_id}/resolve")
def resolve_anomaly(
    anomaly_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_security_or_admin),
):
    ev = _get_anomaly_or_404(db, anomaly_id)
    ev.status = "resolved"
    cap = ev.capture
    entry = cap.entry_log if cap else None
    if entry:
        vio = db.query(Violation).filter(Violation.entry_log_id == entry.id).first()
        if vio:
            vio.status = "resolved"
            vio.resolved_by = current_user.id
            vio.resolved_at = datetime.now(timezone.utc)

    _log_system(
        db,
        current_user.id,
        "alert.resolved",
        {"anomaly_id": str(anomaly_id), "capture_id": str(ev.capture_id), "plate": ev.capture.plate_raw if ev.capture else None},
    )
    db.commit()
    _emit_alert_event(
        {
            "type": "anomaly.status_changed",
            "anomaly_id": str(anomaly_id),
            "capture_id": str(ev.capture_id),
            "status": "resolved",
        }
    )
    return {"status": "ok"}


@router.patch("/anomaly/{anomaly_id}/correct_plate")
def correct_anomaly_plate(
    anomaly_id: UUID,
    req: PlateCorrectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_security_or_admin),
):
    ev = _get_anomaly_or_404(db, anomaly_id)
    cap = ev.capture
    if not cap:
        raise HTTPException(status_code=404, detail="Capture log missing for this anomaly")
        
    old_plate = cap.plate_raw
    new_plate = req.corrected_plate.strip()
    
    # 1. Update plate in capture
    cap.plate_raw = new_plate
    cap.plate_normalized = normalize_plate_key(new_plate)
    
    # 2. Re-classify with the new plate
    kind, vehicle, message = classify_plate(db, new_plate, float(cap.confidence_score) if cap.confidence_score else None)
    
    # Update capture mapping
    cap.alert_kind = kind
    cap.vehicle_id = vehicle.id if vehicle else None
    
    # Update vehicle details on the capture record
    if vehicle:
        cap.brand = vehicle.brand
        cap.color = vehicle.color
        cap.vehicle_type_detected = vehicle.type.value if vehicle.type else cap.vehicle_type_detected
    else:
        cap.brand = None
        cap.color = None
    
    # Update Payload dict if it exists
    if cap.payload:
        pl = dict(cap.payload)
        pl["plate"] = normalize_plate_key(new_plate)
        if vehicle:
            pl["brand"] = vehicle.brand
            pl["color"] = vehicle.color
            pl["vehicle_type"] = vehicle.type.value if vehicle.type else None
            pl["detected_owner"] = mask_owner_name(vehicle.owner.full_name) if vehicle.owner and vehicle.owner.full_name else "Unknown"
        else:
            pl["brand"] = None
            pl["color"] = None
            pl["vehicle_type"] = None
            pl["detected_owner"] = "Unknown"
        pl["alert_category"] = kind.value
        cap.payload = pl
            
    # 3. Update entry log if it exists
    entry = cap.entry_log
    if entry:
        entry.detected_plate_number = normalize_plate_key(new_plate)
        entry.vehicle_id = vehicle.id if vehicle else None
        
        if kind == AnprAlertKind.access:
            entry.authorization_status = "authorized"
            
            # Apply normal Entry/Exit toggle logic on manual correction
            if vehicle and vehicle.is_on_campus:
                entry.direction = EntryDirection.exit
                entry.category = LogCategory.exit
                vehicle.is_on_campus = False
            else:
                entry.direction = EntryDirection.entry
                entry.category = LogCategory.entry
                if vehicle:
                    vehicle.is_on_campus = True
                    
            if vehicle:
                vehicle.last_seen_at = datetime.now(timezone.utc)

            entry.requires_manual_verification = False
            # Resolve existing violation
            from app.models.violation import Violation
            vio = db.query(Violation).filter(Violation.entry_log_id == entry.id).first()
            if vio and vio.status == "open":
                vio.status = "resolved"
                vio.resolved_by = current_user.id
                vio.resolved_at = datetime.now(timezone.utc)
        else:
            entry.authorization_status = "unregistered" if kind in [AnprAlertKind.anomaly_unregistered, AnprAlertKind.anomaly_low_confidence] else "blacklisted"
            entry.category = LogCategory.alert
            
    # 4. Update the Anomaly Event
    ev.kind = kind
    ev.notes = f"{(ev.notes + '; ') if ev.notes else ''}Plate manually corrected from '{old_plate}' to '{new_plate}' by {current_user.full_name}."
    
    # Auto-resolve if fully verified
    if kind == AnprAlertKind.access:
        ev.status = "resolved"
        
    _log_system(
        db,
        current_user.id,
        "alert.plate_corrected",
        {
            "anomaly_id": str(anomaly_id), 
            "capture_id": str(cap.id), 
            "old_plate": old_plate, 
            "new_plate": new_plate
        },
    )
        
    db.commit()
    
    # 5. Build lookup payload so frontend receives the new data
    payload = build_lookup_payload(db, new_plate, float(cap.confidence_score) if cap.confidence_score else None)
    
    _emit_alert_event(
        {
            "type": "anomaly.plate_corrected",
            "anomaly_id": str(anomaly_id),
            "capture_id": str(cap.id),
            "old_plate": old_plate,
            "new_plate": new_plate,
            "new_kind": kind.value,
            "status": ev.status
        }
    )
    
    return {"status": "ok", "message": "Plate corrected", "data": payload, "anomaly_status": ev.status}


@router.get("/alerts/today")
def get_today_alerts(
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_security_or_admin),
):
    """Return today's ANPR captures as persistent Live Alerts, ordered by most recent first.

    Each capture includes its CURRENT alert_kind (reflecting any corrections or escalations)
    so the dashboard always shows the up-to-date status.
    """
    from sqlalchemy.orm import joinedload
    import zoneinfo

    ph_tz = zoneinfo.ZoneInfo("Asia/Manila")

    captures = (
        db.query(AnprPlateCapture)
        .options(
            joinedload(AnprPlateCapture.vehicle).joinedload(Vehicle.owner),
            joinedload(AnprPlateCapture.anomaly_events),
        )
        .filter(
            text("(anpr_plate_captures.created_at AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date")
        )
        .order_by(AnprPlateCapture.created_at.desc())
        .limit(limit)
        .all()
    )

    items = []
    for cap in captures:
        kind = cap.alert_kind.value if cap.alert_kind else "anomaly_unregistered"
        plate = format_plate_display(cap.plate_raw) or cap.plate_raw or cap.plate_normalized or "—"

        # Owner info
        owner_name = "Unknown Owner/Driver"
        if cap.vehicle and cap.vehicle.owner:
            owner_name = mask_owner_name(cap.vehicle.owner.full_name)

        # Vehicle details
        brand = cap.brand or "Unknown"
        color = cap.color or "Unknown"
        vtype = cap.vehicle_type_detected or "Car"

        # Confidence
        conf = float(cap.confidence_score) if cap.confidence_score is not None else 0.0

        # Anomaly info (pick the latest event for this capture)
        anomaly_id = None
        anomaly_status = None
        if cap.anomaly_events:
            latest_ev = max(cap.anomaly_events, key=lambda e: e.created_at or datetime.min.replace(tzinfo=timezone.utc))
            anomaly_id = str(latest_ev.id)
            anomaly_status = latest_ev.status
            # Use the anomaly event's kind as it may have been escalated
            kind = latest_ev.kind.value if latest_ev.kind else kind

        # Timestamp
        ts = cap.created_at.astimezone(ph_tz) if cap.created_at else None
        time_str = ts.strftime("%I:%M:%S %p") if ts else "—"

        # Snapshot URL from payload
        snapshot_url = None
        if cap.payload and isinstance(cap.payload, dict):
            snapshot_url = cap.payload.get("snapshot_base64") or cap.payload.get("snapshot_image_url")

        # Gate name from the capture's gate relationship
        gate_name_str = "Main Gate"
        if cap.gate_id:
            from app.models.gate import Gate as GateModel
            gate_obj = db.query(GateModel).filter(GateModel.id == cap.gate_id).first()
            if gate_obj:
                gate_name_str = gate_obj.name

        gate_display = cap.payload.get("gate_display") if cap.payload and isinstance(cap.payload, dict) and cap.payload.get("gate_display") else gate_name_str

        items.append({
            "capture_id": str(cap.id),
            "plate": plate,
            "kind": kind,
            "owner": owner_name,
            "brand": brand,
            "color": color,
            "vehicle_type": vtype,
            "confidence": round(conf, 1),
            "anomaly_id": anomaly_id,
            "anomaly_status": anomaly_status,
            "time": time_str,
            "snapshot_url": snapshot_url,
            "vehicle_id": str(cap.vehicle_id) if cap.vehicle_id else None,
            "gate_name": gate_name_str,
            "gate_display": gate_display,
        })

    return {"alerts": items}

from typing import List

from typing import List
from pydantic import BaseModel

class TagUpdateRequest(BaseModel):
    tags: List[str]

@router.patch("/anomaly/{anomaly_id}/tags")
def update_anomaly_tags(
    anomaly_id: UUID,
    req: TagUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_security_or_admin),
):
    ev = _get_anomaly_or_404(db, anomaly_id)
    ev.tags = req.tags
    
    _log_system(
        db,
        current_user.id,
        "alert.tags_updated",
        {"anomaly_id": str(anomaly_id), "tags": req.tags},
    )
    db.commit()
    return {"status": "ok", "tags": ev.tags}

@router.get("/anomalies")
def get_anomalies(
    status: Optional[str] = None,
    kind: Optional[str] = None,
    gate: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    role: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_security_or_admin),
):
    from sqlalchemy.orm import joinedload
    import zoneinfo

    ph_tz = zoneinfo.ZoneInfo("Asia/Manila")

    q = db.query(AnprAnomalyEvent).options(
        joinedload(AnprAnomalyEvent.capture).joinedload(AnprPlateCapture.vehicle).joinedload(Vehicle.owner)
    )

    if status:
        q = q.filter(AnprAnomalyEvent.status == status.lower())
    if kind:
        q = q.filter(AnprAnomalyEvent.kind == kind)
    
    if search:
        search_term = f"%{search.lower()}%"
        q = q.filter(func.lower(AnprPlateCapture.plate_raw).like(search_term) | func.lower(AnprPlateCapture.plate_normalized).like(search_term))
    
    if gate:
        q = q.filter(AnprPlateCapture.camera_id == gate)

    if start_date:
        from datetime import datetime
        try:
            sd = datetime.fromisoformat(start_date)
            q = q.filter(AnprAnomalyEvent.created_at >= sd)
        except ValueError:
            pass

    if end_date:
        from datetime import datetime
        try:
            ed = datetime.fromisoformat(end_date)
            q = q.filter(AnprAnomalyEvent.created_at <= ed)
        except ValueError:
            pass

    if role:
        # User roles are in User.role, which is related to Vehicle.owner
        q = q.filter(Vehicle.owner.has(User.role == role.lower()))
        
    q = q.order_by(AnprAnomalyEvent.created_at.desc())
    
    total = q.count()
    events = q.offset(offset).limit(limit).all()

    items = []
    for ev in events:
        cap = ev.capture
        plate = cap.plate_raw or cap.plate_normalized if cap else "-"
        
        owner_name = "Unknown Owner/Driver"
        if cap and cap.vehicle and cap.vehicle.owner:
            owner_name = mask_owner_name(cap.vehicle.owner.full_name)

        brand = cap.brand or "Unknown" if cap else "Unknown"
        color = cap.color or "Unknown" if cap else "Unknown"
        vtype = cap.vehicle_type_detected or "Car" if cap else "Car"
        conf = float(cap.confidence_score) if cap and cap.confidence_score is not None else 0.0

        ts = ev.created_at.astimezone(ph_tz) if ev.created_at else None
        time_str = ts.strftime("%b %d, %Y %I:%M:%S %p") if ts else "-"

        snapshot_url = None
        gate_name_str = "Main Gate"
        if cap:
            if cap.payload and isinstance(cap.payload, dict):
                snapshot_url = cap.payload.get("snapshot_base64") or cap.payload.get("snapshot_image_url")
                gate_name_str = cap.payload.get("gate_display") or cap.payload.get("gate_name") or gate_name_str
                
            if cap.gate_id:
                from app.models.gate import Gate as GateModel
                gate_obj = db.query(GateModel).filter(GateModel.id == cap.gate_id).first()
                if gate_obj:
                    gate_name_str = gate_obj.name

        if gate and gate.lower() not in gate_name_str.lower():
            continue

        items.append({
            "id": str(ev.id),
            "capture_id": str(cap.id) if cap else None,
            "plate": format_plate_display(plate) or plate,
            "kind": ev.kind.value if ev.kind else "unknown",
            "status": ev.status,
            "notes": ev.notes,
            "tags": ev.tags or [],
            "owner": owner_name,
            "brand": brand,
            "color": color,
            "vehicle_type": vtype,
            "confidence": round(conf, 1),
            "time": time_str,
            "gate_name": gate_name_str,
            "snapshot_url": snapshot_url,
        })

    return {"total": total, "items": items}
