"""
Seed script for Anomalies.
Run from the backend directory:
    venv\Scripts\python.exe seed_anomalies.py
"""

import sys
import os
import uuid
from datetime import datetime, timedelta

# Force UTF-8 on Windows terminal
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.utils.database import SessionLocal
from app.models.anpr import AnprPlateCapture, AnprAnomalyEvent, AnprAlertKind
from app.models.gate import Gate
from app.models.vehicle import Vehicle

def run():
    db = SessionLocal()
    try:
        print("[SEED] Seeding anomalies...")
        
        # Get some existing data
        gate = db.query(Gate).filter(Gate.name == "Main Gate").first()
        gate_back = db.query(Gate).filter(Gate.name == "Back Gate").first()
        
        if not gate:
            print("No gates found. Please run seed_dummy_data.py first.")
            return
            
        now = datetime.utcnow()
        
        # 1. Unregistered Vehicle
        cap1 = AnprPlateCapture(
            id=uuid.uuid4(),
            plate_normalized="UNR1234",
            plate_raw="UNR 1234",
            confidence_score=85.5,
            brand="Toyota",
            color="Silver",
            vehicle_type_detected="car",
            gate_id=gate.id,
            alert_kind=AnprAlertKind.anomaly_unregistered,
            created_at=now - timedelta(hours=1)
        )
        db.add(cap1)
        db.flush()
        
        ev1 = AnprAnomalyEvent(
            id=uuid.uuid4(),
            capture_id=cap1.id,
            kind=AnprAlertKind.anomaly_unregistered,
            status="open",
            tags=["Unregistered", "Unknown"],
            created_at=now - timedelta(hours=1)
        )
        db.add(ev1)
        
        # 2. Low Confidence Read
        cap2 = AnprPlateCapture(
            id=uuid.uuid4(),
            plate_normalized="LOW5678",
            plate_raw="LOW 5678",
            confidence_score=45.2,
            brand="Mitsubishi",
            color="Black",
            vehicle_type_detected="van",
            gate_id=gate_back.id if gate_back else gate.id,
            alert_kind=AnprAlertKind.anomaly_low_confidence,
            created_at=now - timedelta(hours=3)
        )
        db.add(cap2)
        db.flush()
        
        ev2 = AnprAnomalyEvent(
            id=uuid.uuid4(),
            capture_id=cap2.id,
            kind=AnprAlertKind.anomaly_low_confidence,
            status="resolved",
            tags=["Blurry", "Night"],
            notes="Manually verified by guard.",
            created_at=now - timedelta(hours=3)
        )
        db.add(ev2)
        
        # 3. Rapid Movement
        vehicle = db.query(Vehicle).filter(Vehicle.plate_number == "CAR 9610").first()
        cap3 = AnprPlateCapture(
            id=uuid.uuid4(),
            plate_normalized="CAR9610",
            plate_raw="CAR 9610",
            confidence_score=98.1,
            brand="Honda",
            color="Red",
            vehicle_type_detected="car",
            gate_id=gate.id,
            vehicle_id=vehicle.id if vehicle else None,
            alert_kind=AnprAlertKind.anomaly_rapid_movement,
            created_at=now - timedelta(minutes=45)
        )
        db.add(cap3)
        db.flush()
        
        ev3 = AnprAnomalyEvent(
            id=uuid.uuid4(),
            capture_id=cap3.id,
            kind=AnprAlertKind.anomaly_rapid_movement,
            status="open",
            tags=["Speeding", "Tailgating"],
            created_at=now - timedelta(minutes=45)
        )
        db.add(ev3)
        
        # 4. Frequent Unregistered
        cap4 = AnprPlateCapture(
            id=uuid.uuid4(),
            plate_normalized="FREQ999",
            plate_raw="FREQ 999",
            confidence_score=92.0,
            brand="Nissan",
            color="White",
            vehicle_type_detected="truck",
            gate_id=gate.id,
            alert_kind=AnprAlertKind.anomaly_frequent_unregistered,
            created_at=now - timedelta(days=1)
        )
        db.add(cap4)
        db.flush()
        
        ev4 = AnprAnomalyEvent(
            id=uuid.uuid4(),
            capture_id=cap4.id,
            kind=AnprAlertKind.anomaly_frequent_unregistered,
            status="escalated",
            tags=["Frequent", "Delivery?"],
            created_at=now - timedelta(days=1)
        )
        db.add(ev4)
        
        db.commit()
        print("[OK] 4 anomalies seeded successfully.")
        
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seed failed: {e}")
        import traceback; traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    run()
