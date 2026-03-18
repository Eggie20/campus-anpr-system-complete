from sqlalchemy import Column, String, Enum, DateTime, Boolean, TEXT, Index
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

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    
    # Matching PostgreSQL ENUM types
    role = Column(Enum(UserRole, name="user_role"), nullable=False, default=UserRole.student)
    status = Column(Enum(AccountStatus, name="account_status"), nullable=False, default=AccountStatus.pending)
    
    student_id = Column(String(50))
    department = Column(String(100))
    phone_number = Column(String(20))
    profile_image_url = Column(TEXT)
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))

    # Relationships
    vehicles = relationship("Vehicle", back_populates="owner")
    notifications = relationship("Notification", back_populates="user")
