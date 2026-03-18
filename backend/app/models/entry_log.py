from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Enum, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.utils.database import Base

class EntryDirection(str, enum.Enum):
    entry = "entry"
    exit = "exit"

class EntryLog(Base):
    __tablename__ = "entry_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=True) # Nullable if unregistered
    
    plate_number = Column(String(20), nullable=False, index=True) # Store plate even if vehicle not found
    direction = Column(Enum(EntryDirection, name="entry_direction"), nullable=False)
    gate_name = Column(String(50), nullable=False)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    confidence_score = Column(Float)
    snapshot_url = Column(String(255))
    
    is_unregistered = Column(Boolean, default=False)
    notes = Column(String(255))
    
    # Relationships
    vehicle = relationship("Vehicle", back_populates="entry_logs")
