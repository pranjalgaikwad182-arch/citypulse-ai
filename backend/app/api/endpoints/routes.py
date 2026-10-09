from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.schemas import RouteCompareRequest, RouteCompareResponse
from app.services.routing_service import compare_route_alternatives

router = APIRouter()

@router.post("/compare", response_model=RouteCompareResponse)
def compare_routes(req: RouteCompareRequest, db: Session = Depends(get_db)):
    try:
        return compare_route_alternatives(req, db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
