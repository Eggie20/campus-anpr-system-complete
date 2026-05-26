from sqlalchemy import Column, String, Enum, DateTime, Boolean, TEXT, Index, Date, Computed
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.utils.database import Base

class UserRole(str, enum.Enum):
    admin = "admin"
    student = "student"
    faculty = "faculty"
    security = "security"
    staff = "staff"
    visitor = "visitor"

class AccountStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    suspended = "suspended"
    rejected = "rejected"
    inactive = "inactive"

class SexType(str, enum.Enum):
    Male = "Male"
    Female = "Female"
    Other = "Other"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole, name="user_role"), nullable=False, default=UserRole.student)
    status = Column(Enum(AccountStatus, name="account_status"), nullable=False, default=AccountStatus.pending)
    
    # Legal Identity
    first_name = Column(String(100), nullable=False)
    middle_name = Column(String(100))
    last_name = Column(String(100), nullable=False)
    full_name = Column(String(255), Computed("TRIM(first_name || ' ' || COALESCE(middle_name || ' ', '') || last_name)", persisted=True))
    sex = Column(Enum(SexType, name="sex_type"))
    birth_date = Column(Date)
    nationality = Column(String(50), default='Filipino')
    
    # Contact & Communications
    phone_number = Column(String(20))
    address = Column(TEXT)
    
    # Institutional Data
    student_id = Column(String(50))
    department = Column(String(100))
    academic_program = Column(String(100))
    year_level = Column(String(20))
    section = Column(String(50))          # NEW: "Section A"

    # Faculty Data
    faculty_id = Column(String(50))
    position = Column(String(100))
    employment_type = Column(String(50))  # "Regular", "Part-time"

    # Staff Data
    staff_id = Column(String(50))
    staff_department = Column(String(100))
    job_title = Column(String(100))
    employment_status = Column(String(50)) # "Active", "On-Leave"

    # Visitor Data
    visitor_purpose = Column(String(100))
    visitor_host = Column(String(100))
    visitor_reason = Column(TEXT)
    visitor_valid_id = Column(String(100))
    visitor_date = Column(Date)
    visitor_duration = Column(String(50))
    entry_motive = Column(String(100))

    # Driver's License
    drivers_license_no = Column(String(50))
    license_expiry_date = Column(Date)

    # Registration Token & Secure File Paths
    registration_token = Column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    id_photo_path = Column(TEXT)       # Server-side path to ID photo
    orcr_photo_path = Column(TEXT)     # Server-side path to OR/CR document
    qr_code_path = Column(TEXT)        # Server-side path to QR code image
    
    profile_image_url = Column(TEXT)
    
    last_login_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))

    # Relationships
    vehicles = relationship("Vehicle", back_populates="owner", foreign_keys="[Vehicle.user_id]")
    notifications = relationship("Notification", back_populates="user")
