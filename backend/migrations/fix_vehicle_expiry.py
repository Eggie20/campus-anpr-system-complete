"""
Migration: Fix NULL expiry_date on existing vehicles.
Sets expiry_date = registration_date + 365 days for all vehicles
that currently have no expiry date set.

Run from the backend directory:
    venv\Scripts\python.exe migrations/fix_vehicle_expiry.py
"""

import sys
import os
from datetime import timedelta

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from app.utils.database import SessionLocal
from app.models.vehicle import Vehicle


def run():
    db = SessionLocal()
    try:
        vehicles = db.query(Vehicle).filter(Vehicle.expiry_date.is_(None)).all()
        print(f"[FIX] Found {len(vehicles)} vehicles with NULL expiry_date")

        for v in vehicles:
            reg = v.registration_date or v.created_at
            if reg:
                v.expiry_date = reg + timedelta(days=365)
                print(f"  > {v.plate_number}: expiry set to {v.expiry_date.strftime('%b %d, %Y')}")
            else:
                print(f"  ! {v.plate_number}: no registration_date or created_at, skipping")

        db.commit()
        print(f"\n[DONE] Updated {len(vehicles)} vehicles with 12-month rolling expiry.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Migration failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    run()
