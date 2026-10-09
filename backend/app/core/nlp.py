import re
import math
from datetime import datetime, timezone
from typing import List, Tuple, Optional, Dict, Any

CATEGORY_KEYWORDS = {
    "Accident": [
        "accident", "crash", "collision", "hit and run", "overturned", "skid", "injury", "bike fell", "car damage"
    ],
    "Road Closure": [
        "closure", "road closed", "barricade", "diversion", "blocked road", "route closed", "no entry", "digging"
    ],
    "Waterlogging": [
        "waterlogging", "water logging", "flooding", "flood", "submerged", "clogged drain", "drainage overflow", "water stagnation"
    ],
    "Broken Streetlight": [
        "streetlight", "street light", "dark road", "no lights", "broken bulb", "blackout", "pitch dark", "lamp post"
    ],
    "Harassment / Unsafe Condition": [
        "harassment", "unsafe", "stalking", "unlit", "isolated", "catcalling", "eve teasing", "suspicious", "feeling unsafe"
    ],
    "Pothole & Roadwork": [
        "pothole", "bad road", "road work", "tarmac broken", "crater", "gravel", "excavation", "uneven road"
    ],
    "Traffic Jam": [
        "traffic jam", "congestion", "gridlock", "crawling", "heavy traffic", "choked", "bottleneck"
    ]
}

URGENT_KEYWORDS = [
    "urgent", "danger", "critical", "severe", "serious", "injured", "blood", "fire", 
    "ambulance", "hazard", "life threatening", "collapsed", "high risk"
]

def calculate_haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in kilometers."""
    R = 6371.0 # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def tokenize_and_clean(text: str) -> set:
    text = text.lower()
    tokens = re.findall(r'\b[a-z0-9]{3,}\b', text)
    stopwords = {"the", "and", "for", "with", "from", "near", "this", "that", "there", "road", "area", "please", "very"}
    return {t for t in tokens if t not in stopwords}

def jaccard_similarity(text1: str, text2: str) -> float:
    tokens1 = tokenize_and_clean(text1)
    tokens2 = tokenize_and_clean(text2)
    if not tokens1 or not tokens2:
        return 0.0
    intersection = len(tokens1.intersection(tokens2))
    union = len(tokens1.union(tokens2))
    return intersection / union if union > 0 else 0.0

def classify_incident_text(text: str) -> str:
    """Classifies incident description into standard categories using keyword matching."""
    text_lower = text.lower()
    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[category] = score
    
    if scores:
        return max(scores.items(), key=lambda x: x[1])[0]
    return "Other Hazard"

def compute_urgency_score(text: str, severity: str) -> float:
    """Returns an urgency score from 0.0 to 1.0 based on severity and urgent keywords."""
    score = 0.3
    if severity.lower() == "high":
        score += 0.4
    elif severity.lower() == "medium":
        score += 0.2
    
    text_lower = text.lower()
    for word in URGENT_KEYWORDS:
        if word in text_lower:
            score += 0.15
            
    return min(round(score, 2), 1.0)

def detect_potential_duplicates(
    new_text: str,
    new_lat: float,
    new_lng: float,
    existing_reports: List[Dict[str, Any]],
    distance_threshold_km: float = 0.8,
    similarity_threshold: float = 0.35,
    time_window_hours: float = 48.0
) -> List[Dict[str, Any]]:
    """
    Checks existing reports to find potential duplicates based on spatial proximity,
    text similarity, and timestamp recency.
    """
    potential_duplicates = []
    now = datetime.now(timezone.utc)

    for rep in existing_reports:
        # Check geographic distance
        rep_lat = rep.get("lat")
        rep_lng = rep.get("lng")
        if rep_lat is None or rep_lng is None:
            continue
            
        dist_km = calculate_haversine_distance_km(new_lat, new_lng, rep_lat, rep_lng)
        if dist_km > distance_threshold_km:
            continue

        # Check text similarity
        rep_text = f"{rep.get('title', '')} {rep.get('description', '')}"
        sim = jaccard_similarity(new_text, rep_text)

        # Check recency if created_at is available
        created_at = rep.get("created_at")
        time_diff_hours = 0.0
        if isinstance(created_at, datetime):
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)
            time_diff_hours = abs((now - created_at).total_seconds()) / 3600.0

        if (sim >= similarity_threshold or dist_km <= 0.15) and (time_diff_hours <= time_window_hours or not created_at):
            potential_duplicates.append({
                "report_id": rep.get("id"),
                "title": rep.get("title"),
                "similarity_score": round(sim, 2),
                "distance_km": round(dist_km, 3),
                "status": rep.get("status"),
                "created_at": str(created_at) if created_at else None
            })

    return potential_duplicates
