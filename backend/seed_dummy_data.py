"""
campus_anpr -- DUMMY DATA SEED SCRIPT
Run from the backend directory:
    venv\Scripts\python.exe seed_dummy_data.py

Populates: gates, cameras, users, vehicles, entry_logs
Existing rows whose unique keys already exist are safely skipped.
"""

import sys, io
# Force UTF-8 on Windows terminal
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import os
import uuid
from datetime import datetime, date, timedelta
from passlib.context import CryptContext

# ── Path setup ──────────────────────────────────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.utils.database import SessionLocal, engine
from app.models import (
    base,
    user as user_module,
    vehicle as vehicle_module,
    entry_log as log_module,
    camera as camera_module,
    gate as gate_module,
)
from app.models.user import User, UserRole, AccountStatus, SexType
from app.models.vehicle import Vehicle, VehicleType, VehicleStatus
from app.models.entry_log import EntryLog, EntryDirection, LogCategory
from app.models.camera import Camera, CameraSettings, CameraRecordingMode
from app.models.gate import Gate, GateStatus

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_pw(plain: str) -> str:
    return pwd_ctx.hash(plain)

def run():
    db = SessionLocal()
    try:
        print("[SEED] Seeding campus_anpr database with dummy data...")

        # ── 1. GATES ─────────────────────────────────────────────────────────
        gate_main_id = uuid.UUID("00000001-0000-0000-0000-000000000001")
        gate_back_id = uuid.UUID("00000001-0000-0000-0000-000000000002")

        for g_id, g_name, g_desc in [
            (gate_main_id, "Main Gate", "Primary campus entrance on Frontera Street"),
            (gate_back_id, "Back Gate", "Secondary campus entrance on Rizal Avenue"),
        ]:
            if not db.get(Gate, g_id):
                db.add(Gate(id=g_id, name=g_name, location_description=g_desc, status=GateStatus.open))

        db.flush()
        print("  [OK] Gates seeded")

        # ── 2. CAMERAS ───────────────────────────────────────────────────────
        camera_defs = [
            ("00000002-0000-0000-0000-000000000001", gate_main_id, "Main Gate - Front Left",  "Front Left",  "192.168.1.101", True,  True,  "XYZ 5678", -timedelta(hours=2)),
            ("00000002-0000-0000-0000-000000000002", gate_main_id, "Main Gate - Front Right", "Front Right", "192.168.1.102", True,  True,  "ABC 1234", -timedelta(hours=3)),
            ("00000002-0000-0000-0000-000000000003", gate_main_id, "Main Gate - Back Left",   "Back Left",   "192.168.1.103", True,  True,  "PQR 9012", -timedelta(hours=1)),
            ("00000002-0000-0000-0000-000000000004", gate_main_id, "Main Gate - Back Right",  "Back Right",  "192.168.1.104", True,  True,  "JKL 3456", -timedelta(hours=2, minutes=30)),
            ("00000002-0000-0000-0000-000000000005", gate_back_id, "2nd Gate - Rear Left",    "Rear Left",   "192.168.1.105", True,  True,  "MNO 7890", -timedelta(hours=4)),
            ("00000002-0000-0000-0000-000000000006", gate_back_id, "2nd Gate - Rear Right",   "Rear Right",  "192.168.1.106", True,  True,  "STU 2345", -timedelta(hours=3, minutes=15)),
            ("00000002-0000-0000-0000-000000000007", gate_back_id, "2nd Gate - Front Left",   "Front Left",  "192.168.1.107", True,  True,  "VWX 6789", -timedelta(hours=5)),
            ("00000002-0000-0000-0000-000000000008", gate_back_id, "2nd Gate - Front Right",  "Front Right", "192.168.1.108", False, False, "DEF 0123", -timedelta(hours=6)),
        ]

        now = datetime.utcnow()
        for (cam_id_str, g_id, name, pos, ip, is_active, is_streaming, last_plate, offset) in camera_defs:
            cam_id = uuid.UUID(cam_id_str)
            if not db.get(Camera, cam_id):
                cam = Camera(
                    id=cam_id, gate_id=g_id, name=name, position=pos,
                    ip_address=ip,
                    stream_url=f"rtsp://{ip}:554/live",
                    is_active=is_active,
                    is_streaming=is_streaming,
                    last_plate_detected=last_plate,
                    last_plate_detected_at=now + offset,
                    offline_since=None if is_active else now - timedelta(hours=1, minutes=18),
                )
                db.add(cam)
                db.add(CameraSettings(
                    id=uuid.uuid4(), camera_id=cam_id,
                    detection_threshold=85,
                    recording_mode=CameraRecordingMode.motion,
                    ai_night_vision=True,
                ))

        db.flush()
        print("  [OK] Cameras seeded")

        # ── 3. USERS ─────────────────────────────────────────────────────────
        DEFAULT_PW = hash_pw("Password123!")

        user_defs = [
            # (id_str, email, username, role, status, fname, mname, lname, sex, bdate, phone, student_id, dept, prog, yr, faculty_id, position, staff_id, staff_dept, jobtitle)
            ("10000000-0000-0000-0000-000000000001", "admin@csucc.edu.ph",              "sysadmin",      UserRole.admin,    AccountStatus.active, "System",   None,     "Admin",     SexType.Male,   "1985-06-15", "+63 912 000 0001", None,        None,               None,                     None,  None,       "System Administrator",   None,       None,                "Admin",          ),
            ("10000000-0000-0000-0000-000000000002", "jessiebryn.vasquez@csucc.edu.ph", "jessiebryn_v",  UserRole.student,  AccountStatus.active, "Jessie",   "Bryn",   "Vasquez",   SexType.Female, "2003-08-22", "+63 912 000 0002", "2021-0397", "College of Engineering", "BS Computer Engineering", "3rd Year", None, None, None, None, None),
            ("10000000-0000-0000-0000-000000000003", "student2@csucc.edu.ph",            "student_two",   UserRole.student,  AccountStatus.active, "Carlos",   "Miguel",  "Reyes",    SexType.Male,   "2004-03-10", "+63 912 000 0003", "2022-0112", "College of Engineering", "BS Information Technology", "2nd Year", None, None, None, None, None),
            ("10000000-0000-0000-0000-000000000004", "anna.reyes@csucc.edu.ph",          "anna.reyes",    UserRole.student,  AccountStatus.active, "Anna",     "Luz",    "Reyes",     SexType.Female, "2003-11-05", "+63 912 000 0004", "2021-0215", "College of Arts",        "BA Communication",          "3rd Year", None, None, None, None, None),
            ("10000000-0000-0000-0000-000000000005", "maria.santos@csucc.edu.ph",        "dr.santos",     UserRole.faculty,  AccountStatus.active, "Maria",    "Cruz",   "Santos",    SexType.Female, "1978-04-20", "+63 912 000 0005", None,        "College of Engineering", None,                     None,  "FAC-001",  "Associate Professor",    None,       None,            None              ),
            ("10000000-0000-0000-0000-000000000006", "sam.tan@csucc.edu.ph",             "engr.tan",      UserRole.faculty,  AccountStatus.active, "Samuel",   None,     "Tan",       SexType.Male,   "1982-09-12", "+63 912 000 0006", None,        "College of Engineering", None,                     None,  "FAC-002",  "Assistant Professor",    None,       None,            None              ),
            ("10000000-0000-0000-0000-000000000007", "jose.cruz@csucc.edu.ph",           "prof.cruz",     UserRole.faculty,  AccountStatus.active, "Jose",     "Ramon",  "Cruz",      SexType.Male,   "1975-12-01", "+63 912 000 0007", None,        "College of Science",     None,                     None,  "FAC-003",  "Professor",              None,       None,            None              ),
            ("10000000-0000-0000-0000-000000000008", "liza.sober@csucc.edu.ph",          "liza.sober",    UserRole.staff,    AccountStatus.active, "Liza",     None,     "Sober",     SexType.Female, "1990-07-18", "+63 912 000 0008", None,        None,               None,                     None,  None,       None,                     "STF-001",  "Administrative Office", "Administrative Assistant"),
            ("10000000-0000-0000-0000-000000000009", "pedro.garcia@csucc.edu.ph",        "pedro.garcia",  UserRole.security, AccountStatus.active, "Pedro",    None,     "Garcia",    SexType.Male,   "1988-02-28", "+63 912 000 0009", None,        None,               None,                     None,  None,       None,                     "SEC-001",  "Security Division",     "Security Officer"        ),
            ("10000000-0000-0000-0000-000000000010", "carlos.manalo@csucc.edu.ph",       "carlos.manalo", UserRole.security, AccountStatus.active, "Carlos",   None,     "Manalo",    SexType.Male,   "1991-05-14", "+63 912 000 0010", None,        None,               None,                     None,  None,       None,                     "SEC-002",  "Security Division",     "Security Officer"        ),
            ("10000000-0000-0000-0000-000000000011", "visitor1@gmail.com",               "visitor_one",   UserRole.visitor,  AccountStatus.active, "Roberto",  None,     "Luna",      SexType.Male,   "1988-11-20", "+63 912 000 0011", None,        None,               None,                     None,  None,       None,                     None,       None,                None                      ),
            ("10000000-0000-0000-0000-000000000012", "ken.chan@csucc.edu.ph",             "ken.chan",       UserRole.student,  AccountStatus.active, "Ken",      None,     "Chan",      SexType.Male,   "2002-06-30", "+63 912 000 0012", "2020-0054", "College of Business",    "BS Business Administration","4th Year", None, None, None, None, None),
            ("10000000-0000-0000-0000-000000000013", "bella.po@csucc.edu.ph",             "bella.po",       UserRole.staff,    AccountStatus.active, "Bella",    None,     "Po",        SexType.Female, "1993-04-08", "+63 912 000 0013", None,        None,               None,                     None,  None,       None,                     "STF-002",  "Library Services",      "Library Assistant"       ),
            ("10000000-0000-0000-0000-000000000014", "nadine.lu@csucc.edu.ph",            "nadine.lu",      UserRole.student,  AccountStatus.active, "Nadine",   None,     "Lu",        SexType.Female, "2003-09-15", "+63 912 000 0014", "2021-0302", "College of Arts",        "BA Mass Communication",     "3rd Year", None, None, None, None, None),
        ]

        user_id_map = {}
        for row in user_defs:
            (uid_str, email, username, role, status,
             fname, mname, lname, sex, bdate, phone,
             student_id, dept, prog, yr,
             faculty_id, position,
             staff_id, staff_dept, job_title) = row

            uid = uuid.UUID(uid_str)
            user_id_map[username] = uid

            if not db.get(User, uid):
                db.add(User(
                    id=uid, email=email, username=username,
                    password_hash=DEFAULT_PW,
                    role=role, status=status,
                    first_name=fname, middle_name=mname, last_name=lname,
                    sex=sex, birth_date=date.fromisoformat(bdate),
                    phone_number=phone,
                    student_id=student_id, department=dept,
                    academic_program=prog, year_level=yr,
                    faculty_id=faculty_id, position=position,
                    staff_id=staff_id, staff_department=staff_dept, job_title=job_title,
                ))

        db.flush()
        print(f"  [OK] {len(user_defs)} users seeded")

        # ── 4. VEHICLES ──────────────────────────────────────────────────────
        admin_uid = uuid.UUID("10000000-0000-0000-0000-000000000001")

        vehicle_defs = [
            # (id_str, owner_username, plate, type, brand, color, status, is_on_campus, last_gate_name, expiry_offset_days)
            ("20000000-0000-0000-0000-000000000001", "jessiebryn_v",  "CAR 9610",  VehicleType.car,        "Honda",     "Red",    VehicleStatus.approved, True,  "Main Gate", 270),
            ("20000000-0000-0000-0000-000000000002", "student_two",   "XYZ 5678",  VehicleType.motorcycle, "Honda",     "Black",  VehicleStatus.approved, False, "Back Gate", 70),
            ("20000000-0000-0000-0000-000000000003", "ken.chan",       "ABC 1234",  VehicleType.car,        "Toyota",    "Silver", VehicleStatus.pending,  False, None,        270),
            ("20000000-0000-0000-0000-000000000004", "dr.santos",     "DEF 9012",  VehicleType.car,        "Ford",      "White",  VehicleStatus.approved, True,  "Main Gate", 265),
            ("20000000-0000-0000-0000-000000000005", "anna.reyes",    "GHI 3456",  VehicleType.motorcycle, "Yamaha",    "Blue",   VehicleStatus.approved, False, "Back Gate", 127),
            ("20000000-0000-0000-0000-000000000006", "engr.tan",      "JKL 7890",  VehicleType.van,        "Toyota",    "Gray",   VehicleStatus.approved, True,  "Main Gate", 222),
            ("20000000-0000-0000-0000-000000000007", "liza.sober",    "MNO 2468",  VehicleType.car,        "Suzuki",    "Red",    VehicleStatus.approved, False, "Back Gate", 141),
            ("20000000-0000-0000-0000-000000000008", "ken.chan",       "PQR 1357",  VehicleType.car,        "Mitsubishi","Black",  VehicleStatus.pending,  False, None,        365),
            ("20000000-0000-0000-0000-000000000009", "bella.po",      "STU 8642",  VehicleType.motorcycle, "Honda",     "Green",  VehicleStatus.approved, False, "Back Gate", 104),
            ("20000000-0000-0000-0000-000000000010", "prof.cruz",     "VWX 9753",  VehicleType.truck,      "Isuzu",     "Yellow", VehicleStatus.approved, False, "Main Gate",  50),
            ("20000000-0000-0000-0000-000000000011", "nadine.lu",     "YZA 0246",  VehicleType.car,        "Kia",       "Orange", VehicleStatus.expired,  False, "Back Gate", -130),
            ("20000000-0000-0000-0000-000000000012", "prof.cruz",     "BCD 1122",  VehicleType.motorcycle, "Kawasaki",  "Black",  VehicleStatus.approved, True,  "Main Gate", 320),
        ]

        for row in vehicle_defs:
            (vid_str, owner_uname, plate, vtype, brand, color,
             vstatus, is_on_campus, last_gate, expiry_offset) = row

            vid = uuid.UUID(vid_str)
            owner_id = user_id_map.get(owner_uname, admin_uid)

            if not db.get(Vehicle, vid):
                db.add(Vehicle(
                    id=vid,
                    user_id=owner_id,
                    plate_number=plate,
                    type=vtype,
                    brand=brand,
                    color=color,
                    status=vstatus,
                    is_on_campus=is_on_campus,
                    last_seen_gate=last_gate,
                    last_seen_at=now - timedelta(hours=2) if last_gate else None,
                    expiry_date=now + timedelta(days=expiry_offset),
                    approved_by=admin_uid if vstatus == VehicleStatus.approved else None,
                    approved_at=now - timedelta(days=30) if vstatus == VehicleStatus.approved else None,
                ))

        db.flush()
        print(f"  [OK] {len(vehicle_defs)} vehicles seeded")

        # ── 5. ENTRY LOGS ────────────────────────────────────────────────────
        cam_main_entry = uuid.UUID("00000002-0000-0000-0000-000000000001")
        cam_back_entry = uuid.UUID("00000002-0000-0000-0000-000000000005")
        veh1 = uuid.UUID("20000000-0000-0000-0000-000000000001")
        veh2 = uuid.UUID("20000000-0000-0000-0000-000000000002")
        veh4 = uuid.UUID("20000000-0000-0000-0000-000000000004")
        veh5 = uuid.UUID("20000000-0000-0000-0000-000000000005")
        veh6 = uuid.UUID("20000000-0000-0000-0000-000000000006")
        veh7 = uuid.UUID("20000000-0000-0000-0000-000000000007")

        log_defs = [
            (veh4, "DEF 9012", cam_main_entry, gate_main_id, user_id_map["dr.santos"],     EntryDirection.entry, LogCategory.entry, "authorized",     now - timedelta(hours=2, minutes=5)),
            (veh1, "CAR 9610", cam_main_entry, gate_main_id, user_id_map["jessiebryn_v"],  EntryDirection.entry, LogCategory.entry, "authorized",     now - timedelta(hours=1, minutes=30)),
            (veh6, "JKL 7890", cam_main_entry, gate_main_id, user_id_map["engr.tan"],      EntryDirection.entry, LogCategory.entry, "authorized",     now - timedelta(hours=1)),
            (veh2, "XYZ 5678", cam_back_entry, gate_back_id, user_id_map["student_two"],   EntryDirection.entry, LogCategory.entry, "authorized",     now - timedelta(hours=2, minutes=42)),
            (veh5, "GHI 3456", cam_back_entry, gate_back_id, user_id_map["anna.reyes"],    EntryDirection.entry, LogCategory.entry, "authorized",     now - timedelta(hours=2, minutes=18)),
            (veh7, "MNO 2468", cam_back_entry, gate_back_id, user_id_map["liza.sober"],    EntryDirection.exit,  LogCategory.exit,  "authorized",     now - timedelta(hours=2, minutes=45)),
            (None, "UNK 0000", cam_main_entry, gate_main_id, None,                         EntryDirection.entry, LogCategory.alert, "unregistered",   now - timedelta(hours=3, minutes=15)),
            (None, "EXP 1111", cam_back_entry, gate_back_id, None,                         EntryDirection.entry, LogCategory.alert, "expired",        now - timedelta(hours=3, minutes=50)),
            (veh4, "DEF 9012", cam_main_entry, gate_main_id, user_id_map["dr.santos"],     EntryDirection.exit,  LogCategory.exit,  "authorized",     now - timedelta(hours=4, minutes=10)),
            (veh2, "XYZ 5678", cam_back_entry, gate_back_id, user_id_map["student_two"],   EntryDirection.exit,  LogCategory.exit,  "authorized",     now - timedelta(hours=5)),
        ]

        for (vid, plate, cam_id, g_id, uid, direction, category, auth, ts) in log_defs:
            db.add(EntryLog(
                id=uuid.uuid4(),
                vehicle_id=vid,
                detected_plate_number=plate,
                camera_id=cam_id,
                gate_id=g_id,
                user_id=uid,
                direction=direction,
                category=category,
                authorization_status=auth,
                confidence_score=97.5 if auth == "authorized" else 91.0,
                timestamp=ts,
                is_violation=(auth in ("unregistered", "expired")),
            ))

        db.commit()
        print(f"  [OK] {len(log_defs)} entry logs seeded")
        print("\n[DONE] Seed complete! Database is now populated with dummy data.")
        print("   Default password for all accounts: Password123!")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Seed failed: {e}")
        import traceback; traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    run()
