from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.place import Place
from app.schemas.schemas import PlaceOut

router = APIRouter()

@router.get("", response_model=List[PlaceOut])
def get_places(
    category: Optional[str] = Query(None, description="Filter by category e.g. Food, Heritage, Park"),
    max_budget: Optional[int] = Query(None, description="Max budget in INR"),
    min_rating: Optional[float] = Query(None, description="Minimum rating"),
    wheelchair_only: Optional[bool] = Query(False, description="Require wheelchair accessibility"),
    family_only: Optional[bool] = Query(False, description="Require family friendly"),
    query: Optional[str] = Query(None, description="Search term in name or description"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    q = db.query(Place)
    if category and category != "All":
        q = q.filter(Place.category == category)
    if max_budget is not None:
        q = q.filter(Place.avg_cost_inr <= max_budget)
    if min_rating is not None:
        q = q.filter(Place.rating >= min_rating)
    if wheelchair_only:
        q = q.filter(Place.accessibility_wheelchair == True)
    if family_only:
        q = q.filter(Place.is_family_friendly == True)
    if query:
        search_fmt = f"%{query}%"
        q = q.filter((Place.name.ilike(search_fmt)) | (Place.description.ilike(search_fmt)) | (Place.address.ilike(search_fmt)))

    places = q.offset(offset).limit(limit).all()
    return places

@router.get("/{place_id}", response_model=PlaceOut)
def get_place_by_id(place_id: int, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place
