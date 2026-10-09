from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime, timezone
from app.db.session import Base

class TrafficIncident(Base):
    __tablename__ = "traffic_incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_type = Column(String, nullable=False) # "Congestion", "Accident", "Roadwork", "Road Closure", "Waterlogging"
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    severity = Column(String, default="Moderate") # "Low", "Moderate", "High", "Critical"
    delay_mins = Column(Integer, default=10)
    source = Column(String, default="Pune Traffic Police Advisory (Demo Feed)")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
