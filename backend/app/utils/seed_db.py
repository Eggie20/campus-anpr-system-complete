import sys
import os
from datetime import datetime, date, timedelta

# Add the parent directory to sys.path to allow importing from 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.utils.database import SessionLocal, engine, Base
from app.models.user import User, UserRole, AccountStatus, SexType
from app.models.vehicle import Vehicle, VehicleType, VehicleStatus
from app.utils.security import get_password_hash

def seed():
    db = SessionLocal()
    
    try:
        now = datetime.now()

        # ── 1. Admin ──
        admin_email = "admin@example.com"
        if not db.query(User).filter(User.email == admin_email).first():
            admin = User(
                email=admin_email,
                username="admin",
                password_hash=get_password_hash("AdminPassword123"),
                role=UserRole.admin,
                status=AccountStatus.active,
                first_name="System",
                last_name="Admin",
                phone_number="09000000000"
            )
            db.add(admin)
            print("[+] Added Admin user.")

        # ── 2. Security ──
        security_email = "security@example.com"
        if not db.query(User).filter(User.email == security_email).first():
            security = User(
                email=security_email,
                username="security",
                password_hash=get_password_hash("SecurityPassword123"),
                role=UserRole.security,
                status=AccountStatus.active,
                first_name="Guard",
                last_name="Reyes",
                sex=SexType.Male,
                phone_number="09111112222"
            )
            db.add(security)
            db.flush()

            v_sec = Vehicle(
                user_id=security.id,
                plate_number="SEC 1001",
                type=VehicleType.motorcycle,
                brand="Yamaha",
                color="Black",
                status=VehicleStatus.approved,
                registration_date=now,
                expiry_date=now + timedelta(days=365),
                is_on_campus=False
            )
            db.add(v_sec)
            print("[+] Added Security user + vehicle.")

        # ── 3. Student ──
        student_email = "student@example.com"
        if not db.query(User).filter(User.email == student_email).first():
            student = User(
                email=student_email,
                username="student",
                password_hash=get_password_hash("StudentPassword123"),
                role=UserRole.student,
                status=AccountStatus.active,
                first_name="Campus",
                last_name="Student",
                sex=SexType.Male,
                birth_date=date(2002, 5, 15),
                phone_number="09123456789",
                address="Cabadbaran City, Agusan del Norte",
                student_id="2024-0001",
                department="College of Engineering and Information Technology",
                academic_program="BS Computer Science",
                year_level="4th Year",
                section="Section A",
                drivers_license_no="N01-24-123456"
            )
            db.add(student)
            db.flush()

            v_stu = Vehicle(
                user_id=student.id,
                plate_number="XYZ 5678",
                type=VehicleType.motorcycle,
                brand="Honda",
                color="Black",
                status=VehicleStatus.approved,
                registration_date=now,
                expiry_date=now + timedelta(days=365),
                is_on_campus=False
            )
            db.add(v_stu)
            print("[+] Added Student user + vehicle.")

        # ── 4. Faculty ──
        faculty_email = "faculty@example.com"
        if not db.query(User).filter(User.email == faculty_email).first():
            faculty = User(
                email=faculty_email,
                username="faculty",
                password_hash=get_password_hash("FacultyPassword123"),
                role=UserRole.faculty,
                status=AccountStatus.active,
                first_name="Maria",
                last_name="Santos",
                sex=SexType.Female,
                phone_number="09223334444",
                faculty_id="FAC-2024-055",
                department="Information Technology",
                position="Assistant Professor",
                employment_type="Regular"
            )
            db.add(faculty)
            db.flush()

            v_fac = Vehicle(
                user_id=faculty.id,
                plate_number="ABC 1234",
                type=VehicleType.car,
                brand="Toyota",
                color="Silver",
                status=VehicleStatus.approved,
                registration_date=now,
                expiry_date=now + timedelta(days=365),
                is_on_campus=False
            )
            db.add(v_fac)
            print("[+] Added Faculty user + vehicle.")

        # ── 5. Staff ──
        staff_email = "staff@example.com"
        if not db.query(User).filter(User.email == staff_email).first():
            staff = User(
                email=staff_email,
                username="staff",
                password_hash=get_password_hash("StaffPassword123"),
                role=UserRole.staff,
                status=AccountStatus.active,
                first_name="Pedro",
                last_name="Penduko",
                sex=SexType.Male,
                phone_number="09334445555",
                staff_id="STF-2024-999",
                staff_department="Registrar Office",
                job_title="Administrative Officer",
                employment_status="Active"
            )
            db.add(staff)
            db.flush()

            v_staff = Vehicle(
                user_id=staff.id,
                plate_number="STF 7890",
                type=VehicleType.car,
                brand="Mitsubishi",
                color="White",
                status=VehicleStatus.approved,
                registration_date=now,
                expiry_date=now + timedelta(days=365),
                is_on_campus=False
            )
            db.add(v_staff)
            print("[+] Added Staff user + vehicle.")

        # ── 6. Visitor ──
        visitor_email = "visitor@example.com"
        if not db.query(User).filter(User.email == visitor_email).first():
            visitor = User(
                email=visitor_email,
                username="visitor",
                password_hash=get_password_hash("VisitorPassword123"),
                role=UserRole.visitor,
                status=AccountStatus.active,
                first_name="Charlie",
                last_name="Guest",
                visitor_purpose="Official Meeting",
                visitor_host="Dr. Robert Smith",
                visitor_reason="Research Collaboration",
                visitor_date=date.today(),
                visitor_duration="2 Hours",
                entry_motive="Research"
            )
            db.add(visitor)
            db.flush()

            v_vis = Vehicle(
                user_id=visitor.id,
                plate_number="VIS 4321",
                type=VehicleType.other,
                other_vehicle_type="Tricycle",
                brand="Kawasaki",
                color="Blue",
                status=VehicleStatus.pending,
                registration_date=now,
                expiry_date=now + timedelta(days=365),
                is_on_campus=False
            )
            db.add(v_vis)
            print("[+] Added Visitor user + vehicle.")

        db.commit()
        print("\nSeeding completed successfully!")
        
    except Exception as e:
        print(f"ERROR during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
