from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.heritage import Heritage
from app.models.place import Place
from app.schemas.schemas import HeritageOut

router = APIRouter()

@router.get("", response_model=List[HeritageOut])
def get_heritage_sites(db: Session = Depends(get_db)):
    results = (
        db.query(Heritage, Place)
        .join(Place, Heritage.place_id == Place.id)
        .all()
    )
    
    items = []
    for h, p in results:
        items.append(HeritageOut(
            id=h.id,
            place_id=p.id,
            name=p.name,
            address=p.address,
            lat=p.lat,
            lng=p.lng,
            image_url=p.image_url,
            historical_significance=h.historical_significance,
            era_period=h.era_period,
            architectural_style=h.architectural_style,
            visiting_info=h.visiting_info,
            verified_story=h.verified_story,
            estimated_visit_mins=h.estimated_visit_mins,
            source_attribution=h.source_attribution
        ))
    return items

@router.get("/{heritage_id}/story")
def get_heritage_story(heritage_id: int, db: Session = Depends(get_db)):
    h = db.query(Heritage).filter(Heritage.id == heritage_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Heritage site not found")
    p = db.query(Place).filter(Place.id == h.place_id).first()
    
    return {
        "id": h.id,
        "place_name": p.name if p else "Historical Site",
        "era_period": h.era_period,
        "architectural_style": h.architectural_style,
        "verified_story": h.verified_story,
        "source_attribution": h.source_attribution,
        "historical_significance": h.historical_significance,
        "visiting_info": h.visiting_info
    }
