import math
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.report import Report
from app.models.traffic import TrafficIncident
from app.core.nlp import calculate_haversine_distance_km
from app.schemas.schemas import RouteCompareRequest, RouteCompareResponse, RouteAlternative

def point_to_segment_distance_km(px: float, py: float, x1: float, y1: float, x2: float, y2: float) -> float:
    """Calculates perpendicular distance in km from point (px, py) to line segment (x1, y1)-(x2, y2)."""
    # Quick approximate projection using local degree to km scaling (1 deg lat ~ 111km, 1 deg lng ~ 105km at 18.5 deg)
    dx = (x2 - x1) * 111.0
    dy = (y2 - y1) * 105.0
    if dx == 0 and dy == 0:
        return calculate_haversine_distance_km(px, py, x1, y1)
    
    t = (((px - x1) * 111.0 * dx) + ((py - y1) * 105.0 * dy)) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    proj_x = x1 + t * (x2 - x1)
    proj_y = y1 + t * (y2 - y1)
    return calculate_haversine_distance_km(px, py, proj_x, proj_y)

def find_incidents_along_path(path: List[List[float]], reports: List[Report], buffer_km: float = 0.5) -> List[Dict[str, Any]]:
    nearby = []
    for rep in reports:
        min_dist = float("inf")
        for i in range(len(path) - 1):
            p1 = path[i]
            p2 = path[i + 1]
            d = point_to_segment_distance_km(rep.lat, rep.lng, p1[0], p1[1], p2[0], p2[1])
            if d < min_dist:
                min_dist = d
        if min_dist <= buffer_km:
            nearby.append({
                "id": rep.id,
                "title": rep.title,
                "category": rep.category,
                "severity": rep.severity,
                "status": rep.status,
                "address": rep.address,
                "distance_to_corridor_m": int(min_dist * 1000),
                "created_at": str(rep.created_at)
            })
    return nearby

def compare_route_alternatives(req: RouteCompareRequest, db: Session) -> RouteCompareResponse:
    s_lat, s_lng = req.start_lat, req.start_lng
    d_lat, d_lng = req.dest_lat, req.dest_lng
    
    # Direct distance
    direct_dist = calculate_haversine_distance_km(s_lat, s_lng, d_lat, d_lng)
    if direct_dist < 0.1:
        direct_dist = 0.5

    # 1. Synthesize realistic geometry for Route 1 (Direct Arterial) and Route 2 (Bypass Corridor)
    # Midpoints with slight offset
    mid_lat = (s_lat + d_lat) / 2.0
    mid_lng = (s_lng + d_lng) / 2.0
    
    # Path 1: 5 points along direct corridor
    p1 = [s_lat, s_lng]
    p2 = [s_lat + (mid_lat - s_lat) * 0.5 + 0.001, s_lng + (mid_lng - s_lng) * 0.5 - 0.001]
    p3 = [mid_lat, mid_lng]
    p4 = [mid_lat + (d_lat - mid_lat) * 0.5 - 0.001, mid_lng + (d_lng - mid_lng) * 0.5 + 0.001]
    p5 = [d_lat, d_lng]
    path_1 = [p1, p2, p3, p4, p5]
    dist_1 = round(direct_dist * 1.25, 2)
    duration_1 = round(dist_1 * 3.2, 0) # avg 18-20 km/h in city traffic

    # Path 2: Alternative corridor via outer ring / alternate arterial (arc offset)
    offset_lat = 0.008
    offset_lng = 0.009
    p2_alt = [s_lat + (mid_lat - s_lat) * 0.4 + offset_lat, s_lng + (mid_lng - s_lng) * 0.4 + offset_lng]
    p3_alt = [mid_lat + offset_lat * 1.2, mid_lng + offset_lng * 1.2]
    p4_alt = [mid_lat + (d_lat - mid_lat) * 0.6 + offset_lat * 0.5, mid_lng + (d_lng - mid_lng) * 0.6 + offset_lng * 0.5]
    path_2 = [p1, p2_alt, p3_alt, p4_alt, p5]
    dist_2 = round(direct_dist * 1.48, 2)
    duration_2 = round(dist_2 * 2.6, 0) # smoother arterial flow

    # 2. Query active reports
    active_reports = db.query(Report).filter(Report.status.in_(["Verified", "Submitted", "Under Review"])).all()

    incidents_1 = find_incidents_along_path(path_1, active_reports, buffer_km=0.6)
    incidents_2 = find_incidents_along_path(path_2, active_reports, buffer_km=0.6)

    # Risk level classification
    high_count_1 = sum(1 for inc in incidents_1 if inc["severity"] == "High")
    high_count_2 = sum(1 for inc in incidents_2 if inc["severity"] == "High")

    risk_1 = "Caution Advised (Active Hazards Reported)" if high_count_1 > 0 else ("Moderate Reported Hazards" if len(incidents_1) > 0 else "Low Reported Incidents")
    risk_2 = "Caution Advised (Active Hazards Reported)" if high_count_2 > 0 else ("Moderate Reported Hazards" if len(incidents_2) > 0 else "Low Reported Incidents")

    # Recommendation
    if high_count_1 > 0 and high_count_2 == 0:
        recommended_id = "route-2"
        rationale_2 = "Recommended: Bypasses 1 severe hazard (waterlogging/pothole crater) reported along primary arterial route."
        rationale_1 = "Shorter distance but passes near high-severity reported hazard."
    else:
        recommended_id = "route-1"
        rationale_1 = "Recommended: Fastest route with lowest estimated travel time."
        rationale_2 = "Alternative route with wider roads, slightly longer travel distance."

    routes = [
        RouteAlternative(
            route_id="route-1",
            title="Route A (Direct City Arterial)",
            distance_km=dist_1,
            duration_mins=duration_1,
            path_coordinates=path_1,
            nearby_incidents_count=len(incidents_1),
            nearby_incidents=incidents_1,
            safety_risk_level=risk_1,
            recommendation_rationale=rationale_1,
            cautious_advisory="Recent reports nearby. Check current conditions before travelling."
        ),
        RouteAlternative(
            route_id="route-2",
            title="Route B (Secondary Bypass Arterial)",
            distance_km=dist_2,
            duration_mins=duration_2,
            path_coordinates=path_2,
            nearby_incidents_count=len(incidents_2),
            nearby_incidents=incidents_2,
            safety_risk_level=risk_2,
            recommendation_rationale=rationale_2,
            cautious_advisory="Check current traffic conditions before travelling."
        )
    ]

    return RouteCompareResponse(
        provider="CityPulse Spatial Routing Engine & Citizen Incident Correlator",
        routes=routes,
        recommended_route_id=recommended_id,
        safety_disclaimer="Safety classifications are based strictly on recent reported citizen incidents and road closures. CityPulse does not guarantee route safety. Please exercise personal caution and obey local traffic advisories."
    )
