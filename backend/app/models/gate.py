from sqlalchemy import Column, String, Enum, DateTime, TEXT
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.utils.database import Base

class GateStatus(str, enum.Enum):
    open = "open"
    closed = "closed"
    maintenance = "maintenance"

class Gate(Base):
    __tablename__ = "gates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    location_description = Column(TEXT)
    status = Column(Enum(GateStatus, name="gate_status"), default=GateStatus.open)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    cameras = relationship("Camera", back_populates="gate")
