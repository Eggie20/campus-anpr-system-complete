from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text, desc
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Any
import zoneinfo

from app.utils.database import get_db
from app.utils.security import require_admin
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle, VehicleType
from app.models.entry_log import EntryLog, EntryDirection
from app.models.anpr import AnprAnomalyEvent

router = APIRouter()
PH_TZ = zoneinfo.ZoneInfo("Asia/Manila")

@router.get("/stats")
def get_analytics_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Returns top-level KPI cards with percentage changes.
    """
    now = datetime.now(PH_TZ)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_start = today_start - timedelta(days=1)
    
    def get_period_counts(start, end):
        return {
            "in": db.query(EntryLog).filter(EntryLog.timestamp >= start, EntryLog.timestamp < end, EntryLog.direction == EntryDirection.entry).count(),
            "out": db.query(EntryLog).filter(EntryLog.timestamp >= start, EntryLog.timestamp < end, EntryLog.direction == EntryDirection.exit).count(),
            "anomalies": db.query(AnprAnomalyEvent).filter(AnprAnomalyEvent.created_at >= start, AnprAnomalyEvent.created_at < end).count()
        }

    today_stats = get_period_counts(today_start, now + timedelta(days=1))
    yesterday_stats = get_period_counts(yesterday_start, today_start)
    
    def calc_change(curr, prev):
        if prev == 0: return 0
        return round(((curr - prev) / prev) * 100, 1)

    on_campus = db.query(Vehicle).filter(Vehicle.is_on_campus == True).count()
    
    # Gate breakdowns for Today
    gate_stats = db.execute(text("""
        SELECT g.name as gate, e.direction, COUNT(*) as count
        FROM entry_logs e
        JOIN gates g ON e.gate_id = g.id
        WHERE e.timestamp >= :start
        GROUP BY g.name, e.direction
    """), {"start": today_start}).mappings().all()
    
    gates = {}
    for row in gate_stats:
        g = row["gate"]
        if g not in gates: gates[g] = {"in": 0, "out": 0}
        gates[g]["in" if row["direction"] == "entry" else "out"] = row["count"]

    return {
        "vehiclesIn": {
            "value": today_stats["in"],
            "change": calc_change(today_stats["in"], yesterday_stats["in"]),
            "breakdown": [{"label": g, "value": v["in"]} for g, v in gates.items()]
        },
        "vehiclesOut": {
            "value": today_stats["out"],
            "change": calc_change(today_stats["out"], yesterday_stats["out"]),
            "breakdown": [{"label": g, "value": v["out"]} for g, v in gates.items()]
        },
        "onCampusNow": {
            "value": on_campus,
            "status": "Live",
            "breakdown": [] # Could add gate-specific "last seen" counts if tracked
        },
        "avgTime": {
            "value": "2.4h", # Placeholder until complex duration logic implemented
            "subtext": "Per visit"
        },
        "anomalyAlerts": {
            "value": today_stats["anomalies"],
            "change": calc_change(today_stats["anomalies"], yesterday_stats["anomalies"]),
            "breakdown": [
                {"label": "Unregistered", "value": db.query(AnprAnomalyEvent).filter(AnprAnomalyEvent.created_at >= today_start, AnprAnomalyEvent.kind == 'anomaly_unregistered').count()},
                {"label": "Other", "value": db.query(AnprAnomalyEvent).filter(AnprAnomalyEvent.created_at >= today_start, AnprAnomalyEvent.kind != 'anomaly_unregistered').count()}
            ]
        }
    }

@router.get("/temporal")
def get_temporal_flow(
    days: int = 7,
    vehicle_type: Optional[str] = None,
    user_role: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Returns time-series data for the traffic flow chart.
    """
    now = datetime.now(PH_TZ)
    start_date = (now - timedelta(days=days-1)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    labels = []
    in_data = []
    out_data = []
    
    for i in range(days):
        d = start_date + timedelta(days=i)
        next_d = d + timedelta(days=1)
        labels.append(d.strftime("%a"))
        
        in_query = db.query(EntryLog).filter(EntryLog.timestamp >= d, EntryLog.timestamp < next_d, EntryLog.direction == EntryDirection.entry)
        out_query = db.query(EntryLog).filter(EntryLog.timestamp >= d, EntryLog.timestamp < next_d, EntryLog.direction == EntryDirection.exit)

        if vehicle_type:
            in_query = in_query.join(Vehicle).filter(func.lower(Vehicle.type) == vehicle_type.lower())
            out_query = out_query.join(Vehicle).filter(func.lower(Vehicle.type) == vehicle_type.lower())
        
        if user_role:
            in_query = in_query.join(User).filter(func.lower(User.role) == user_role.lower())
            out_query = out_query.join(User).filter(func.lower(User.role) == user_role.lower())
        
        in_data.append(in_query.count())
        out_data.append(out_query.count())
        
    return {
        "labels": labels,
        "datasets": [
            {"label": "Vehicles In", "data": in_data, "color": "#3b82f6"},
            {"label": "Vehicles Out", "data": out_data, "color": "#f43f5e"}
        ]
    }

@router.get("/distributions")
def get_distributions(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Returns categorical and demographic distributions.
    """
    # Category Distribution (Vehicle Types)
    v_total = db.query(Vehicle).count()
    v_types_query = db.execute(text("SELECT type, COUNT(*) as count FROM vehicles GROUP BY type")).mappings().all()
    
    v_type_counts = {v_type.value: 0 for v_type in VehicleType}
    for r in v_types_query:
        if r["type"] in v_type_counts:
            v_type_counts[r["type"]] = r["count"]
            
    cat_dist = []
    for type_name, count in v_type_counts.items():
        perc = round((count / v_total * 100), 1) if v_total > 0 else 0
        cat_dist.append({"label": type_name.title(), "percentage": perc, "count": count})
        
    # Resident Demographic (User Roles)
    u_total = db.query(User).count()
    u_roles_query = db.execute(text("SELECT role, COUNT(*) as count FROM users GROUP BY role")).mappings().all()
    
    u_role_counts = {role.value: 0 for role in UserRole}
    for r in u_roles_query:
        if r["role"] in u_role_counts:
            u_role_counts[r["role"]] = r["count"]
            
    demo_dist = []
    for role_name, count in u_role_counts.items():
        perc = round((count / u_total * 100), 1) if u_total > 0 else 0
        demo_dist.append({"label": role_name.title(), "percentage": perc, "count": count})
        
    return {
        "categorical": cat_dist,
        "demographic": demo_dist
    }

@router.get("/peak-profile")
def get_peak_profile(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Returns occupancy grouped by 2-hour intervals for Today.
    """
    now = datetime.now(PH_TZ)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    intervals = [
        ("6-8AM", 6, 8),
        ("8-10AM", 8, 10),
        ("10-12PM", 10, 12),
        ("12-2PM", 12, 14),
        ("2-4PM", 14, 16),
        ("4-6PM", 16, 18),
    ]
    
    results = []
    max_val = 0
    peak_label = ""
    
    for label, start_h, end_h in intervals:
        start_dt = today_start + timedelta(hours=start_h)
        end_dt = today_start + timedelta(hours=end_h)
        
        count = db.query(EntryLog).filter(EntryLog.timestamp >= start_dt, EntryLog.timestamp < end_dt, EntryLog.direction == EntryDirection.entry).count()
        
        # Split by gate
        gate_split = db.execute(text("""
            SELECT g.name as gate, COUNT(*) as count
            FROM entry_logs e
            JOIN gates g ON e.gate_id = g.id
            WHERE e.timestamp >= :start AND e.timestamp < :end AND e.direction = 'entry'
            GROUP BY g.name
        """), {"start": start_dt, "end": end_dt}).mappings().all()
        
        split_str = " · ".join([f"{r['gate'][0].upper()}:{r['count']}" for r in gate_split]) or "No activity"
        
        if count > max_val:
            max_val = count
            peak_label = label
            
        results.append({
            "label": label,
            "val": count,
            "split": split_str,
            "peak": False # Updated after loop
        })
        
    for r in results:
        if r["label"] == peak_label and max_val > 0:
            r["peak"] = True
            
    return {
        "intervals": results,
        "summary": f"Dynamic peak detected at {peak_label} interval." if peak_label else "No significant peak detected yet."
    }

@router.get("/top-vehicles")
def get_top_vehicles(
    days: int = 7,
    limit: int = 10,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Returns top N most active vehicles in the given time period.
    """
    now = datetime.now(PH_TZ)
    start_date = (now - timedelta(days=days-1)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Query logs grouped by plate number
    top_vehicles_query = db.execute(text("""
        SELECT 
            e.detected_plate_number as plate,
            u.full_name as owner_name,
            u.role as owner_role,
            v.type as vehicle_type,
            COUNT(*) as activity_count
        FROM entry_logs e
        LEFT JOIN vehicles v ON e.vehicle_id = v.id
        LEFT JOIN users u ON v.user_id = u.id
        WHERE e.timestamp >= :start
        GROUP BY e.detected_plate_number, u.full_name, u.role, v.type
        ORDER BY activity_count DESC
        LIMIT :limit
    """), {"start": start_date, "limit": limit}).mappings().all()
    
    results = []
    for r in top_vehicles_query:
        results.append({
            "plate": r["plate"],
            "owner_name": r["owner_name"] or "Unregistered",
            "owner_role": r["owner_role"] or "Unknown",
            "vehicle_type": str(r["vehicle_type"]) if r["vehicle_type"] else "Unknown",
            "activity_count": r["activity_count"]
        })
        
    return results
