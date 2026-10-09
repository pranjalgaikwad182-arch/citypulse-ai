from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from datetime import datetime, timezone
from app.db.session import Base

class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String, nullable=False) # e.g. "X (Twitter) Civic Feed", "Pune Citizen Forum", "Reddit r/pune RSS"
    author = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    original_link = Column(String, nullable=True)
    category = Column(String, nullable=False) # "Traffic", "Waterlogging", "Cultural Event", "Civic Grievance"
    location_name = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    is_demo: Column[bool] = Column(Boolean, default=True)
    verification_status = Column(String, default="Unverified Community Observation")
    published_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
