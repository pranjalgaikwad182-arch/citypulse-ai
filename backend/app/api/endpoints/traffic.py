from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.traffic import TrafficIncident
from app.schemas.schemas import TrafficIncidentOut

router = APIRouter()

@router.get("", response_model=List[TrafficIncidentOut])
def get_traffic_incidents(db: Session = Depends(get_db)):
    return db.query(TrafficIncident).filter(TrafficIncident.is_active == True).order_by(TrafficIncident.created_at.desc()).all()
