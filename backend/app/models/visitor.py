from sqlalchemy import Column, String, ForeignKey, DateTime, TEXT
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.utils.database import Base

class Visitor(Base):
    __tablename__ = "visitors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(255), nullable=False)
    phone_number = Column(String(20))
    purpose_of_visit = Column(TEXT)
    host_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    id_type = Column(String(50))
    id_number = Column(String(50))

    check_in_at = Column(DateTime(timezone=True), server_default=func.now())
    check_out_at = Column(DateTime(timezone=True))
    gate_id = Column(UUID(as_uuid=True), ForeignKey("gates.id"))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    host = relationship("User", foreign_keys=[host_user_id])
    officer = relationship("User", foreign_keys=[created_by])
    gate = relationship("Gate")
    vehicles = relationship("VisitorVehicle", back_populates="visitor")

class VisitorVehicle(Base):
    __tablename__ = "visitor_vehicles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    visitor_id = Column(UUID(as_uuid=True), ForeignKey("visitors.id"), nullable=False)
    plate_number = Column(String(20), nullable=False)
    type = Column(String(20), default='car')
    brand = Column(String(50))
    color = Column(String(30))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    visitor = relationship("Visitor", back_populates="vehicles")
