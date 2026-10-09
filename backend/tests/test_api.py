import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import engine, Base, SessionLocal
from app.db.seed_data import seed_database
from app.core.nlp import classify_incident_text, compute_urgency_score, detect_potential_duplicates

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()
    yield

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["city"] == "Pune"

def test_get_places(client):
    response = client.get("/api/places")
    assert response.status_code == 200
    places = response.json()
    assert len(places) > 0
    # Verify Pune landmark exists
    names = [p["name"] for p in places]
    assert "Shaniwar Wada" in names

def test_filter_places_by_category(client):
    response = client.get("/api/places?category=Heritage")
    assert response.status_code == 200
    places = response.json()
    for p in places:
        assert p["category"] == "Heritage"

def test_nlp_classification():
    text = "Big pothole on the main street broke my scooter wheel"
    category = classify_incident_text(text)
    assert category == "Pothole & Roadwork"
    
    text_water = "Underpass is flooded with two feet of water stagnation"
    category_water = classify_incident_text(text_water)
    assert category_water == "Waterlogging"

def test_duplicate_incident_detection():
    existing = [
        {
            "id": 1,
            "title": "Waterlogging at Shivajinagar underpass",
            "description": "Deep water accumulation blocking two wheelers",
            "lat": 18.5312,
            "lng": 73.8475,
            "status": "Verified",
            "created_at": None
        }
    ]
    # Report at same location with similar description
    dups = detect_potential_duplicates(
        new_text="Flooding and water logging under Shivajinagar bridge",
        new_lat=18.5313,
        new_lng=73.8476,
        existing_reports=existing
    )
    assert len(dups) > 0
    assert dups[0]["report_id"] == 1

def test_check_duplicate_endpoint(client):
    res = client.post(
        "/api/reports/check-duplicate",
        data={
            "description": "Severe flooding and deep water underpass obstruction",
            "lat": 18.5312,
            "lng": 73.8475,
            "severity": "High"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert "suggested_duplicates" in data
    assert data["inferred_category"] == "Waterlogging"

def test_place_comparison(client):
    places = client.get("/api/places").json()
    id1 = places[0]["id"]
    id2 = places[1]["id"]

    res = client.post(
        "/api/places/compare",
        json={
            "place_ids": [id1, id2],
            "weights": {
                "affordability": 0.3,
                "ratings": 0.2,
                "cleanliness": 0.15,
                "accessibility": 0.15,
                "distance": 0.1,
                "safety": 0.1
            }
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data["places"]) == 2
    assert "best_place_id" in data
    assert "recommendation_explanation" in data

def test_route_risk_comparison(client):
    res = client.post(
        "/api/routes/compare",
        json={
            "start_lat": 18.5314,
            "start_lng": 73.8446,
            "dest_lat": 18.5020,
            "dest_lng": 73.8575
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data["routes"]) == 2
    assert data["recommended_route_id"] in ["route-1", "route-2"]
    assert "safety_disclaimer" in data

def test_ai_companion_fallback(client):
    res = client.post(
        "/api/ai/chat",
        json={
            "message": "Recommend affordable South Indian food near Deccan Gymkhana"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data["places"]) > 0
    assert "answer" in data
    assert data["is_fallback"] in [True, False]

def test_analytics_endpoint(client):
    res = client.get("/api/analytics")
    assert res.status_code == 200
    data = res.json()
    assert data["total_places"] > 0
    assert len(data["reports_by_category"]) > 0
    assert len(data["hotspot_clusters"]) > 0

def test_create_report_without_files(client):
    res = client.post(
        "/api/reports",
        data={
            "title": "Broken Streetlight on Senapati Bapat Road",
            "category": "Broken Streetlight",
            "description": "Entire pedestrian stretch is dark between gate 2 and gate 4",
            "severity": "Medium",
            "lat": 18.5330,
            "lng": 73.8295,
            "address": "Senapati Bapat Road, Pune",
            "reporter_name": "Test Citizen"
        }
    )
    assert res.status_code == 201
    rep = res.json()
    assert rep["title"] == "Broken Streetlight on Senapati Bapat Road"
    assert rep["status"] == "Submitted"
    assert rep["report_code"].startswith("REP-")
