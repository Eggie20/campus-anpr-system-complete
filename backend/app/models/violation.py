from sqlalchemy import Column, String, ForeignKey, DateTime, TEXT, DECIMAL, Numeric, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.utils.database import Base

class ViolationType(str, enum.Enum):
    unregistered = "unregistered"
    blacklisted = "blacklisted"
    speeding = "speeding"
    wrong_way = "wrong_way"
    unauthorized_access = "unauthorized_access"
    expired_registration = "expired_registration"

class Violation(Base):
    __tablename__ = "violations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entry_log_id = Column(UUID(as_uuid=True), ForeignKey("entry_logs.id"), nullable=False)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"))
    type = Column(Enum(ViolationType, name="violation_type"), nullable=False)
    description = Column(TEXT)
    fine_amount = Column(Numeric(10, 2), default=0.00)
    status = Column(String(20), default='unresolved') # unresolved, resolved, escalated
    resolved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    resolved_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    entry_log = relationship("EntryLog")
    vehicle = relationship("Vehicle")
    resolver = relationship("User", foreign_keys=[resolved_by])
