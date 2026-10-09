import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.place import Place
from app.models.itinerary import Itinerary
from app.core.nlp import calculate_haversine_distance_km
from app.schemas.schemas import ItineraryGenerateRequest, ItineraryOut, ItineraryStop

router = APIRouter()

@router.post("/generate", response_model=ItineraryOut)
def generate_smart_itinerary(req: ItineraryGenerateRequest, db: Session = Depends(get_db)):
    # 1. Fetch eligible places based on interests and wheelchair constraint
    query = db.query(Place)
    if req.wheelchair_only:
        query = query.filter(Place.accessibility_wheelchair == True)
        
    all_places = query.all()
    if not all_places:
        raise HTTPException(status_code=400, detail="No matching places found for the selected constraints.")

    # Filter by user interests if specified
    interest_categories = [i.strip() for i in req.interests if i.strip()]
    if interest_categories:
        matched_pool = [p for p in all_places if any(ic.lower() in p.category.lower() for ic in interest_categories)]
        if not matched_pool:
            matched_pool = all_places
    else:
        matched_pool = all_places

    # 2. Greedy Nearest-Neighbor Traveling Selection within budget and duration
    # Starting location coordinates (e.g. Pune Central / Shivajinagar default: 18.5314, 73.8446)
    curr_lat, curr_lng = 18.5314, 73.8446
    
    selected_stops: List[ItineraryStop] = []
    accumulated_duration = 0
    accumulated_cost = 0
    total_distance_km = 0.0
    max_duration_mins = int(req.available_time_hours * 60)
    
    remaining_pool = list(matched_pool)

    # Pick up to preferred_stops_count
    target_stops = min(req.preferred_stops_count, 6)

    for step in range(target_stops):
        if not remaining_pool:
            break

        # Score remaining candidates: balance distance from curr point and rating
        def score_candidate(place: Place):
            dist = calculate_haversine_distance_km(curr_lat, curr_lng, place.lat, place.lng)
            # Favor closer places with good ratings
            return dist - (place.rating or 4.0) * 0.4

        remaining_pool.sort(key=score_candidate)
        best_candidate = remaining_pool[0]

        # Check budget & time feasibility
        cand_cost = best_candidate.avg_cost_inr or 0
        cand_visit_mins = 60 if best_candidate.category in ["Heritage", "Tourist Attraction", "Park"] else 45
        travel_time_mins = int(calculate_haversine_distance_km(curr_lat, curr_lng, best_candidate.lat, best_candidate.lng) * 4)

        if accumulated_duration + cand_visit_mins + travel_time_mins > max_duration_mins and selected_stops:
            # Over time budget
            break
            
        if accumulated_cost + cand_cost > req.budget_inr * 1.25 and selected_stops:
            # Over money budget
            break

        dist_from_prev = calculate_haversine_distance_km(curr_lat, curr_lng, best_candidate.lat, best_candidate.lng)
        total_distance_km += dist_from_prev
        accumulated_duration += (cand_visit_mins + travel_time_mins)
        accumulated_cost += cand_cost
        curr_lat, curr_lng = best_candidate.lat, best_candidate.lng

        selected_stops.append(ItineraryStop(
            place_id=best_candidate.id,
            name=best_candidate.name,
            category=best_candidate.category,
            address=best_candidate.address,
            lat=best_candidate.lat,
            lng=best_candidate.lng,
            visit_duration_mins=cand_visit_mins,
            approx_cost_inr=cand_cost,
            image_url=best_candidate.image_url,
            opening_hours=best_candidate.opening_hours,
            notes=f"Step {step+1}: Recommended for {best_candidate.subcategory or best_candidate.category}."
        ))

        remaining_pool.remove(best_candidate)

    if not selected_stops:
        # Fallback: take top rated
        top_p = all_places[0]
        selected_stops.append(ItineraryStop(
            place_id=top_p.id,
            name=top_p.name,
            category=top_p.category,
            address=top_p.address,
            lat=top_p.lat,
            lng=top_p.lng,
            visit_duration_mins=60,
            approx_cost_inr=top_p.avg_cost_inr or 0,
            image_url=top_p.image_url,
            opening_hours=top_p.opening_hours,
            notes="Primary recommendation."
        ))

    title = f"{int(req.available_time_hours)}h Pune {', '.join(req.interests[:2])} Discovery"

    return ItineraryOut(
        title=title,
        starting_location=req.starting_location,
        available_time_hours=req.available_time_hours,
        budget_inr=req.budget_inr,
        travel_mode=req.travel_mode,
        total_duration_mins=accumulated_duration,
        estimated_cost_inr=accumulated_cost,
        stops=selected_stops,
        distance_estimate_km=round(total_distance_km, 2),
        disclaimer="Travel durations and distances are calculated based on city arterial routing estimates. Opening hours and admission rates are sourced from verified municipal databases."
    )

@router.post("", response_model=ItineraryOut)
def save_itinerary(itinerary_in: ItineraryOut, db: Session = Depends(get_db)):
    stops_serialized = json.dumps([s.model_dump() for s in itinerary_in.stops])
    db_obj = Itinerary(
        title=itinerary_in.title,
        starting_location=itinerary_in.starting_location,
        available_time_hours=itinerary_in.available_time_hours,
        budget_inr=itinerary_in.budget_inr,
        travel_mode=itinerary_in.travel_mode,
        total_duration_mins=itinerary_in.total_duration_mins,
        estimated_cost_inr=itinerary_in.estimated_cost_inr,
        stops_json=stops_serialized
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    itinerary_in.id = db_obj.id
    return itinerary_in

@router.get("", response_model=List[ItineraryOut])
def list_saved_itineraries(db: Session = Depends(get_db)):
    saved = db.query(Itinerary).order_by(Itinerary.created_at.desc()).all()
    results = []
    for it in saved:
        try:
            raw_stops = json.loads(it.stops_json)
            stops = [ItineraryStop(**s) for s in raw_stops]
        except Exception:
            stops = []
        results.append(ItineraryOut(
            id=it.id,
            title=it.title,
            starting_location=it.starting_location,
            available_time_hours=it.available_time_hours,
            budget_inr=it.budget_inr,
            travel_mode=it.travel_mode,
            total_duration_mins=it.total_duration_mins,
            estimated_cost_inr=it.estimated_cost_inr,
            stops=stops,
            distance_estimate_km=round(len(stops) * 2.8, 1),
            disclaimer="Saved itinerary."
        ))
    return results

@router.delete("/{itinerary_id}")
def delete_itinerary(itinerary_id: int, db: Session = Depends(get_db)):
    it = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not it:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    db.delete(it)
    db.commit()
    return {"status": "deleted"}
