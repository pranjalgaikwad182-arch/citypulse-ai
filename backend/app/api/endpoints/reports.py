import os
import uuid
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.report import Report
from app.models.user import User
from app.core.config import settings
from app.core.nlp import classify_incident_text, compute_urgency_score, detect_potential_duplicates
from app.schemas.schemas import ReportOut, ReportUpdate, DuplicateCheckResponse
from app.api.deps import get_current_user, get_current_admin_user

router = APIRouter()

@router.get("", response_model=List[ReportOut])
def list_reports(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    q = db.query(Report).order_by(Report.created_at.desc())
    if category and category != "All":
        q = q.filter(Report.category == category)
    if status and status != "All":
        q = q.filter(Report.status == status)
    if severity and severity != "All":
        q = q.filter(Report.severity == severity)
        
    return q.offset(offset).limit(limit).all()

@router.post("/check-duplicate", response_model=DuplicateCheckResponse)
def check_duplicate_report(
    description: str = Form(...),
    lat: float = Form(...),
    lng: float = Form(...),
    severity: str = Form("Medium"),
    db: Session = Depends(get_db)
):
    inferred_category = classify_incident_text(description)
    urgency_score = compute_urgency_score(description, severity)

    # Fetch recent active reports
    existing = db.query(Report).filter(Report.status.in_(["Submitted", "Under Review", "Verified"])).all()
    existing_dicts = [
        {
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "lat": r.lat,
            "lng": r.lng,
            "status": r.status,
            "created_at": r.created_at
        }
        for r in existing
    ]

    duplicates = detect_potential_duplicates(
        new_text=description,
        new_lat=lat,
        new_lng=lng,
        existing_reports=existing_dicts
    )

    return DuplicateCheckResponse(
        has_duplicates=len(duplicates) > 0,
        suggested_duplicates=duplicates,
        inferred_category=inferred_category,
        urgency_score=urgency_score
    )

@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
async def create_report(
    title: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    severity: str = Form("Medium"),
    lat: float = Form(...),
    lng: float = Form(...),
    address: str = Form(...),
    reporter_name: Optional[str] = Form("Anonymous Citizen"),
    photo: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # Safe validation of files
    photo_rel_url = None
    if photo and photo.filename:
        ext = Path(photo.filename).suffix.lower()
        if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Unsupported image type: {ext}. Allowed: {settings.ALLOWED_IMAGE_EXTENSIONS}")
        
        safe_photo_name = f"{uuid.uuid4().hex}{ext}"
        photo_path = settings.UPLOAD_DIR / "photos" / safe_photo_name
        contents = await photo.read()
        if len(contents) > settings.MAX_IMAGE_SIZE_MB * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"Image exceeds size limit of {settings.MAX_IMAGE_SIZE_MB}MB")
        with open(photo_path, "wb") as f:
            f.write(contents)
        photo_rel_url = f"/uploads/photos/{safe_photo_name}"

    audio_rel_url = None
    if audio and audio.filename:
        ext = Path(audio.filename).suffix.lower()
        if ext not in settings.ALLOWED_AUDIO_EXTENSIONS:
            # Browser MediaRecorder defaults to webm
            ext = ".webm"
        
        safe_audio_name = f"{uuid.uuid4().hex}{ext}"
        audio_path = settings.UPLOAD_DIR / "audio" / safe_audio_name
        contents = await audio.read()
        if len(contents) > settings.MAX_AUDIO_SIZE_MB * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"Audio exceeds size limit of {settings.MAX_AUDIO_SIZE_MB}MB")
        with open(audio_path, "wb") as f:
            f.write(contents)
        audio_rel_url = f"/uploads/audio/{safe_audio_name}"

    # AI NLP Classification & Urgency
    ai_tag = classify_incident_text(description)
    urgency = compute_urgency_score(description, severity)

    # Check for potential duplicates
    existing = db.query(Report).filter(Report.status.in_(["Submitted", "Under Review", "Verified"])).all()
    existing_dicts = [
        {"id": r.id, "title": r.title, "description": r.description, "lat": r.lat, "lng": r.lng, "status": r.status, "created_at": r.created_at}
        for r in existing
    ]
    duplicates = detect_potential_duplicates(
        new_text=f"{title} {description}",
        new_lat=lat,
        new_lng=lng,
        existing_reports=existing_dicts
    )
    duplicate_of = duplicates[0]["report_id"] if duplicates else None

    # Generate unique report code
    count = db.query(Report).count() + 1
    report_code = f"REP-{datetime.now().year}-{count:04d}"

    report = Report(
        report_code=report_code,
        title=title.strip(),
        category=category,
        description=description.strip(),
        severity=severity,
        status="Submitted", # Stays Submitted until reviewed by admin/moderator
        lat=lat,
        lng=lng,
        address=address.strip(),
        photo_url=photo_rel_url,
        audio_url=audio_rel_url,
        reporter_name=reporter_name or "Anonymous Citizen",
        duplicate_of_id=duplicate_of,
        ai_category_tag=ai_tag,
        urgency_score=urgency
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return report

@router.get("/{report_id}", response_model=ReportOut)
def get_report_by_id(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Incident report not found")
    return report

@router.patch("/{report_id}", response_model=ReportOut)
def update_report_status(
    report_id: int,
    update_data: ReportUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Incident report not found")

    if update_data.status:
        valid_statuses = ["Submitted", "Under Review", "Verified", "Resolved", "Rejected"]
        if update_data.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Choose from: {valid_statuses}")
        report.status = update_data.status
        if update_data.status == "Verified":
            report.verified_by = admin.full_name or admin.email

    if update_data.duplicate_of_id is not None:
        report.duplicate_of_id = update_data.duplicate_of_id

    if update_data.verification_notes is not None:
        report.verification_notes = update_data.verification_notes

    if update_data.severity:
        report.severity = update_data.severity

    db.commit()
    db.refresh(report)
    return report

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Incident report not found")
    db.delete(report)
    db.commit()
    return None
