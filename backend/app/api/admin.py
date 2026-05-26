from __future__ import annotations

from datetime import datetime, timezone, timedelta
from typing import Any, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from sqlalchemy import func, or_
from app.models.user import User, AccountStatus, UserRole
from app.models.vehicle import Vehicle, VehicleStatus, VehicleType
from app.models.entry_log import EntryLog
from app.utils.database import get_db
from app.utils.security import require_admin

router = APIRouter()


def _vehicle_icon(vtype: VehicleType | None) -> str:
    if vtype == VehicleType.motorcycle:
        return "motorcycle"
    if vtype == VehicleType.van:
        return "airport_shuttle"
    if vtype == VehicleType.truck:
        return "local_shipping"
    return "directions_car"


def _display_status(vs: VehicleStatus) -> str:
    if vs == VehicleStatus.approved:
        return "Registered"
    if vs == VehicleStatus.pending:
        return "Pending"
    if vs == VehicleStatus.expired:
        return "Expired"
    if vs == VehicleStatus.blacklisted:
        return "Blacklisted"
    if vs == VehicleStatus.rejected:
        return "Rejected"
    return vs.value.title()


def _serialize_vehicle(v: Vehicle) -> dict[str, Any]:
    owner = v.owner
    role_label = owner.role.value.title() if owner and owner.role else "Unknown"
    model_bits = [x for x in [v.brand, v.color] if x]
    model_str = " • ".join(model_bits) if model_bits else "—"
    last_gate = v.last_seen_gate or "—"
    last_time = "—"
    if v.last_seen_at:
        last_time = v.last_seen_at.astimezone(timezone.utc).strftime("%I:%M %p")
    exp = v.expiry_date
    if exp:
        expiry_iso = exp.isoformat()
    else:
        # Fallback: 12 months from registration date
        reg = v.registration_date or v.created_at or datetime.now(timezone.utc)
        expiry_iso = (reg + timedelta(days=365)).isoformat()

    return {
        "id": str(v.id),
        "plate": v.plate_number,
        "description": model_str,
        "owner": owner.full_name if owner else "Unknown",
        "role": role_label,
        "type": v.type.value if v.type else "car",
        "status": _display_status(v.status),
        "status_raw": v.status.value,
        "onCampus": bool(v.is_on_campus),
        "lastSeen": {"gate": last_gate, "time": last_time},
        "expiryDate": expiry_iso,
        "registrationDate": v.registration_date.isoformat() if v.registration_date else None,
        "icon": _vehicle_icon(v.type),
    }


@router.get("/vehicles")
def admin_list_vehicles(
    status: Optional[str] = Query(None, description="Filter: pending, approved, rejected, ..."),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = db.query(Vehicle).options(joinedload(Vehicle.owner))
    if status:
        try:
            vs = VehicleStatus(status.lower())
            q = q.filter(Vehicle.status == vs)
        except ValueError:
            pass
    vehicles = q.order_by(Vehicle.created_at.desc()).all()
    items = [_serialize_vehicle(v) for v in vehicles]

    pending_n = sum(1 for v in vehicles if v.status == VehicleStatus.pending)
    approved_n = sum(1 for v in vehicles if v.status == VehicleStatus.approved)
    expired_n = sum(1 for v in vehicles if v.status == VehicleStatus.expired)
    on_campus_n = sum(1 for v in vehicles if v.is_on_campus)

    # Count vehicles expiring within 30 days
    now_utc = datetime.now(timezone.utc)
    threshold = now_utc + timedelta(days=30)
    expiring_soon_n = sum(
        1 for v in vehicles
        if v.expiry_date and v.status == VehicleStatus.approved
        and now_utc < v.expiry_date <= threshold
    )

    # Count by type
    type_counts = {}
    for v in vehicles:
        t = v.type.value if v.type else "other"
        type_counts[t] = type_counts.get(t, 0) + 1

    stats = {
        "total": {"count": len(vehicles), "byType": type_counts},
        "active": {"count": approved_n},
        "pending": {"count": pending_n},
        "expiry": {"expired": expired_n, "expiringSoon": expiring_soon_n},
        "onCampus": {"total": on_campus_n},
    }

    return {"vehicles": items, "stats": stats}


@router.patch("/vehicles/{vehicle_id}/approve")
def admin_approve_vehicle(
    vehicle_id: UUID,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    v = (
        db.query(Vehicle)
        .options(joinedload(Vehicle.owner))
        .filter(Vehicle.id == vehicle_id)
        .first()
    )
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    v.status = VehicleStatus.approved
    v.approved_by = admin_user.id
    v.approved_at = datetime.now(timezone.utc)
    # Set 12-month rolling permit from approval date
    v.expiry_date = v.approved_at + timedelta(days=365)
    if v.owner and v.owner.status == AccountStatus.pending:
        v.owner.status = AccountStatus.active

    db.commit()
    db.refresh(v)
    return {"status": "success", "vehicle": _serialize_vehicle(v)}


@router.patch("/vehicles/{vehicle_id}/reject")
def admin_reject_vehicle(
    vehicle_id: UUID,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    v = (
        db.query(Vehicle)
        .options(joinedload(Vehicle.owner))
        .filter(Vehicle.id == vehicle_id)
        .first()
    )
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    v.status = VehicleStatus.rejected
    # No approved_by/at for rejection, but we could add rejected_by if model supports it
    # For now, just set status
    
    db.commit()
    db.refresh(v)
    return {"status": "success", "vehicle": _serialize_vehicle(v)}


def _serialize_user(u: User) -> dict[str, Any]:
    role_colors = {
        UserRole.admin: "badge-warning",
        UserRole.faculty: "badge-secondary",
        UserRole.student: "badge-primary",
        UserRole.security: "badge-success",
        UserRole.staff: "badge-info",
        UserRole.visitor: "badge-neutral",
    }
    
    role_class = {
        UserRole.admin: "role-admin",
        UserRole.faculty: "role-faculty",
        UserRole.student: "bg-student",
        UserRole.security: "bg-security",
        UserRole.staff: "role-staff",
        UserRole.visitor: "role-visitor",
    }

    id_number = "—"
    if u.role == UserRole.student and u.student_id:
        id_number = u.student_id
    elif u.role == UserRole.faculty and u.faculty_id:
        id_number = u.faculty_id
    elif u.role == UserRole.staff and u.staff_id:
        id_number = u.staff_id

    initials = ""
    if u.first_name and u.last_name:
        initials = f"{u.first_name[0]}{u.last_name[0]}".upper()
    elif u.username:
        initials = u.username[:2].upper()

    import zoneinfo
    ph_tz = zoneinfo.ZoneInfo("Asia/Manila")

    last_login = "Never"
    if u.last_login_at:
        last_login = u.last_login_at.astimezone(ph_tz).strftime("%b %d, %I:%M %p")

    reg_date = u.created_at.astimezone(ph_tz).date()
    today = datetime.now(ph_tz).date()
    registered_today = reg_date == today

    # Vehicle details for the view modal
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
        "first_name": u.first_name or "—",
        "middle_name": u.middle_name or "",
        "last_name": u.last_name or "—",
        "email": u.email,
        "username": u.username,
        "role": u.role.value.title() if u.role else "Unknown",
        "idNumber": id_number,
        "status": u.status.value.title() if u.status else "Unknown",
        "registered_today": registered_today,
        "registered": u.created_at.astimezone(ph_tz).strftime("%b %d, %Y"),
        "last_login": last_login,
        "vehicle_count": len(u.vehicles) if u.vehicles else 0,
        "vehicles": vehicle_list,
        "is_active": u.status == AccountStatus.active,
        "avatar": initials,
        "roleClass": role_class.get(u.role, "role-default"),
        "badgeClass": role_colors.get(u.role, "badge-neutral"),
        # Extended details for view modal
        "phone": u.phone_number or "—",
        "address": u.address or "—",
        "sex": u.sex.value if u.sex else "—",
        "birth_date": u.birth_date.strftime("%b %d, %Y") if u.birth_date else "—",
        "nationality": u.nationality or "—",
        "department": u.department or u.staff_department or "—",
        "program": u.academic_program or "—",
        "year_level": u.year_level or "—",
        "section": u.section or "—",
        "position": u.position or u.job_title or "—",
        "employment_type": u.employment_type or u.employment_status or "—",
        "drivers_license": u.drivers_license_no or "—",
        "license_expiry": u.license_expiry_date.strftime("%b %d, %Y") if u.license_expiry_date else "—",
    }


@router.get("/users")
def admin_list_users(
    role: Optional[str] = Query(None, description="Filter: admin, student, faculty, ..."),
    status: Optional[str] = Query(None, description="Filter: active, inactive, pending, ..."),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = db.query(User).options(joinedload(User.vehicles))
    if role:
        try:
            r = UserRole(role.lower())
            q = q.filter(User.role == r)
        except ValueError:
            pass
    if status:
        try:
            s = AccountStatus(status.lower())
            q = q.filter(User.status == s)
        except ValueError:
            pass
            
    users = q.order_by(User.created_at.desc()).all()
    items = [_serialize_user(u) for u in users]

    def _get_stats(role_filter=None):
        filtered = [u for u in users if not role_filter or u.role == role_filter]
        today = datetime.now(timezone.utc).date()
        return {
            "count": len(filtered),
            "active": sum(1 for u in filtered if u.status == AccountStatus.active),
            "inactive": sum(1 for u in filtered if u.status != AccountStatus.active),
            "today": sum(1 for u in filtered if u.created_at.astimezone(timezone.utc).date() == today)
        }

    stats = {
        "total": _get_stats(),
        "students": _get_stats(UserRole.student),
        "faculty": _get_stats(UserRole.faculty),
        "staff": _get_stats(UserRole.staff),
        "security": _get_stats(UserRole.security),
    }

    return {"users": items, "stats": stats}


@router.patch("/users/{user_id}/toggle-status")
def admin_toggle_user_status(
    user_id: UUID,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Toggle a user's account status between active and inactive."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent admins from disabling themselves
    if user.id == admin_user.id:
        raise HTTPException(status_code=400, detail="You cannot disable your own account")

    # Toggle between active and inactive
    if user.status == AccountStatus.active:
        user.status = AccountStatus.inactive
    else:
        user.status = AccountStatus.active

    db.commit()
    db.refresh(user)

    return {
        "status": "success",
        "user": _serialize_user(user),
        "message": f"User {'disabled' if user.status == AccountStatus.inactive else 'enabled'} successfully",
    }


@router.get("/dashboard/summary")
def admin_dashboard_summary(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    from app.models.entry_log import EntryLog, EntryDirection
    from app.models.camera import Camera
    from app.models.gate import Gate
    from datetime import timedelta
    import zoneinfo

    ph_tz = zoneinfo.ZoneInfo("Asia/Manila")

    users = db.query(User).order_by(User.created_at.desc()).limit(4).all()
    vehicles_data = db.query(Vehicle).options(joinedload(Vehicle.owner)).order_by(Vehicle.created_at.desc()).limit(4).all()
    activity_logs = db.query(EntryLog).options(joinedload(EntryLog.vehicle)).order_by(EntryLog.timestamp.desc()).limit(5).all()

    # Calculate active residents
    total_users = db.query(User).count()
    student_count = db.query(User).filter(User.role == UserRole.student).count()
    faculty_count = db.query(User).filter(User.role == UserRole.faculty).count()
    staff_count = db.query(User).filter(User.role == UserRole.staff).count()
    security_count = db.query(User).filter(User.role == UserRole.security).count()

    total_vehicles = db.query(Vehicle).count()
    on_campus = db.query(Vehicle).filter(Vehicle.is_on_campus == True).count()

    # ---- Gate-level vehicle in/out counts (today) ----
    now_ph = datetime.now(ph_tz)
    today_start = now_ph.replace(hour=0, minute=0, second=0, microsecond=0)

    gate_rows = db.query(Gate).all()
    gate_map = {str(g.id): g.name.lower() for g in gate_rows}

    entered_main = 0
    exited_main = 0
    entered_back = 0
    exited_back = 0

    today_logs = (
        db.query(EntryLog)
        .filter(EntryLog.timestamp >= today_start)
        .all()
    )
    for el in today_logs:
        gid = str(el.gate_id) if el.gate_id else ""
        gname = gate_map.get(gid, "main")
        is_main = "main" in gname
        if el.direction == EntryDirection.entry:
            if is_main:
                entered_main += 1
            else:
                entered_back += 1
        elif el.direction == EntryDirection.exit:
            if is_main:
                exited_main += 1
            else:
                exited_back += 1

    # ---- Recent users mapped ----
    recent_users = [_serialize_user(u) for u in users]
    mapped_users = []
    for u in recent_users:
        mapped_users.append({
            "avatar": u["avatar"],
            "avatarClass": u["roleClass"],
            "primary": u["name"],
            "secondary": u["email"],
            "badge": u["role"],
            "badgeClass": u["badgeClass"]
        })

    # ---- Recent vehicles mapped ----
    mapped_vehicles = []
    for v in vehicles_data:
        sv = _serialize_vehicle(v)
        mapped_vehicles.append({
            "avatar": "🚗" if sv["type"] == "car" else "🏍️" if sv["type"] == "motorcycle" else "🚐",
            "avatarClass": "bg-success" if sv["status_raw"] == "approved" else "bg-warning",
            "primary": sv["plate"],
            "secondary": f"{sv['description']} • {sv['owner']}",
            "badge": sv["status"],
            "badgeClass": "badge-success" if sv["status_raw"] == "approved" else "badge-warning" if sv["status_raw"] == "pending" else "badge-danger"
        })

    # ---- Recent activity ----
    recent_activity = []
    for log in activity_logs:
        time_str = "Just now"
        if log.timestamp:
            time_str = log.timestamp.astimezone(ph_tz).strftime("%I:%M %p")
        plate = log.detected_plate_number or "Unknown"
        direction = log.direction.value if log.direction else "entry"
        recent_activity.append({
            "type": "vehicle",
            "text": f"{plate} — {direction.title()} detected",
            "time": time_str,
        })
    if not recent_activity:
        recent_activity.append({"type": "system", "text": "Dashboard successfully loaded", "time": "Just now"})

    # ---- Cameras with gate info ----
    db_cameras = db.query(Camera).options(joinedload(Camera.gate)).all()
    cameras_list = []
    for c in db_cameras:
        status_val = "online" if c.is_active and not c.offline_since else "offline"
        gate_label = c.gate.name if c.gate else "Main Gate"
        cameras_list.append({
            "id": str(c.id),
            "name": c.name,
            "status": status_val,
            "gate": gate_label,
        })
    # Fallback if no cameras in DB
    if not cameras_list:
        cameras_list = [
            {"id": "mock-1", "name": "Main Gate - Entry", "status": "online", "gate": "Main Gate"},
            {"id": "mock-2", "name": "Main Gate - Exit", "status": "online", "gate": "Main Gate"},
        ]

    # ---- Derived alerts ----
    alerts = []
    # 1) Offline cameras
    for cam in cameras_list:
        if cam["status"] == "offline":
            alerts.append({
                "id": f"cam-{cam['id']}",
                "type": "critical",
                "title": "Offline camera",
                "meta": f"{cam['gate']} - {cam['name']}",
            })
    # 2) Recent unregistered / violation entry logs (last 24h)
    yesterday = now_ph - timedelta(hours=24)
    anomaly_logs = (
        db.query(EntryLog)
        .filter(
            EntryLog.timestamp >= yesterday,
            EntryLog.authorization_status.in_(["unregistered", "blacklisted", "expired"]),
        )
        .order_by(EntryLog.timestamp.desc())
        .limit(10)
        .all()
    )
    for alog in anomaly_logs:
        auth = alog.authorization_status or "unregistered"
        atype = "critical" if auth == "blacklisted" else "warning"
        title = {
            "unregistered": "Unregistered vehicle",
            "blacklisted": "Blacklisted vehicle",
            "expired": "Expired registration",
        }.get(auth, "Anomaly detected")
        gate_label = "Unknown gate"
        if alog.gate:
            gate_label = alog.gate.name
        time_str = alog.timestamp.astimezone(ph_tz).strftime("%I:%M %p") if alog.timestamp else ""
        alerts.append({
            "id": f"log-{alog.id}",
            "type": atype,
            "title": title,
            "meta": f"{gate_label} • {time_str}",
        })

    # ---- Weekly traffic analytics (last 7 days) ----
    week_start = (now_ph - timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)
    weekly_logs = (
        db.query(EntryLog)
        .filter(EntryLog.timestamp >= week_start)
        .all()
    )
    # Bucket counts per day (0 = oldest day, 6 = today)
    day_buckets = [0] * 7
    weekly_entries = 0
    weekly_exits = 0
    for wl in weekly_logs:
        if wl.timestamp:
            ts_ph = wl.timestamp.astimezone(ph_tz)
            day_offset = (ts_ph.date() - week_start.date()).days
            if 0 <= day_offset < 7:
                day_buckets[day_offset] += 1
        if wl.direction == EntryDirection.entry:
            weekly_entries += 1
        elif wl.direction == EntryDirection.exit:
            weekly_exits += 1

    weekly_data = {
        "days": day_buckets,
        "entries": weekly_entries,
        "exits": weekly_exits,
        "onCampus": on_campus,
    }

    # Dashboard values
    return {
        "stats": {
            "users": {
                "total": total_users,
                "students": student_count,
                "faculty": faculty_count,
                "staff": staff_count,
                "security": security_count
            },
            "vehicles": {
                "total": total_vehicles,
                "on_campus": on_campus,
                "entered_main": entered_main,
                "exited_main": exited_main,
                "entered_back": entered_back,
                "exited_back": exited_back,
            }
        },
        "recentUsers": mapped_users,
        "recentVehicles": mapped_vehicles,
        "recentActivity": recent_activity,
        "cameras": cameras_list,
        "alerts": alerts,
        "weekly": weekly_data,
    }


@router.patch("/alerts/{alert_id}/resolve")
def admin_resolve_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Resolve a derived alert. Camera alerts clear offline_since; log alerts mark as acknowledged."""
    from app.models.camera import Camera
    from app.models.entry_log import EntryLog

    if alert_id.startswith("cam-"):
        cam_id = alert_id[4:]
        if cam_id.startswith("mock"):
            return {"status": "success", "detail": "Mock alert dismissed"}
        try:
            from uuid import UUID as _UUID
            cam_uuid = _UUID(cam_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid camera alert ID")
        cam = db.query(Camera).filter(Camera.id == cam_uuid).first()
        if not cam:
            raise HTTPException(status_code=404, detail="Camera not found")
        cam.offline_since = None
        cam.is_active = True
        db.commit()
        return {"status": "success", "detail": f"Camera '{cam.name}' marked online"}

    elif alert_id.startswith("log-"):
        log_id = alert_id[4:]
        try:
            from uuid import UUID as _UUID
            log_uuid = _UUID(log_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid log alert ID")
        entry = db.query(EntryLog).filter(EntryLog.id == log_uuid).first()
        if not entry:
            raise HTTPException(status_code=404, detail="Entry log not found")
        # Mark as acknowledged by clearing the violation flag
        entry.is_violation = False
        entry.requires_manual_verification = False
        entry.authorization_status = "resolved"
        db.commit()
        return {"status": "success", "detail": "Alert resolved"}

    raise HTTPException(status_code=400, detail="Unknown alert ID format")

@router.get("/cameras")
def admin_list_cameras(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    from app.models.camera import Camera
    cams = db.query(Camera).order_by(Camera.created_at.desc()).all()
    
    # If no cameras exist, let's provision some mock ones directly into the database or rely on frontend mock?
    # Better to return what is in the DB.
    items = []
    for c in cams:
        status_val = "online" if c.is_active and not c.offline_since else "offline"
        off_since = c.offline_since.strftime("%I:%M %p") if c.offline_since else None
        
        gate_name = c.gate.name if (hasattr(c, 'gate') and c.gate) else "Main Gate"
        
        items.append({
            "id": str(c.id),
            "name": c.name,
            "gate": gate_name,
            "position": c.position or "Front",
            "status": status_val,
            "isLive": bool(c.is_streaming),
            "lastPlate": c.last_plate_detected or "—",
            "offlineSince": off_since
        })
        
    return {"cameras": items}

@router.get("/logs")
def admin_list_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    duty_station: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Paginated system audit logs — tracks human actions, NOT vehicle traffic."""
    from sqlalchemy import desc, text
    import zoneinfo

    ph_tz = zoneinfo.ZoneInfo("Asia/Manila")

    # Build filter conditions
    conditions = []
    params = {"offset": (page - 1) * limit, "limit": limit}

    if search:
        conditions.append("(sl.action ILIKE :search OR sl.details::text ILIKE :search OR u.full_name ILIKE :search)")
        params["search"] = f"%{search}%"
    
    if category:
        conditions.append("sl.category = :category")
        params["category"] = category.lower()

    if duty_station:
        conditions.append("ss.assigned_post ILIKE :duty_station")
        params["duty_station"] = f"%{duty_station}%"
    
    if start_date:
        conditions.append("sl.created_at::date >= :start_date")
        params["start_date"] = start_date
        
    if end_date:
        conditions.append("sl.created_at::date <= :end_date")
        params["end_date"] = end_date

    where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""

    # Count total with filters
    count_sql = f"""
        SELECT COUNT(*)::int AS c 
        FROM system_logs sl
        LEFT JOIN users u ON sl.actor_id = u.id
        LEFT JOIN security_shifts ss ON u.id = ss.user_id AND ss.is_active = true
        {where_clause}
    """
    total_row = db.execute(text(count_sql), params).mappings().first()
    total = int(total_row["c"]) if total_row else 0
    total_pages = max(1, (total + limit - 1) // limit)

    # Main query
    query_sql = f"""
        SELECT
            sl.id,
            sl.action,
            sl.category,
            sl.details,
            sl.ip_address,
            sl.created_at,
            u.full_name AS actor_name,
            u.role AS actor_role,
            ss.assigned_post AS duty_station
        FROM system_logs sl
        LEFT JOIN users u ON sl.actor_id = u.id
        LEFT JOIN security_shifts ss ON u.id = ss.user_id AND ss.is_active = true
        {where_clause}
        ORDER BY sl.created_at DESC
        OFFSET :offset LIMIT :limit
    """
    rows = db.execute(text(query_sql), params).mappings().all()

    # Map action strings to human-readable labels
    ACTION_LABELS = {
        "alert.dismissed": ("Alert", "Anomaly alert dismissed", "badge-warning"),
        "alert.escalated": ("Escalation", "Alert escalated to admin", "badge-danger"),
        "alert.resolved": ("Resolution", "Alert resolved", "badge-success"),
        "vehicle.approved": ("Approval", "Vehicle registration approved", "badge-success"),
        "vehicle.rejected": ("Rejection", "Vehicle registration rejected", "badge-danger"),
        "vehicle.blacklisted": ("Blacklist", "Vehicle blacklisted", "badge-danger"),
        "vehicle_count.reset_on_campus": ("Reset", "On-campus vehicle count reset", "badge-warning"),
        "user.created": ("Account", "New user account created", "badge-info"),
        "user.suspended": ("Suspension", "User account suspended", "badge-danger"),
        "user.login": ("Login", "User logged in", "badge-info"),
        "settings.updated": ("Config", "System settings updated", "badge-secondary"),
    }

    items = []
    for row in rows:
        time_str = "—"
        date_str = "—"
        if row["created_at"]:
            ts = row["created_at"].astimezone(ph_tz)
            time_str = ts.strftime("%I:%M:%S %p")
            date_str = ts.strftime("%b %d, %Y")

        action_key = row["action"] or ""
        label_info = ACTION_LABELS.get(action_key)

        if label_info:
            cat_label, description, badge_class = label_info
        else:
            parts = action_key.split(".")
            cat_label = parts[0].title() if parts else "System"
            description = action_key.replace(".", " → ").replace("_", " ").title()
            if "alert" in action_key.lower():
                badge_class = "badge-warning"
            elif "user" in action_key.lower() or "vehicle" in action_key.lower():
                badge_class = "badge-info"
            else:
                badge_class = "badge-secondary"

        # Extract useful detail from JSONB
        details = row["details"] or {}
        detail_summary = ""
        if isinstance(details, dict):
            if "old_plate" in details and "new_plate" in details:
                detail_summary = f"Plate corrected: {details['old_plate']} → {details['new_plate']}"
            elif "plate" in details:
                detail_summary = f"Plate: {details['plate']}"
            elif "anomaly_id" in details:
                detail_summary = f"Anomaly Ref: {str(details['anomaly_id'])[:8]}"
            elif "vehicle_id" in details:
                detail_summary = f"Vehicle Ref: {str(details['vehicle_id'])[:8]}"
            elif "cleared_rows" in details:
                detail_summary = f"{details['cleared_rows']} vehicles cleared"

        actor_name = row["actor_name"] or "System"
        actor_role = row["actor_role"] or "system"
        if isinstance(actor_role, str):
            actor_role = actor_role.title()

        items.append({
            "id": str(row["id"]),
            "time": time_str,
            "date": date_str,
            "category": cat_label,
            "badgeClass": badge_class,
            "description": description,
            "detail": detail_summary,
            "details_raw": details,
            "actor": actor_name,
            "actorRole": actor_role,
            "action": action_key,
            "duty_station": row["duty_station"] or "—",
            "ip": row["ip_address"] or "—"
        })

    # Summary Stats for Dashboard Cards
    stats_sql = """
        SELECT 
            COUNT(*)::int as total,
            COUNT(CASE WHEN action LIKE 'alert%' AND created_at > NOW() - INTERVAL '24 hours' THEN 1 END)::int as alerts_24h,
            COUNT(CASE WHEN action IN ('alert.resolved', 'vehicle.approved') THEN 1 END)::int as resolutions,
            COUNT(CASE WHEN action LIKE 'vehicle.%' OR action LIKE 'user.%' THEN 1 END)::int as security_actions
        FROM system_logs
    """
    stats_row = db.execute(text(stats_sql)).mappings().first()
    summary_stats = {
        "total": stats_row["total"] if stats_row else 0,
        "alerts_24h": stats_row["alerts_24h"] if stats_row else 0,
        "resolutions": stats_row["resolutions"] if stats_row else 0,
        "security_actions": stats_row["security_actions"] if stats_row else 0
    }

    return {
        "logs": items,
        "summary_stats": summary_stats,
        "pagination": {
            "total_items": total,
            "total_pages": total_pages,
            "current_page": page,
            "items_per_page": limit,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
    }


from pydantic import BaseModel
class PasswordVerifyRequest(BaseModel):
    password: str

@router.post("/verify-password")
def verify_admin_password(
    data: PasswordVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    from app.utils.security import verify_password
    if not verify_password(data.password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {"success": True}


@router.get("/entry-logs")
def admin_entry_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=5000),
    search: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    direction: Optional[str] = Query(None),
    gate: Optional[str] = Query(None),
    vehicle_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Paginated entry-exit logs for the admin Entry-Exit Logs page."""
    from app.models.entry_log import EntryLog, EntryDirection
    from sqlalchemy import desc, or_
    from datetime import timezone as tz

    q = db.query(EntryLog).options(joinedload(EntryLog.vehicle).joinedload(Vehicle.owner), joinedload(EntryLog.gate))

    if search:
        q = q.filter(EntryLog.detected_plate_number.ilike(f"%{search}%"))

    if gate:
        q = q.filter(EntryLog.gate.has(name=gate))

    if vehicle_type:
        # Match using the vehicle enum if vehicle_type is provided.
        # Ensure we're querying vehicles correctly.
        # "Others" should mean not car, motorcycle, van, truck or simply vehicle_type logic.
        if vehicle_type.lower() == "others":
            q = q.filter(~EntryLog.vehicle.has(Vehicle.type.in_([VehicleType.car, VehicleType.motorcycle, VehicleType.van, VehicleType.truck])))
        else:
            try:
                vt = VehicleType(vehicle_type.lower())
                q = q.filter(EntryLog.vehicle.has(type=vt))
            except ValueError:
                pass

    if direction:
        if direction.lower() == "entry":
            q = q.filter(EntryLog.direction == EntryDirection.entry)
        elif direction.lower() == "exit":
            q = q.filter(EntryLog.direction == EntryDirection.exit)

    if type:
        if type == "Entry":
            q = q.filter(EntryLog.direction == EntryDirection.entry)
        elif type == "Exit":
            q = q.filter(EntryLog.direction == EntryDirection.exit)
        elif type == "Breach":
            q = q.filter(or_(
                EntryLog.authorization_status.ilike("%breach%"),
                EntryLog.authorization_status.in_(["blacklisted", "expired", "rejected"])
            ))
        elif type == "Anomaly":
            q = q.filter(or_(
                EntryLog.authorization_status.ilike("%anomaly%"),
                EntryLog.authorization_status == "unregistered"
            ))

    total = q.count()
    total_pages = max(1, (total + limit - 1) // limit)
    offset = (page - 1) * limit

    logs = (
        q.order_by(desc(EntryLog.timestamp))
        .offset(offset)
        .limit(limit)
        .all()
    )

    import zoneinfo
    ph_tz = zoneinfo.ZoneInfo("Asia/Manila")

    items = []
    for log in logs:
        time_str = "—"
        date_str = "—"
        if log.timestamp:
            ts = log.timestamp.astimezone(ph_tz)
            time_str = ts.strftime("%I:%M:%S %p")
            date_str = ts.strftime("%b %d, %Y")

        # Determine display type from direction
        dir_val = log.direction.value if hasattr(log.direction, 'value') else str(log.direction) if log.direction else "entry"
        type_str = dir_val.title()  # "Entry" or "Exit"

        status_str = "Authorized"
        status_class = "badge-success"
        owner_name = "—"

        # Map authorization_status to Category and Status
        auth_status = log.authorization_status or ""

        if log.vehicle:
            if log.vehicle.owner:
                owner_name = log.vehicle.owner.full_name or log.vehicle.owner.username

        if auth_status == "access" or auth_status == "authorized":
            status_str = "Authorized"
            status_class = "badge-success"
            # type_str remains "Entry"/"Exit" from logic above
        elif "breach" in auth_status:
            type_str = "Breach"
            status_class = "badge-danger"
            if "blacklisted" in auth_status: status_str = "Blacklisted"
            elif "expired" in auth_status: status_str = "Expired"
            elif "rejected" in auth_status: status_str = "Rejected"
            else: status_str = "Flagged"
        elif "anomaly" in auth_status or auth_status == "unregistered":
            type_str = "Anomaly"
            status_class = "badge-warning"
            status_str = "Unregistered"
        else:
            # Fallback for older logs or edge cases
            if log.vehicle and log.vehicle.status.value == "blacklisted":
                status_str = "Blacklisted"
                status_class = "badge-danger"
                type_str = "Breach"
            elif log.vehicle and log.vehicle.status.value == "expired":
                status_str = "Expired"
                status_class = "badge-danger"
                type_str = "Breach"
            elif not log.vehicle:
                status_str = "Unregistered"
                status_class = "badge-warning"
                type_str = "Anomaly"

        # Calculate frequency for this specific plate (how many times it appears in the system)
        frequency = db.query(func.count(EntryLog.id)).filter(EntryLog.detected_plate_number == log.detected_plate_number).scalar()

        # Get owner details
        owner_name = "Unknown"
        owner_role = "Unknown"
        vehicle_type = "Unknown"
        owner_id_number = "—"
        owner_status = "Active"
        if log.vehicle:
            vehicle_type = log.vehicle.type.value.title() if log.vehicle.type else "Car"
            if log.vehicle.owner:
                owner = log.vehicle.owner
                owner_name = owner.full_name or owner.username
                owner_role = owner.role.value.title() if owner.role else "Unknown"
                owner_status = owner.status.value.title() if owner.status else "Active"
                if owner.role.value == "student" and owner.student_id:
                    owner_id_number = owner.student_id
                elif owner.role.value == "faculty" and owner.faculty_id:
                    owner_id_number = owner.faculty_id
                elif owner.role.value == "staff" and owner.staff_id:
                    owner_id_number = owner.staff_id
                elif owner.role.value == "security" and owner.staff_id:
                    owner_id_number = owner.staff_id
                else:
                    owner_id_number = owner.staff_id or owner.student_id or owner.faculty_id or "—"

        gate_name = log.gate.name if log.gate else "Main Gate"

        items.append({
            "id": str(log.id),
            "time": time_str,
            "date": date_str,
            "type": type_str,
            "plate": log.detected_plate_number or "—",
            "camera": gate_name,
            "gate_name": gate_name,
            "gate_id": str(log.gate_id) if log.gate_id else None,
            "status": status_str,
            "statusClass": status_class,
            "owner": owner_name,
            "owner_name": owner_name,
            "owner_role": owner_role,
            "owner_id_number": owner_id_number,
            "owner_status": owner_status,
            "shift": "Day",
            "vehicle_type": vehicle_type,
            "frequency": frequency,
            "direction": dir_val,
            "snapshot_url": log.snapshot_image_url
        })

    return {
        "logs": items,
        "pagination": {
            "total_items": total,
            "total_pages": total_pages,
            "current_page": page,
            "items_per_page": limit,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
    }

@router.get("/search")
def global_system_search(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Global search for the admin dashboard.
    Searches Users, Vehicles, and EntryLogs simultaneously.
    """
    query = f"%{q}%"
    
    # 1. Search Users
    users_q = db.query(User).filter(
        or_(
            User.full_name.ilike(query),
            User.email.ilike(query),
            User.student_id.ilike(query),
            User.faculty_id.ilike(query),
            User.staff_id.ilike(query)
        )
    ).limit(10).all()

    users_res = []
    for u in users_q:
        users_res.append({
            "id": str(u.id),
            "name": u.full_name,
            "email": u.email,
            "role": u.role.value,
            "path": f"/admin/users?search={u.email}"
        })

    # 2. Search Vehicles
    vehicles_q = db.query(Vehicle).options(joinedload(Vehicle.owner)).filter(
        Vehicle.plate_number.ilike(query)
    ).limit(10).all()

    vehicles_res = []
    for v in vehicles_q:
        owner_name = v.owner.full_name if v.owner else "Unknown"
        vehicles_res.append({
            "id": str(v.id),
            "plate_number": v.plate_number,
            "type": v.type.value if v.type else "Unknown",
            "owner": owner_name,
            "path": f"/admin/vehicles?search={v.plate_number}"
        })

    # 3. Search Entry Logs
    logs_q = db.query(EntryLog).options(joinedload(EntryLog.vehicle)).filter(
        EntryLog.detected_plate_number.ilike(query)
    ).order_by(EntryLog.timestamp.desc()).limit(10).all()

    logs_res = []
    for l in logs_q:
        timestamp_str = l.timestamp.astimezone(timezone.utc).strftime("%Y-%m-%d %I:%M %p") if l.timestamp else "—"
        logs_res.append({
            "id": str(l.id),
            "plate_number": l.detected_plate_number,
            "direction": l.direction.value if l.direction else "entry",
            "timestamp": timestamp_str,
            "path": f"/admin/entry-logs?search={l.detected_plate_number}"
        })

    return {
        "users": users_res,
        "vehicles": vehicles_res,
        "logs": logs_res
    }

