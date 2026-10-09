from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from datetime import datetime, timezone
from app.db.session import Base

class Place(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False) # Food, Cafe, Hotel, Tourist Attraction, Heritage, Park, Shopping, Hospital, Public Transport
    subcategory = Column(String, nullable=True)
    address = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    price_tier = Column(String, nullable=True) # "Free", "₹", "₹₹", "₹₹₹"
    avg_cost_inr = Column(Integer, nullable=True)
    rating = Column(Float, nullable=True)
    rating_source = Column(String, nullable=True)
    reviews_count = Column(Integer, default=0)
    opening_hours = Column(String, nullable=True)
    accessibility_wheelchair = Column(Boolean, default=False)
    is_family_friendly = Column(Boolean, default=True)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    source_name = Column(String, default="Pune Open Data / OSM")
    data_freshness = Column(String, default="Verified 2026")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
