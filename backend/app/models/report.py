from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime, timezone
from app.db.session import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_code = Column(String, unique=True, index=True, nullable=False) # e.g. "REP-2026-0042"
    title = Column(String, nullable=False)
    category = Column(String, index=True, nullable=False) # "Accident", "Road Closure", "Waterlogging", "Broken Streetlight", "Harassment / Unsafe Condition", "Pothole & Roadwork", "Other Hazard"
    description = Column(Text, nullable=False)
    severity = Column(String, default="Medium") # "Low", "Medium", "High"
    status = Column(String, default="Submitted", index=True) # "Submitted", "Under Review", "Verified", "Resolved", "Rejected"
    
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    address = Column(String, nullable=False)
    
    # Media paths
    photo_url = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)
    
    # NLP & Verification Metadata
    reporter_name = Column(String, default="Anonymous Citizen")
    duplicate_of_id = Column(Integer, nullable=True)
    ai_category_tag = Column(String, nullable=True)
    urgency_score = Column(Float, default=0.5)
    verification_notes = Column(Text, nullable=True)
    verified_by = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
