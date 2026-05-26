from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean, TEXT
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.utils.database import Base

class BlacklistRecord(Base):
    __tablename__ = "blacklist_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=False)
    reason = Column(TEXT, nullable=False)
    added_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True)) # Null = permanent
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    vehicle = relationship("Vehicle")
    admin = relationship("User")
