from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.utils.database import Base

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
    expired = "expired"

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    plate_number = Column(String(20), unique=True, nullable=False, index=True)
    type = Column(Enum(VehicleType, name="vehicle_type"), nullable=False)
    make = Column(String(50))
    model = Column(String(50))
    color = Column(String(30))
    
    status = Column(Enum(VehicleStatus, name="vehicle_status"), default=VehicleStatus.pending)
    
    # Registration details
    registration_date = Column(DateTime(timezone=True))
    expiry_date = Column(DateTime(timezone=True))
    qr_code = Column(String(255)) # URL or code string
    or_cr_url = Column(String(255))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="vehicles")
    entry_logs = relationship("EntryLog", back_populates="vehicle")

# Add back_populates to User model later
