import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.db.seed_data import seed_database

# Routers
from app.api.endpoints.auth import router as auth_router
from app.api.endpoints.places import router as places_router
from app.api.endpoints.heritage import router as heritage_router
from app.api.endpoints.reports import router as reports_router
from app.api.endpoints.comparison import router as comparison_router
from app.api.endpoints.routes import router as routes_router
from app.api.endpoints.ai import router as ai_router
from app.api.endpoints.weather import router as weather_router
from app.api.endpoints.traffic import router as traffic_router
from app.api.endpoints.community import router as community_router
from app.api.endpoints.itineraries import router as itineraries_router
from app.api.endpoints.analytics import router as analytics_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    Base.metadata.create_all(bind=engine)
    # Ensure upload directories exist
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    (settings.UPLOAD_DIR / "photos").mkdir(parents=True, exist_ok=True)
    (settings.UPLOAD_DIR / "audio").mkdir(parents=True, exist_ok=True)
    # Seed data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CityPulse AI: Smart City Exploration, Safety and Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static file uploads
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# Health check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "city": settings.DEFAULT_CITY,
        "state": settings.DEFAULT_STATE,
        "platform": settings.PROJECT_NAME,
        "version": "1.0.0",
        "mode": "Demonstration & Civic Intelligence Ready"
    }

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(places_router, prefix="/api/places", tags=["Places & Discovery"])
app.include_router(heritage_router, prefix="/api/heritage", tags=["Heritage & Culture"])
app.include_router(reports_router, prefix="/api/reports", tags=["Citizen Reports"])
app.include_router(comparison_router, prefix="/api/places", tags=["Place Comparison"])
app.include_router(routes_router, prefix="/api/routes", tags=["Risk-Aware Routing"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI City Companion"])
app.include_router(weather_router, prefix="/api/weather", tags=["Weather"])
app.include_router(traffic_router, prefix="/api/traffic", tags=["Traffic & Road Conditions"])
app.include_router(community_router, prefix="/api/community", tags=["Community Intelligence"])
app.include_router(itineraries_router, prefix="/api/itineraries", tags=["Smart Itinerary"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["City Analytics"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
