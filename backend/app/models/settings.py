from sqlalchemy import Column, String, JSON, DateTime
from sqlalchemy.sql import func
from app.utils.database import Base

class Setting(Base):
    __tablename__ = "settings"

    key = Column(String(50), primary_key=True)
    value = Column(JSON, nullable=False)
    description = Column(String(255))
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
