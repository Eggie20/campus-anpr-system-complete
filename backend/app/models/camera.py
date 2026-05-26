from sqlalchemy import Column, String, Enum, DateTime, Boolean, TEXT, Integer, ForeignKey, DECIMAL, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.utils.database import Base

class CameraRecordingMode(str, enum.Enum):
    always = "always"
    motion = "motion"
    plate = "plate"

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    gate_id = Column(UUID(as_uuid=True), ForeignKey("gates.id"), nullable=True)
    name = Column(String(100), nullable=False)
    position = Column(String(50))
    ip_address = Column(String(45))
    stream_url = Column(TEXT)
    direction = Column(String(10), default='entry') # entry / exit
    is_active = Column(Boolean, default=True)
    is_streaming = Column(Boolean, default=False)

    # Status tracking
    last_plate_detected = Column(String(20))
    last_plate_detected_at = Column(DateTime(timezone=True))
    offline_since = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    gate = relationship("Gate", back_populates="cameras")
    settings = relationship("CameraSettings", back_populates="camera", uselist=False)

class CameraSettings(Base):
    __tablename__ = "camera_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camera_id = Column(UUID(as_uuid=True), ForeignKey("cameras.id"), unique=True)
    detection_threshold = Column(Integer, default=85)
    recording_mode = Column(Enum(CameraRecordingMode, name="camera_recording_mode"), default=CameraRecordingMode.motion)
    ai_night_vision = Column(Boolean, default=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    camera = relationship("Camera", back_populates="settings")

    __table_args__ = (
        CheckConstraint('detection_threshold >= 0 AND detection_threshold <= 100', name='check_detection_threshold'),
    )
