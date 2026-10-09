from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.community import CommunityPost
from app.schemas.schemas import CommunityPostOut

router = APIRouter()

@router.get("", response_model=List[CommunityPostOut])
def get_community_posts(db: Session = Depends(get_db)):
    return db.query(CommunityPost).order_by(CommunityPost.published_at.desc()).all()
