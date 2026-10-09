from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.schemas import AIChatRequest, AIChatResponse
from app.services.ai_service import process_ai_chat

router = APIRouter()

@router.post("/chat", response_model=AIChatResponse)
async def ai_chat(req: AIChatRequest, db: Session = Depends(get_db)):
    return await process_ai_chat(req, db)
