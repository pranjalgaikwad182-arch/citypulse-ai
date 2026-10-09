from fastapi import APIRouter, Query
from app.schemas.schemas import WeatherResponse
from app.services.weather_service import get_current_weather

router = APIRouter()

@router.get("", response_model=WeatherResponse)
async def get_weather(
    city: str = Query("Pune"),
    lat: float = Query(18.5204),
    lng: float = Query(73.8567)
):
    return await get_current_weather(city=city, lat=lat, lng=lng)
