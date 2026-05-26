import os
import sys
import random
import json
from datetime import datetime, timedelta, timezone
import uuid

# Add the parent directory to sys.path to allow imports from 'app'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.utils.database import SessionLocal
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle, VehicleType, VehicleStatus
from app.models.entry_log import EntryLog, EntryDirection, LogCategory
from app.models.gate import Gate
from app.models.anpr import AnprPlateCapture, AnprAnomalyEvent, AnprAlertKind

def seed_analytics():
    db = SessionLocal()
    try:
        print("Cleaning up old analytics seed data...")
        # Optional: clear existing logs to start fresh
        # db.execute(text("TRUNCATE TABLE entry_logs, anpr_plate_captures, anpr_anomaly_events, system_logs CASCADE"))
        
        # Ensure we have gates
        gates = db.query(Gate).all()
        if not gates:
            gate_main = Gate(name="Main Gate")
            gate_back = Gate(name="Back Gate")
            db.add_all([gate_main, gate_back])
            db.flush()
            gates = [gate_main, gate_back]
            print("Created gates.")

        # Get some vehicles and users for context
        vehicles = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.approved).all()
        if not vehicles:
            print("No approved vehicles found. Please run the main system seeder first.")
            return

        users = db.query(User).all()
        admin_user = db.query(User).filter(User.role == UserRole.admin).first()
        security_user = db.query(User).filter(User.role == UserRole.security).first()

        now = datetime.now(timezone.utc)
        print(f"Generating traffic logs for the past 30 days...")

        logs_to_add = []
        captures_to_add = []
        
        # Generate ~600 Traffic Logs
        for day_offset in range(30):
            current_day = now - timedelta(days=day_offset)
            
            # More traffic on weekdays, less on weekends
            is_weekend = current_day.weekday() >= 5
            logs_count = random.randint(5, 15) if is_weekend else random.randint(20, 40)
            
            for _ in range(logs_count):
                # Peak hours logic
                hour = random.choices(
                    range(24),
                    weights=[1,1,1,1,1,2,8,12,10,6,5,4,5,6,8,12,10,4,2,1,1,1,1,1] # Morning/Afternoon peaks
                )[0]
                
                log_time = current_day.replace(hour=hour, minute=random.randint(0, 59), second=random.randint(0, 59))
                
                vehicle = random.choice(vehicles)
                gate = random.choice(gates)
                direction = random.choice([EntryDirection.entry, EntryDirection.exit])
                
                log = EntryLog(
                    detected_plate_number=vehicle.plate_number,
                    vehicle_id=vehicle.id,
                    user_id=vehicle.user_id,
                    direction=direction,
                    category=LogCategory.entry if direction == EntryDirection.entry else LogCategory.exit,
                    confidence_score=random.uniform(85.0, 99.9),
                    authorization_status="access",
                    gate_id=gate.id,
                    timestamp=log_time
                )
                logs_to_add.append(log)
                
                # Associated capture
                cap = AnprPlateCapture(
                    plate_normalized=vehicle.plate_number,
                    plate_raw=vehicle.plate_number,
                    confidence_score=log.confidence_score,
                    brand=vehicle.brand,
                    color=vehicle.color,
                    vehicle_type_detected=vehicle.type.value if vehicle.type else "car",
                    gate_id=gate.id,
                    vehicle_id=vehicle.id,
                    alert_kind=AnprAlertKind.access,
                    created_at=log_time
                )
                captures_to_add.append(cap)

        db.add_all(logs_to_add)
        db.add_all(captures_to_add)
        db.commit()
        print(f"Successfully seeded {len(logs_to_add)} traffic logs.")

        # Generate System Audit Logs
        print("Generating system audit logs...")
        from sqlalchemy import text
        
        audit_events = [
            ("user.login", "system", "Login session started"),
            ("vehicle.approved", "system", "New vehicle registration approved"),
            ("alert.resolved", "alert", "Anomaly alert resolved by security"),
            ("alert.dismissed", "alert", "Minor mismatch alert dismissed"),
            ("settings.updated", "system", "System security parameters updated"),
        ]
        
        for _ in range(150):
            event_type, category, desc = random.choice(audit_events)
            actor = random.choice([admin_user, security_user]) if admin_user and security_user else None
            event_time = now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
            
            db.execute(
                text("INSERT INTO system_logs (actor_id, action, category, details, created_at, ip_address) "
                     "VALUES (CAST(:actor_id AS uuid), :action, :category, CAST(:details AS jsonb), :ts, :ip)"),
                {
                    "actor_id": str(actor.id) if actor else None,
                    "action": event_type,
                    "category": category.lower(),
                    "details": json.dumps({"description": desc, "simulated": True}),
                    "ts": event_time,
                    "ip": f"192.168.1.{random.randint(10, 254)}"
                }
            )
        
        db.commit()
        print("Successfully seeded system audit logs.")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_analytics()
