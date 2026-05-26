from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.utils.security import get_password_hash
import sys
import os
import json
import random
from datetime import datetime, timedelta, timezone, time
import uuid

# Import all models
from app.utils.database import Base
from app.models.user import User, UserRole, AccountStatus, SexType
from app.models.gate import Gate, GateStatus
from app.models.camera import Camera, CameraSettings
from app.models.vehicle import Vehicle, VehicleType, VehicleStatus
from app.models.entry_log import EntryLog, EntryDirection, LogCategory
from app.models.notification import Notification, NotificationType
from app.models.blacklist import BlacklistRecord
from app.models.visitor import Visitor, VisitorVehicle
from app.models.violation import Violation
from app.models.settings import Setting
from app.models.anpr import AnprPlateCapture, AnprAnomalyEvent, AnprAlertKind

# Connect to the database
try:
    engine = create_engine(settings.DATABASE_URL)
    print("Re-initializing database using schema_all.sql...")
    with engine.connect() as conn:
        autocommit_conn = engine.execution_options(isolation_level="AUTOCOMMIT").connect()
        
        schema_path = os.path.join(os.path.dirname(__file__), "migrations", "schema_all.sql")
        with open(schema_path, "r", encoding="utf-8") as f:
            schema_sql = f.read()
            
        import re
        print("Executing schema statements...")
        clean_sql = re.sub(r'/\*.*?\*/', '', schema_sql, flags=re.DOTALL)
        clean_sql = re.sub(r'--.*', '', clean_sql)
        
        statements = clean_sql.split(';')
                
        for stmt in statements:
            stmt = stmt.strip()
            if not stmt:
                continue
            try:
                autocommit_conn.execute(text(stmt))
            except Exception as e:
                if "already exists" not in str(e).lower() and "does not exist" not in str(e).lower():
                    print(f"Warning executing statement: {e}")

        print("Successfully initialized schema from schema_all.sql")
        
        # Add column that SQLAlchemy model expects but schema_all.sql may not have
        try:
            autocommit_conn.execute(text("ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS orcr_photo_path TEXT"))
        except Exception:
            pass
        
        print("Syncing SQLAlchemy metadata...")
        Base.metadata.reflect(bind=engine)
        print(f"Metadata tables after reflection: {list(Base.metadata.tables.keys())}")
        
        Base.metadata.create_all(bind=engine)
        print(f"Metadata tables after create_all: {list(Base.metadata.tables.keys())}")
            
except Exception as e:
    print(f"\n[ERROR] Could not connect to PostgreSQL: {e}")
    sys.exit(1)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ============================================================
# Realistic Filipino Names & Data
# ============================================================
FIRST_NAMES_M = ["Juan", "Carlos", "Miguel", "Rafael", "Andrei", "Mark", "James", "Paolo", "Kevin", "Renzo", "Joshua", "Angelo", "Benedict", "Christian", "Dominic"]
FIRST_NAMES_F = ["Maria", "Angela", "Patricia", "Jasmine", "Christine", "Alyssa", "Nicole", "Bianca", "Samantha", "Danielle", "Katrina", "Isabelle", "Sophia", "Hannah", "Theresa"]
LAST_NAMES = ["Santos", "Reyes", "Cruz", "Bautista", "Del Rosario", "Gonzales", "Villanueva", "Fernandez", "Garcia", "Mendoza", "Torres", "Aquino", "Ramos", "Rivera", "Lopez", "Castillo", "Navarro", "Soriano", "Domingo", "Aguilar"]
DEPARTMENTS = ["College of Engineering", "College of Arts & Sciences", "College of Education", "College of Business Administration", "College of Computing & Information Sciences"]
PROGRAMS = ["BS Computer Science", "BS Information Technology", "BS Civil Engineering", "BS Electrical Engineering", "BS Accountancy", "BS Business Administration", "BS Education", "BA Communication"]

PH_PLATES = []
for _ in range(30):
    letters = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=3))
    nums = random.randint(1000, 9999)
    PH_PLATES.append(f"{letters} {nums}")

CAR_BRANDS = ["Toyota", "Honda", "Mitsubishi", "Suzuki", "Ford", "Hyundai", "Nissan", "Kia"]
MOTO_BRANDS = ["Honda", "Yamaha", "Suzuki", "Kawasaki", "TVS"]
COLORS = ["Black", "White", "Silver", "Red", "Blue", "Gray", "Maroon", "Yellow"]


def seed_users():
    db = SessionLocal()
    try:
        print("\n=== Seeding Users (30 accounts) ===")
        all_users = []

        # 1. Admin
        all_users.append({
            "email": "admin@example.com", "username": "admin", "password": "AdminPassword123",
            "first_name": "System", "last_name": "Administrator",
            "role": UserRole.admin, "status": AccountStatus.active, "sex": SexType.Male,
            "phone_number": "09171234567", "department": "IT Department"
        })

        # 2-5. Security Guards (4)
        sec_names = [("Ricardo", "Santos", "M"), ("Eduardo", "Reyes", "M"), ("Fernando", "Cruz", "M"), ("Roberto", "Bautista", "M")]
        for i, (fn, ln, sex) in enumerate(sec_names):
            all_users.append({
                "email": f"security{i+1}@example.com" if i > 0 else "security@example.com",
                "username": f"security{'_' + str(i+1) if i > 0 else ''}",
                "password": "SecurityPassword123",
                "first_name": fn, "last_name": ln,
                "role": UserRole.security, "status": AccountStatus.active,
                "sex": SexType.Male, "phone_number": f"0917555{1000+i}",
                "staff_id": f"SEC-2024-{100+i}", "staff_department": "Security Department",
                "job_title": "Security Officer"
            })

        # 6-20. Students (15)
        for i in range(15):
            is_male = i % 2 == 0
            fn = FIRST_NAMES_M[i % len(FIRST_NAMES_M)] if is_male else FIRST_NAMES_F[i % len(FIRST_NAMES_F)]
            ln = LAST_NAMES[i % len(LAST_NAMES)]
            dept = DEPARTMENTS[i % len(DEPARTMENTS)]
            prog = PROGRAMS[i % len(PROGRAMS)]
            yr = random.choice(["1st Year", "2nd Year", "3rd Year", "4th Year"])
            all_users.append({
                "email": f"student{i+1}@example.com" if i > 0 else "student@example.com",
                "username": f"student{'_' + str(i+1) if i > 0 else ''}",
                "password": "StudentPassword123",
                "first_name": fn, "last_name": ln,
                "role": UserRole.student, "status": AccountStatus.active,
                "sex": SexType.Male if is_male else SexType.Female,
                "student_id": f"2024-{1001+i}", "department": dept,
                "academic_program": prog, "year_level": yr,
                "section": f"Section {chr(65 + (i % 4))}",
                "phone_number": f"0918{random.randint(1000000, 9999999)}"
            })

        # 21-25. Faculty (5)
        fac_names = [("Dr. Elena", "Mendoza", "F"), ("Prof. Antonio", "Torres", "M"), ("Dr. Carmen", "Aquino", "F"), ("Prof. Manuel", "Ramos", "M"), ("Dr. Lucia", "Rivera", "F")]
        for i, (fn, ln, sex) in enumerate(fac_names):
            all_users.append({
                "email": f"faculty{i+1}@example.com" if i > 0 else "faculty@example.com",
                "username": f"faculty{'_' + str(i+1) if i > 0 else ''}",
                "password": "FacultyPassword123",
                "first_name": fn, "last_name": ln,
                "role": UserRole.faculty, "status": AccountStatus.active,
                "sex": SexType.Female if sex == "F" else SexType.Male,
                "faculty_id": f"FAC-2024-{200+i}", "department": DEPARTMENTS[i % len(DEPARTMENTS)],
                "position": random.choice(["Professor", "Associate Professor", "Instructor"]),
                "employment_type": "Regular",
                "phone_number": f"0919{random.randint(1000000, 9999999)}"
            })

        # 26-28. Staff (3)
        staff_names = [("Gloria", "Lopez", "F"), ("Ernesto", "Castillo", "M"), ("Maricel", "Navarro", "F")]
        for i, (fn, ln, sex) in enumerate(staff_names):
            all_users.append({
                "email": f"staff{i+1}@example.com" if i > 0 else "staff@example.com",
                "username": f"staff{'_' + str(i+1) if i > 0 else ''}",
                "password": "StaffPassword123",
                "first_name": fn, "last_name": ln,
                "role": UserRole.staff, "status": AccountStatus.active,
                "sex": SexType.Female if sex == "F" else SexType.Male,
                "staff_id": f"STF-2024-{300+i}",
                "staff_department": random.choice(["Registrar", "Finance Office", "Library"]),
                "job_title": random.choice(["Administrative Officer", "Clerk", "Coordinator"]),
                "employment_status": "Active",
                "phone_number": f"0920{random.randint(1000000, 9999999)}"
            })

        # 29-30. Visitors (2)
        vis_names = [("Pedro", "Soriano", "M"), ("Lourdes", "Domingo", "F")]
        for i, (fn, ln, sex) in enumerate(vis_names):
            all_users.append({
                "email": f"visitor{i+1}@example.com" if i > 0 else "visitor@example.com",
                "username": f"visitor{'_' + str(i+1) if i > 0 else ''}",
                "password": "VisitorPassword123",
                "first_name": fn, "last_name": ln,
                "role": UserRole.visitor, "status": AccountStatus.active,
                "sex": SexType.Male if sex == "M" else SexType.Female,
                "visitor_purpose": random.choice(["Meeting", "Delivery", "Campus Tour"]),
                "phone_number": f"0921{random.randint(1000000, 9999999)}"
            })

        added = 0
        for user_data in all_users:
            password = user_data.pop("password")
            existing = db.query(User).filter(User.email == user_data["email"]).first()
            if existing:
                continue
            user = User(**user_data, password_hash=get_password_hash(password))
            db.add(user)
            added += 1
        
        db.commit()
        print(f"  [OK] Seeded {added} new users ({len(all_users) - added} already existed).")
        
    except Exception as e:
        print(f"Error seeding users: {e}")
        db.rollback()
    finally:
        db.close()


def seed_infrastructure():
    db = SessionLocal()
    try:
        print("\n=== Seeding Gates & Cameras ===")
        
        # Gates (already seeded in SQL, but ensure they exist)
        gate1 = db.query(Gate).filter(Gate.name == "Main Gate").first()
        gate2 = db.query(Gate).filter(Gate.name == "Back Gate").first()
        if not gate1:
            gate1 = Gate(name="Main Gate", location_description="Primary entrance along the highway", status=GateStatus.open)
            db.add(gate1)
        if not gate2:
            gate2 = Gate(name="Back Gate", location_description="Secondary access near faculty parking", status=GateStatus.open)
            db.add(gate2)
        db.flush()

        # 4 Cameras (2 per gate)
        existing_cams = db.query(Camera).count()
        if existing_cams == 0:
            cameras_data = [
                {"gate": gate1, "name": "Main Gate - Entry", "position": "Front Left", "direction": "entry", "ip": "192.168.1.101"},
                {"gate": gate1, "name": "Main Gate - Exit", "position": "Front Right", "direction": "exit", "ip": "192.168.1.102"},
                {"gate": gate2, "name": "Back Gate - Entry", "position": "Rear Left", "direction": "entry", "ip": "192.168.1.103"},
                {"gate": gate2, "name": "Back Gate - Exit", "position": "Rear Right", "direction": "exit", "ip": "192.168.1.104"},
            ]
            for cd in cameras_data:
                cam = Camera(
                    gate_id=cd["gate"].id, name=cd["name"], position=cd["position"],
                    ip_address=cd["ip"], direction=cd["direction"], is_active=True
                )
                db.add(cam)
        
        db.commit()
        print(f"  [OK] Gates and 4 cameras seeded!")
        
    except Exception as e:
        print(f"Error seeding infrastructure: {e}")
        db.rollback()
    finally:
        db.close()


def seed_vehicles():
    db = SessionLocal()
    try:
        print("\n=== Seeding Vehicles (25 vehicles) ===")
        
        students = db.query(User).filter(User.role == UserRole.student).all()
        faculty = db.query(User).filter(User.role == UserRole.faculty).all()
        staff = db.query(User).filter(User.role == UserRole.staff).all()
        admin = db.query(User).filter(User.role == UserRole.admin).first()
        
        plate_idx = 0
        vehicles_added = 0
        
        # Students get motorcycles and some cars
        for i, student in enumerate(students):
            vtype = VehicleType.motorcycle if i % 3 != 0 else VehicleType.car
            brand = random.choice(MOTO_BRANDS) if vtype == VehicleType.motorcycle else random.choice(CAR_BRANDS)
            status = VehicleStatus.approved if i < 10 else random.choice([VehicleStatus.pending, VehicleStatus.expired])
            
            reg_date = datetime.now(timezone.utc) - timedelta(days=random.randint(30, 300))
            exp_date = reg_date + timedelta(days=365) if status == VehicleStatus.approved else None
            
            v = Vehicle(
                user_id=student.id, plate_number=PH_PLATES[plate_idx],
                type=vtype, brand=brand, color=random.choice(COLORS),
                status=status, registration_date=reg_date, expiry_date=exp_date,
                approved_by=admin.id if status == VehicleStatus.approved else None,
                approved_at=reg_date + timedelta(days=1) if status == VehicleStatus.approved else None,
                is_on_campus=random.choice([True, False]) if status == VehicleStatus.approved else False,
                last_seen_gate=random.choice(["Main Gate", "Back Gate"]) if status == VehicleStatus.approved else None,
                last_seen_at=datetime.now(timezone.utc) - timedelta(minutes=random.randint(5, 120)) if status == VehicleStatus.approved else None
            )
            db.add(v)
            plate_idx += 1
            vehicles_added += 1
        
        # Faculty get cars
        for i, fac in enumerate(faculty):
            v = Vehicle(
                user_id=fac.id, plate_number=PH_PLATES[plate_idx],
                type=VehicleType.car, brand=random.choice(CAR_BRANDS), color=random.choice(COLORS),
                status=VehicleStatus.approved,
                registration_date=datetime.now(timezone.utc) - timedelta(days=random.randint(60, 200)),
                expiry_date=datetime.now(timezone.utc) + timedelta(days=random.randint(100, 300)),
                approved_by=admin.id, approved_at=datetime.now(timezone.utc) - timedelta(days=random.randint(50, 190)),
                is_on_campus=random.choice([True, False]),
                last_seen_gate="Main Gate",
                last_seen_at=datetime.now(timezone.utc) - timedelta(minutes=random.randint(5, 60))
            )
            db.add(v)
            plate_idx += 1
            vehicles_added += 1
        
        # Staff get cars/vans
        for i, s in enumerate(staff):
            v = Vehicle(
                user_id=s.id, plate_number=PH_PLATES[plate_idx],
                type=random.choice([VehicleType.car, VehicleType.van]),
                brand=random.choice(CAR_BRANDS), color=random.choice(COLORS),
                status=VehicleStatus.approved,
                registration_date=datetime.now(timezone.utc) - timedelta(days=random.randint(60, 200)),
                expiry_date=datetime.now(timezone.utc) + timedelta(days=random.randint(100, 300)),
                approved_by=admin.id, approved_at=datetime.now(timezone.utc) - timedelta(days=55),
                is_on_campus=True, last_seen_gate="Main Gate",
                last_seen_at=datetime.now(timezone.utc) - timedelta(minutes=10)
            )
            db.add(v)
            plate_idx += 1
            vehicles_added += 1
        
        # 1 blacklisted vehicle
        bl_vehicle = Vehicle(
            user_id=students[0].id, plate_number=PH_PLATES[plate_idx],
            type=VehicleType.car, brand="Unknown", color="Black",
            status=VehicleStatus.blacklisted,
            registration_date=datetime.now(timezone.utc) - timedelta(days=90),
            anpr_flagged=True, anpr_flag_msg="Repeated unauthorized access attempts"
        )
        db.add(bl_vehicle)
        plate_idx += 1
        vehicles_added += 1
        
        db.commit()
        print(f"  [OK] Seeded {vehicles_added} vehicles!")
        
    except Exception as e:
        print(f"Error seeding vehicles: {e}")
        db.rollback()
    finally:
        db.close()


def seed_traffic_logs():
    db = SessionLocal()
    try:
        print("\n=== Seeding Traffic Logs (30 days, ~600 logs) ===")
        
        vehicles = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.approved).all()
        gates = db.query(Gate).all()
        cameras = db.query(Camera).all()
        
        if not vehicles or not gates:
            print("  [WARN] No approved vehicles or gates found. Skipping traffic logs.")
            return
        
        now = datetime.now(timezone.utc)
        logs_to_add = []
        
        # 1. Standard random traffic logs
        for day_offset in range(30):
            current_day = now - timedelta(days=day_offset)
            is_weekend = current_day.weekday() >= 5
            logs_count = random.randint(5, 15) if is_weekend else random.randint(20, 40)
            
            for _ in range(logs_count):
                hour = random.choices(
                    range(24),
                    weights=[1,1,1,1,1,2,8,12,10,6,5,4,5,6,8,12,10,4,2,1,1,1,1,1]
                )[0]
                
                log_time = current_day.replace(hour=hour, minute=random.randint(0,59), second=random.randint(0,59))
                vehicle = random.choice(vehicles)
                gate = random.choice(gates)
                direction = random.choice([EntryDirection.entry, EntryDirection.exit])
                
                # Pick a camera matching gate + direction
                matching_cams = [c for c in cameras if c.gate_id == gate.id and c.direction == direction.value]
                cam = matching_cams[0] if matching_cams else (cameras[0] if cameras else None)
                
                log = EntryLog(
                    camera_id=cam.id if cam else None,
                    gate_id=gate.id,
                    detected_plate_number=vehicle.plate_number,
                    vehicle_id=vehicle.id,
                    user_id=vehicle.user_id,
                    direction=direction,
                    category=LogCategory.entry if direction == EntryDirection.entry else LogCategory.exit,
                    confidence_score=round(random.uniform(85.0, 99.9), 2),
                    authorization_status="authorized",
                    timestamp=log_time
                )
                logs_to_add.append(log)
        
        # 2. Structured, highly-paired multi-trip logs for shift time stacking demo
        print("  [INFO] Seeding structured high-density shift time-stacking records...")
        import zoneinfo
        ph_tz = zoneinfo.ZoneInfo("Asia/Manila")
        
        featured_vehicles = vehicles[:3]
        for v_idx, vehicle in enumerate(featured_vehicles):
            for day_offset in range(4):  # Today, Yesterday, and the past two days
                current_day = now - timedelta(days=day_offset)
                
                # Multi-trip logs configuration for shifts:
                # Format: (hour, minute, direction) in Asia/Manila local time
                trips = [
                    # Morning Shift trips (5:00 AM - 11:59 AM)
                    (7, 5 + v_idx * 5, EntryDirection.entry),
                    (8, 15 + v_idx * 5, EntryDirection.exit),
                    (9, 30 + v_idx * 5, EntryDirection.entry),
                    (11, 20 - v_idx * 5, EntryDirection.exit),
                    
                    # Afternoon Shift trips (12:00 PM - 5:59 PM)
                    (13, 15 + v_idx * 5, EntryDirection.entry),
                    (15, 45 - v_idx * 5, EntryDirection.exit),
                    (16, 10 + v_idx * 5, EntryDirection.entry),
                    (17, 30 - v_idx * 5, EntryDirection.exit),
                    
                    # Night Shift trips (6:00 PM - 4:59 AM)
                    (18, 45 + v_idx * 5, EntryDirection.entry),
                    (21, 15 - v_idx * 5, EntryDirection.exit),
                    (22, 30 + v_idx * 5, EntryDirection.entry),
                    (23, 50 - v_idx * 5, EntryDirection.exit)
                ]
                
                for hr, mn, direction in trips:
                    local_time = datetime(current_day.year, current_day.month, current_day.day, hr, mn, random.randint(0, 59), tzinfo=ph_tz)
                    log_time = local_time.astimezone(timezone.utc)
                    
                    gate = random.choice(gates)
                    matching_cams = [c for c in cameras if c.gate_id == gate.id and c.direction == direction.value]
                    cam = matching_cams[0] if matching_cams else (cameras[0] if cameras else None)
                    
                    log = EntryLog(
                        camera_id=cam.id if cam else None,
                        gate_id=gate.id,
                        detected_plate_number=vehicle.plate_number,
                        vehicle_id=vehicle.id,
                        user_id=vehicle.user_id,
                        direction=direction,
                        category=LogCategory.entry if direction == EntryDirection.entry else LogCategory.exit,
                        confidence_score=round(random.uniform(92.0, 99.9), 2),
                        authorization_status="authorized",
                        timestamp=log_time
                    )
                    logs_to_add.append(log)
        
        db.add_all(logs_to_add)
        db.commit()
        print(f"  [OK] Seeded {len(logs_to_add)} traffic entry/exit logs (including multi-trip stacks)!")
        
    except Exception as e:
        print(f"Error seeding traffic logs: {e}")
        db.rollback()
    finally:
        db.close()


def seed_security_shifts():
    db = SessionLocal()
    try:
        print("\n=== Seeding Security Shifts ===")
        
        security_users = db.query(User).filter(User.role == UserRole.security).all()
        if not security_users:
            print("  [WARN] No security users found. Skipping shifts.")
            return
        
        posts = ["Main Gate", "Back Gate", "Roving", "Main Gate"]
        shifts = [
            (time(6, 0), time(14, 0)),
            (time(14, 0), time(22, 0)),
            (time(22, 0), time(6, 0)),
            (time(6, 0), time(14, 0)),
        ]
        
        for i, sec_user in enumerate(security_users):
            shift_start, shift_end = shifts[i % len(shifts)]
            db.execute(text(
                "INSERT INTO security_shifts (user_id, badge_id, duty_status, assigned_post, shift_start, shift_end, is_active) "
                "VALUES (CAST(:uid AS uuid), :badge, 'on_duty', :post, :ss, :se, true)"
            ), {
                "uid": str(sec_user.id),
                "badge": f"SEC-{100+i}",
                "post": posts[i % len(posts)],
                "ss": shift_start.strftime("%H:%M:%S"),
                "se": shift_end.strftime("%H:%M:%S")
            })
        
        db.commit()
        print(f"  [OK] Seeded {len(security_users)} security shifts!")
        
    except Exception as e:
        print(f"Error seeding security shifts: {e}")
        db.rollback()
    finally:
        db.close()


def seed_system_logs():
    db = SessionLocal()
    try:
        print("\n=== Seeding System Audit Logs (150 entries) ===")
        
        admin_user = db.query(User).filter(User.role == UserRole.admin).first()
        security_user = db.query(User).filter(User.role == UserRole.security).first()
        
        if not admin_user:
            print("  [WARN] No admin user found. Skipping system logs.")
            return
        
        now = datetime.now(timezone.utc)
        
        audit_events = [
            ("user.login", "system", "Login session started"),
            ("vehicle.approved", "system", "Vehicle registration approved"),
            ("alert.resolved", "alert", "Anomaly alert resolved by security"),
            ("alert.dismissed", "alert", "Minor mismatch alert dismissed"),
            ("settings.updated", "system", "System security parameters updated"),
            ("user.created", "system", "New user account created"),
            ("vehicle.rejected", "system", "Vehicle registration rejected"),
        ]
        
        for _ in range(150):
            event_type, category, desc = random.choice(audit_events)
            actor = random.choice([admin_user, security_user]) if security_user else admin_user
            event_time = now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
            
            db.execute(text(
                "INSERT INTO system_logs (actor_id, action, category, details, created_at, ip_address) "
                "VALUES (CAST(:actor_id AS uuid), :action, :category, CAST(:details AS jsonb), :ts, :ip)"
            ), {
                "actor_id": str(actor.id),
                "action": event_type,
                "category": category.lower(),
                "details": json.dumps({"description": desc, "simulated": True}),
                "ts": event_time,
                "ip": f"192.168.1.{random.randint(10, 254)}"
            })
        
        db.commit()
        print(f"  [OK] Seeded 150 system audit logs!")
        
    except Exception as e:
        print(f"Error seeding system logs: {e}")
        db.rollback()
    finally:
        db.close()


def seed_notifications():
    db = SessionLocal()
    try:
        print("\n=== Seeding Notifications ===")
        
        students = db.query(User).filter(User.role == UserRole.student).limit(5).all()
        for s in students:
            notifs = [
                Notification(user_id=s.id, type=NotificationType.SUCCESS, title="Vehicle Approved", message=f"Your vehicle has been approved for campus access."),
                Notification(user_id=s.id, type=NotificationType.WARNING, title="Registration Reminder", message="Your vehicle registration expires in 30 days."),
            ]
            db.add_all(notifs)
        
        db.commit()
        print(f"  [OK] Seeded {len(students) * 2} notifications!")
        
    except Exception as e:
        print(f"Error seeding notifications: {e}")
        db.rollback()
    finally:
        db.close()


def seed_anomalies():
    db = SessionLocal()
    try:
        print("\n=== Seeding ANPR Plate Captures & Anomalies ===")
        
        # Check if they exist
        existing_anomalies = db.query(AnprAnomalyEvent).count()
        if existing_anomalies > 0:
            print("  [INFO] Anomalies already exist in the database. Skipping.")
            return

        gate = db.query(Gate).filter(Gate.name == "Main Gate").first()
        gate_back = db.query(Gate).filter(Gate.name == "Back Gate").first()
        
        if not gate:
            print("  [WARN] No gates found. Skipping anomalies.")
            return
            
        now = datetime.now(timezone.utc)
        
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
        if not vehicle:
            vehicle = db.query(Vehicle).first()
            
        cap3 = AnprPlateCapture(
            id=uuid.uuid4(),
            plate_normalized=vehicle.plate_number.replace(" ", "") if vehicle else "CAR9610",
            plate_raw=vehicle.plate_number if vehicle else "CAR 9610",
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

        # 5. Blacklisted vehicle breach alert
        bl_vehicle = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.blacklisted).first()
        if bl_vehicle:
            cap5 = AnprPlateCapture(
                id=uuid.uuid4(),
                plate_normalized=bl_vehicle.plate_number.replace(" ", ""),
                plate_raw=bl_vehicle.plate_number,
                confidence_score=99.2,
                brand="Hyundai",
                color="Black",
                vehicle_type_detected="car",
                gate_id=gate.id,
                vehicle_id=bl_vehicle.id,
                alert_kind=AnprAlertKind.breach_blacklisted,
                created_at=now - timedelta(minutes=15)
            )
            db.add(cap5)
            db.flush()

            ev5 = AnprAnomalyEvent(
                id=uuid.uuid4(),
                capture_id=cap5.id,
                kind=AnprAlertKind.breach_blacklisted,
                status="open",
                tags=["Blacklisted", "High Risk"],
                created_at=now - timedelta(minutes=15)
            )
            db.add(ev5)
        
        db.commit()
        print("  [OK] 5 anomalies and plate captures successfully seeded!")
        
    except Exception as e:
        print(f"Error seeding anomalies: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("  CAMPUS ANPR SYSTEM - DATABASE SEEDER")
    print("=" * 60)
    seed_users()
    seed_infrastructure()
    seed_vehicles()
    seed_traffic_logs()
    seed_security_shifts()
    seed_system_logs()
    seed_notifications()
    seed_anomalies()
    print("\n" + "=" * 60)
    print("  ALL DATA SEEDED SUCCESSFULLY!")
    print("=" * 60)
