import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.utils.database import Base


class OcrScan(Base):
    __tablename__ = "ocr_scans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    scan_type = Column(String(30), nullable=False, default="drivers_license")
    front_image_url = Column(Text, nullable=True)
    back_image_url = Column(Text, nullable=True)
    extracted_data = Column(JSONB, nullable=True)
    confidence_score = Column(Numeric(5, 2), nullable=True)
    is_verified = Column(Boolean, nullable=False, default=False)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    scan_id = Column(String(80), nullable=True)
    raw_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])
    verifier = relationship("User", foreign_keys=[verified_by])
