import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings:
    PROJECT_NAME: str = "CityPulse AI"
    TAGLINE: str = "Explore Smarter. Travel Safer. Experience More."
    DEFAULT_CITY: str = "Pune"
    DEFAULT_STATE: str = "Maharashtra"
    DEFAULT_COUNTRY: str = "India"
    DEFAULT_LAT: float = 18.5204
    DEFAULT_LNG: float = 73.8567
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/citypulse.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "citypulse-hackathon-super-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # External APIs (Optional - app gracefully runs in DEMO mode if missing)
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-1.5-flash")
    OSRM_ROUTING_URL: str = os.getenv("OSRM_ROUTING_URL", "https://router.project-osrm.org")
    
    # Uploads
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    MAX_IMAGE_SIZE_MB: int = 10
    MAX_AUDIO_SIZE_MB: int = 25
    ALLOWED_IMAGE_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".webp"}
    ALLOWED_AUDIO_EXTENSIONS: set = {".webm", ".ogg", ".wav", ".mp3", ".m4a"}

settings = Settings()
