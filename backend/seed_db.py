from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models.user import User, UserRole, AccountStatus
from app.utils.security import get_password_hash
from app.config import settings
import sys

# Connect to the database
try:
    engine = create_engine(settings.DATABASE_URL)
    # Test connection and fix enums
    with engine.connect() as conn:
        print("Successfully connected to the database.")
        
        # Ensure enums have all required values
        # Note: ALTER TYPE ... ADD VALUE cannot be executed inside a transaction block in some PG versions
        # so we use execution_options(isolation_level="AUTOCOMMIT")
        print("Checking and updating database schema (enums and columns)...")
        autocommit_engine = engine.execution_options(isolation_level="AUTOCOMMIT")
        with autocommit_engine.connect() as autocommit_conn:
            # 1. Fix Enums
            for role in ["staff", "visitor"]:
                try:
                    autocommit_conn.execute(text(f"ALTER TYPE user_role ADD VALUE IF NOT EXISTS '{role}'"))
                except:
                    pass
            
            for status in ["expired"]:
                 try:
                    autocommit_conn.execute(text(f"ALTER TYPE vehicle_status ADD VALUE IF NOT EXISTS '{status}'"))
                 except:
                    pass

            # 2. Fix Vehicles Table Columns
            columns_to_add = [
                ("registration_date", "TIMESTAMP WITH TIME ZONE"),
                ("expiry_date", "TIMESTAMP WITH TIME ZONE"),
                ("qr_code", "VARCHAR(255)"),
                ("or_cr_url", "VARCHAR(255)")
            ]
            for col_name, col_type in columns_to_add:
                try:
                    autocommit_conn.execute(text(f"ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS {col_name} {col_type}"))
                except:
                    pass

            # 3. Fix Entry Logs Table columns
            log_columns = [
                ("plate_number", "VARCHAR(20)"),
                ("snapshot_url", "VARCHAR(255)"),
                ("is_unregistered", "BOOLEAN DEFAULT FALSE"),
                ("notes", "VARCHAR(255)"),
                ("gate_name", "VARCHAR(50)")
            ]
            for col_name, col_type in log_columns:
                try:
                    autocommit_conn.execute(text(f"ALTER TABLE entry_logs ADD COLUMN IF NOT EXISTS {col_name} {col_type}"))
                except:
                    pass
            
            # 4. Fix naming mismatches in Entry Logs by dropping legacy columns if they conflict
            legacy_columns = ["detected_plate_number", "snapshot_image_url", "camera_id", "is_violation", "requires_manual_verification"]
            for col in legacy_columns:
                try:
                    autocommit_conn.execute(text(f"ALTER TABLE entry_logs DROP COLUMN IF EXISTS {col} CASCADE"))
                    print(f"Dropped legacy column entry_logs.{col}")
                except:
                    pass
            
            # Ensure plate_number is NOT NULL
            try:
                autocommit_conn.execute(text("ALTER TABLE entry_logs ALTER COLUMN plate_number SET NOT NULL"))
            except:
                pass

        print("Database schema verified.")
        
except Exception as e:
    print(f"\n[ERROR] Could not connect to PostgreSQL or update enums.")
    print(f"Details: {e}")
    print("\nPlease verify:")
    print("1. PostgreSQL is running in Services.msc")
    print("2. Your password in backend/.env is correct")
    print("3. The database 'campus_anpr' exists in pgAdmin\n")
    sys.exit(1)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Ensure tables exist
from app.utils.database import Base
# Import all models to ensure they are registered with Base
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.entry_log import EntryLog
from app.models.notification import Notification

Base.metadata.create_all(bind=engine)

def seed_users():
    db = SessionLocal()
    try:
        # Check if users already exist
        print("Checking for existing users...")
        user_count = db.query(User).count()
        if user_count > 0:
            print(f"Database already has {user_count} users. Skipping seeding.")
            return

        print("Seeding test users...")
        users = [
            {
                "email": "admin@example.com",
                "username": "admin",
                "password": "AdminPassword123",
                "full_name": "System Administrator",
                "role": UserRole.admin,
                "status": AccountStatus.active
            },
            {
                "email": "student@example.com",
                "username": "student",
                "password": "StudentPassword123",
                "full_name": "John Student",
                "role": UserRole.student,
                "status": AccountStatus.active,
                "student_id": "2024-0001"
            },
            {
                "email": "faculty@example.com",
                "username": "faculty",
                "password": "FacultyPassword123",
                "full_name": "Dr. Faculty",
                "role": UserRole.faculty,
                "status": AccountStatus.active
            },
            {
                "email": "security@example.com",
                "username": "security",
                "password": "SecurityPassword123",
                "full_name": "Security Guard",
                "role": UserRole.security,
                "status": AccountStatus.active
            },
            {
                "email": "staff@example.com",
                "username": "staff",
                "password": "StaffPassword123",
                "full_name": "Maria Staff",
                "role": UserRole.staff,
                "status": AccountStatus.active
            },
            {
                "email": "visitor@example.com",
                "username": "visitor",
                "password": "VisitorPassword123",
                "full_name": "Juan Visitor",
                "role": UserRole.visitor,
                "status": AccountStatus.active
            }
        ]

        for user_data in users:
            password = user_data.pop("password")
            user = User(
                **user_data,
                password_hash=get_password_hash(password)
            )
            db.add(user)
        
        db.commit()
        print("Test users seeded successfully!")
        print("\nLogin Credentials:")
        print("Admin:    admin@example.com / AdminPassword123")
        print("Student:  student@example.com / StudentPassword123 (or ID: 2024-0001)")
        print("Faculty:  faculty@example.com / FacultyPassword123")
        print("Security: security@example.com / SecurityPassword123")
        print("Staff:    staff@example.com / StaffPassword123")
        print("Visitor:  visitor@example.com / VisitorPassword123\n")
        
    except Exception as e:
        print(f"Error seeding users: {e}")
        db.rollback()
    finally:
        db.close()

def seed_data():
    db = SessionLocal()
    from app.models.vehicle import Vehicle, VehicleType, VehicleStatus
    from app.models.entry_log import EntryLog, EntryDirection
    from app.models.notification import Notification, NotificationType
    from datetime import datetime, timedelta
    import random

    try:
        print("\nSeeding additional data (Vehicles, Logs, Notifications)...")
        
        # Clear existing data to avoid conflicts
        db.query(Notification).delete()
        db.query(EntryLog).delete()
        db.query(Vehicle).delete()
        db.commit()

        # Get Student User
        student = db.query(User).filter(User.email == "student@example.com").first()
        if not student:
            print("Student user not found! Please run user seeding first.")
            return

        # 1. Seed Vehicles
        if db.query(Vehicle).filter(Vehicle.user_id == student.id).count() == 0:
            print("Seeding vehicles...")
            vehicle1 = Vehicle(
                user_id=student.id,
                plate_number="XYZ 5678",
                type=VehicleType.motorcycle,
                make="Honda",
                model="Click 125i",
                color="Black",
                status=VehicleStatus.approved,
                registration_date=datetime.now() - timedelta(days=300),
                expiry_date=datetime.now() + timedelta(days=65)
            )
            vehicle2 = Vehicle(
                user_id=student.id,
                plate_number="ABC 1234",
                type=VehicleType.car,
                make="Toyota",
                model="Vios",
                color="Silver",
                status=VehicleStatus.pending,
                registration_date=datetime.now() - timedelta(days=5)
            )
            db.add_all([vehicle1, vehicle2])
            db.commit() # Commit to get IDs
            print("Vehicles seeded.")
        else:
            print("Vehicles already exist, skipping...")
        
        # Reload vehicles to get IDs
        v1 = db.query(Vehicle).filter(Vehicle.plate_number == "XYZ 5678").first()

        # 2. Seed Entry Logs
        if db.query(EntryLog).count() == 0 and v1:
            print("Seeding entry logs...")
            logs = []
            gates = ["Main Gate", "Back Gate"]
            
            # Generate 15 random logs over last month
            for i in range(15):
                is_entry = random.choice([True, False])
                log = EntryLog(
                    vehicle_id=v1.id,
                    plate_number=v1.plate_number,
                    direction=EntryDirection.entry if is_entry else EntryDirection.exit,
                    gate_name=random.choice(gates),
                    timestamp=datetime.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 12)),
                    confidence_score=random.uniform(95.0, 99.9),
                    is_unregistered=False
                )
                logs.append(log)
            
            # Add a recent one
            logs.append(EntryLog(
                vehicle_id=v1.id,
                plate_number=v1.plate_number,
                direction=EntryDirection.entry,
                gate_name="Main Gate",
                timestamp=datetime.now() - timedelta(minutes=45),
                confidence_score=99.2,
                is_unregistered=False
            ))
            
            db.add_all(logs)
            print("Entry logs seeded.")

        # 3. Seed Notifications
        if db.query(Notification).filter(Notification.user_id == student.id).count() == 0:
            print("Seeding notifications...")
            notifs = [
                Notification(
                    user_id=student.id,
                    type=NotificationType.INFO,
                    title="System Maintenance",
                    message="Scheduled maintenance on Feb 15, 2026. Access might be slow.",
                    is_read=True,
                    created_at=datetime.now() - timedelta(days=2)
                ),
                Notification(
                    user_id=student.id,
                    type=NotificationType.SUCCESS,
                    title="Vehicle Approved",
                    message="Your vehicle XYZ 5678 has been approved for campus access.",
                    is_read=True,
                    created_at=datetime.now() - timedelta(days=5)
                ),
                Notification(
                    user_id=student.id,
                    type=NotificationType.WARNING,
                    title="Renew Registration",
                    message="Your vehicle registration expires in 65 days.",
                    is_read=False,
                    created_at=datetime.now() - timedelta(hours=5)
                )
            ]
            db.add_all(notifs)
            print("Notifications seeded.")
            
        db.commit()
        print("All additional data seeded successfully!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()
    seed_data()
