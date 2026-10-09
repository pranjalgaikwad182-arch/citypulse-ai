from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.db.session import Base

class Heritage(Base):
    __tablename__ = "heritage_sites"

    id = Column(Integer, primary_key=True, index=True)
    place_id = Column(Integer, ForeignKey("places.id"), nullable=False)
    historical_significance = Column(Text, nullable=False)
    era_period = Column(String, nullable=True) # e.g. "Maratha Empire (1732 AD)", "British Raj", "Rashtrakuta Dynasty"
    architectural_style = Column(String, nullable=True)
    visiting_info = Column(Text, nullable=True)
    verified_story = Column(Text, nullable=False)
    estimated_visit_mins = Column(Integer, default=60)
    source_attribution = Column(String, default="Archaeological Survey of India / Pune Municipal Heritage Cell")
