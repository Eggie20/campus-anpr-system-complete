import enum
import uuid

from sqlalchemy import Column, String, ForeignKey, DateTime, Enum, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.utils.database import Base


class AnprAlertKind(str, enum.Enum):
    access = "access"
    anomaly_unregistered = "anomaly_unregistered"
    anomaly_low_confidence = "anomaly_low_confidence"
    anomaly_rapid_movement = "anomaly_rapid_movement"
    anomaly_frequent_unregistered = "anomaly_frequent_unregistered"
    breach_blacklisted = "breach_blacklisted"
    breach_expired = "breach_expired"
    breach_rejected = "breach_rejected"


class AnprPlateCapture(Base):
    __tablename__ = "anpr_plate_captures"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plate_normalized = Column(String(20), nullable=False, index=True)
    plate_raw = Column(String(40))
    confidence_score = Column(Numeric(5, 2))
    brand = Column(String(80))
    color = Column(String(80))
    vehicle_type_detected = Column(String(50))
    camera_id = Column(UUID(as_uuid=True), ForeignKey("cameras.id"), nullable=True)
    gate_id = Column(UUID(as_uuid=True), ForeignKey("gates.id"), nullable=True)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=True)
    recorded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    alert_kind = Column(Enum(AnprAlertKind, name="anpr_alert_kind"), nullable=False)
    payload = Column(JSONB)
    entry_log_id = Column(UUID(as_uuid=True), ForeignKey("entry_logs.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    camera = relationship("Camera")
    gate = relationship("Gate")
    vehicle = relationship("Vehicle")
    recorder = relationship("User", foreign_keys=[recorded_by])
    entry_log = relationship("EntryLog")
    anomaly_events = relationship("AnprAnomalyEvent", back_populates="capture")


class AnprAnomalyEvent(Base):
    __tablename__ = "anpr_anomaly_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    capture_id = Column(UUID(as_uuid=True), ForeignKey("anpr_plate_captures.id"), nullable=False)
    kind = Column(Enum(AnprAlertKind, name="anpr_alert_kind"), nullable=False)
    status = Column(String(20), default="open")
    notes = Column(Text, nullable=True)
    tags = Column(JSONB, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    capture = relationship("AnprPlateCapture", back_populates="anomaly_events")
