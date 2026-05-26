from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Enum, Float, Boolean, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.utils.database import Base

class EntryDirection(str, enum.Enum):
    entry = "entry"
    exit = "exit"

class LogCategory(str, enum.Enum):
    entry = "entry"
    exit = "exit"
    alert = "alert"
    system = "system"

class EntryLog(Base):
    __tablename__ = "entry_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camera_id = Column(UUID(as_uuid=True), ForeignKey("cameras.id"), nullable=True)
    gate_id = Column(UUID(as_uuid=True), ForeignKey("gates.id"), nullable=True)
    
    detected_plate_number = Column(String(20), nullable=False, index=True)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    direction = Column(Enum(EntryDirection, name="entry_direction"), nullable=False)
    category = Column(Enum(LogCategory, name="log_category"), default=LogCategory.entry)
    confidence_score = Column(Numeric(5, 2))
    snapshot_image_url = Column(String(255))
    
    # Authorization result
    authorization_status = Column(String(30), default='authorized') # authorized, unregistered, expired, blacklisted
    is_violation = Column(Boolean, default=False)
    requires_manual_verification = Column(Boolean, default=False)
    
    # Relationships
    vehicle = relationship("Vehicle", back_populates="entry_logs")
    user = relationship("User")
    gate = relationship("Gate")
    camera = relationship("Camera")
