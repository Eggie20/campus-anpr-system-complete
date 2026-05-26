from sqlalchemy import Column, String, ForeignKey, DateTime, Enum, Boolean, TEXT
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.utils.database import Base

# NOTE: Run this migration to add the column:
# ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS orcr_photo_path TEXT;

class VehicleType(str, enum.Enum):
    car = "car"
    motorcycle = "motorcycle"
    van = "van"
    truck = "truck"
    other = "other"

class VehicleStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    blacklisted = "blacklisted"
    expired = "expired"

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    plate_number = Column(String(20), unique=True, nullable=False, index=True)
    type = Column(Enum(VehicleType, name="vehicle_type"), nullable=False, default=VehicleType.car)
    brand = Column(String(50))
    color = Column(String(30))
    other_vehicle_type = Column(String(50)) # Custom type if type is 'other'

    # ANPR Status
    anpr_flagged = Column(Boolean, default=False)
    anpr_flag_msg = Column(TEXT)
    
    status = Column(Enum(VehicleStatus, name="vehicle_status"), default=VehicleStatus.pending)
    
    # Permit tracking
    registration_date = Column(DateTime(timezone=True), server_default=func.now())
    expiry_date = Column(DateTime(timezone=True))
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    approved_at = Column(DateTime(timezone=True))
    
    # Real-time campus tracking
    is_on_campus = Column(Boolean, default=False)
    last_seen_gate = Column(String(100))
    last_seen_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))
    orcr_photo_path = Column(TEXT)  # Secure path to OR/CR document

    # Relationships
    owner = relationship("User", back_populates="vehicles", foreign_keys=[user_id])
    approver = relationship("User", foreign_keys=[approved_by])
    entry_logs = relationship("EntryLog", back_populates="vehicle")

# Add back_populates to User model later
