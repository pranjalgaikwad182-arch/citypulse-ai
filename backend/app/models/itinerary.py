from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime, timezone
from app.db.session import Base

class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True) # Optional for guest sessions
    title = Column(String, nullable=False)
    starting_location = Column(String, nullable=False)
    available_time_hours = Column(Float, default=4.0)
    budget_inr = Column(Integer, default=1500)
    travel_mode = Column(String, default="driving") # "walking", "transit", "driving", "cycling"
    preferred_interests = Column(String, nullable=True)
    total_duration_mins = Column(Integer, default=180)
    estimated_cost_inr = Column(Integer, default=500)
    stops_json = Column(Text, nullable=False) # JSON encoded list of stops
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
