from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.schemas import PlaceComparisonRequest, PlaceComparisonResponse
from app.services.comparison_service import evaluate_place_comparison

router = APIRouter()

@router.post("/compare", response_model=PlaceComparisonResponse)
def compare_places(req: PlaceComparisonRequest, db: Session = Depends(get_db)):
    if len(req.place_ids) < 2 or len(req.place_ids) > 4:
        raise HTTPException(status_code=400, detail="Please select between 2 and 4 places for comparison.")
    try:
        return evaluate_place_comparison(req, db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
