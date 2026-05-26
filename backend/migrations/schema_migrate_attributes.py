import sys
import os

sys.path.append(os.path.dirname(__file__))

from app.utils.database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        with conn.begin():
            # Rename make to brand in vehicles
            print("Renaming make to brand in vehicles...")
            conn.execute(text("ALTER TABLE vehicles RENAME COLUMN make TO brand;"))
            
            # Drop unused columns in vehicles
            print("Dropping unused columns in vehicles...")
            conn.execute(text("ALTER TABLE vehicles DROP COLUMN IF EXISTS model;"))
            conn.execute(text("ALTER TABLE vehicles DROP COLUMN IF EXISTS year;"))
            conn.execute(text("ALTER TABLE vehicles DROP COLUMN IF EXISTS engine_number;"))
            conn.execute(text("ALTER TABLE vehicles DROP COLUMN IF EXISTS registration_proof_url;"))
            
            # Rename make to brand in visitor_vehicles and drop model
            print("Renaming make to brand in visitor_vehicles...")
            conn.execute(text("ALTER TABLE visitor_vehicles RENAME COLUMN make TO brand;"))
            print("Dropping model from visitor_vehicles...")
            conn.execute(text("ALTER TABLE visitor_vehicles DROP COLUMN IF EXISTS model;"))
            
            print("Migration successful!")

if __name__ == "__main__":
    migrate()
