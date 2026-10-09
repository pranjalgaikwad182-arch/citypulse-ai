from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = "citizen"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# --- Place ---
class PlaceOut(BaseModel):
    id: int
    name: str
    category: str
    subcategory: Optional[str] = None
    address: str
    lat: float
    lng: float
    price_tier: Optional[str] = None
    avg_cost_inr: Optional[int] = None
    rating: Optional[float] = None
    rating_source: Optional[str] = None
    reviews_count: int = 0
    opening_hours: Optional[str] = None
    accessibility_wheelchair: bool = False
    is_family_friendly: bool = True
    description: Optional[str] = None
    image_url: Optional[str] = None
    source_name: str
    data_freshness: str
    created_at: datetime
    model_config = {"from_attributes": True}

# --- Heritage ---
class HeritageOut(BaseModel):
    id: int
    place_id: int
    name: str
    address: str
    lat: float
    lng: float
    image_url: Optional[str] = None
    historical_significance: str
    era_period: Optional[str] = None
    architectural_style: Optional[str] = None
    visiting_info: Optional[str] = None
    verified_story: str
    estimated_visit_mins: int
    source_attribution: str

# --- Report ---
class ReportCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    category: str
    description: str = Field(..., min_length=10)
    severity: str = "Medium"
    lat: float
    lng: float
    address: str
    reporter_name: Optional[str] = "Anonymous Citizen"

class ReportUpdate(BaseModel):
    status: Optional[str] = None
    duplicate_of_id: Optional[int] = None
    verification_notes: Optional[str] = None
    severity: Optional[str] = None

class ReportOut(BaseModel):
    id: int
    report_code: str
    title: str
    category: str
    description: str
    severity: str
    status: str
    lat: float
    lng: float
    address: str
    photo_url: Optional[str] = None
    audio_url: Optional[str] = None
    reporter_name: str
    duplicate_of_id: Optional[int] = None
    ai_category_tag: Optional[str] = None
    urgency_score: float
    verification_notes: Optional[str] = None
    verified_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class DuplicateCheckResponse(BaseModel):
    has_duplicates: bool
    suggested_duplicates: List[Dict[str, Any]]
    inferred_category: str
    urgency_score: float

# --- Comparison ---
class DimensionWeight(BaseModel):
    affordability: float = 0.25
    ratings: float = 0.20
    cleanliness: float = 0.15
    accessibility: float = 0.15
    distance: float = 0.10
    safety: float = 0.15

class PlaceComparisonRequest(BaseModel):
    place_ids: List[int] = Field(..., min_length=2, max_length=4)
    weights: Optional[DimensionWeight] = None
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None

class ComparisonDimensionBreakdown(BaseModel):
    dimension: str
    score: float # 0 - 100
    raw_value: str
    source: str
    freshness: str
    weight: float

class PlaceComparisonItem(BaseModel):
    place_id: int
    name: str
    category: str
    image_url: Optional[str] = None
    total_score: float # 0 - 100
    is_sufficient_data: bool
    dimensions: List[ComparisonDimensionBreakdown]
    summary_verdict: str

class PlaceComparisonResponse(BaseModel):
    places: List[PlaceComparisonItem]
    weights_used: Dict[str, float]
    recommendation_explanation: str
    best_place_id: Optional[int] = None

# --- Routing ---
class RoutePoint(BaseModel):
    lat: float
    lng: float
    name: Optional[str] = None

class RouteCompareRequest(BaseModel):
    start_lat: float
    start_lng: float
    start_name: Optional[str] = "Origin"
    dest_lat: float
    dest_lng: float
    dest_name: Optional[str] = "Destination"

class RouteAlternative(BaseModel):
    route_id: str
    title: str # e.g. "Primary via FC Road", "Alternative via Senapati Bapat Rd"
    distance_km: float
    duration_mins: float
    path_coordinates: List[List[float]] # [[lat, lng], ...]
    nearby_incidents_count: int
    nearby_incidents: List[Dict[str, Any]]
    safety_risk_level: str # "Low Reported Incidents", "Moderate Reported Hazards", "Caution Advised"
    recommendation_rationale: str
    cautious_advisory: str

class RouteCompareResponse(BaseModel):
    provider: str
    routes: List[RouteAlternative]
    recommended_route_id: str
    safety_disclaimer: str

# --- AI Companion ---
class AIChatRequest(BaseModel):
    message: str
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None
    conversation_history: Optional[List[Dict[str, str]]] = []

class AIPlaceCard(BaseModel):
    id: int
    name: str
    category: str
    address: str
    lat: float
    lng: float
    rating: Optional[float] = None
    price_tier: Optional[str] = None
    reason: str
    evidence_source: str

class AIChatResponse(BaseModel):
    answer: str
    inferred_intent: Dict[str, Any]
    places: List[AIPlaceCard] = []
    safety_notes: Optional[str] = None
    data_limitations: Optional[str] = None
    is_fallback: bool

# --- Traffic & Weather & Community ---
class TrafficIncidentOut(BaseModel):
    id: int
    incident_type: str
    title: str
    description: str
    lat: float
    lng: float
    severity: str
    delay_mins: int
    source: str
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}

class WeatherResponse(BaseModel):
    city: str
    temp_celsius: float
    feels_like_celsius: float
    humidity_percent: int
    wind_kmh: float
    condition: str
    description: str
    icon: str
    practical_advice: str
    provider: str
    is_demo: bool
    updated_at: str

class CommunityPostOut(BaseModel):
    id: int
    source_name: str
    author: str
    content: str
    original_link: Optional[str] = None
    category: str
    location_name: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    is_demo: bool
    verification_status: str
    published_at: datetime
    model_config = {"from_attributes": True}

# --- Itinerary ---
class ItineraryStop(BaseModel):
    place_id: int
    name: str
    category: str
    address: str
    lat: float
    lng: float
    visit_duration_mins: int
    approx_cost_inr: int
    image_url: Optional[str] = None
    opening_hours: Optional[str] = None
    notes: str

class ItineraryGenerateRequest(BaseModel):
    starting_location: str = "Pune Station / Shivajinagar"
    available_time_hours: float = 4.0
    budget_inr: int = 1000
    interests: List[str] = ["Heritage", "Food", "Parks"]
    travel_mode: str = "driving" # walking, driving, transit
    preferred_stops_count: int = 4
    wheelchair_only: bool = False

class ItineraryOut(BaseModel):
    id: Optional[int] = None
    title: str
    starting_location: str
    available_time_hours: float
    budget_inr: int
    travel_mode: str
    total_duration_mins: int
    estimated_cost_inr: int
    stops: List[ItineraryStop]
    distance_estimate_km: float
    disclaimer: str

# --- Analytics ---
class AnalyticsResponse(BaseModel):
    total_places: int
    total_reports: int
    open_reports: int
    resolved_reports: int
    reports_by_category: List[Dict[str, Any]]
    reports_by_status: List[Dict[str, Any]]
    monthly_trends: List[Dict[str, Any]]
    hotspot_clusters: List[Dict[str, Any]]
    avg_resolution_hours: float
    source_freshness_stats: List[Dict[str, Any]]
    data_mode: str
