import re
import json
import httpx
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.place import Place
from app.models.report import Report
from app.models.heritage import Heritage
from app.core.config import settings
from app.schemas.schemas import AIChatRequest, AIChatResponse, AIPlaceCard

def extract_query_intent(query: str) -> Dict[str, Any]:
    q = query.lower()
    intent = {
        "categories": [],
        "max_budget": None,
        "requires_wheelchair": False,
        "requires_family": False,
        "keywords": []
    }

    if any(k in q for k in ["food", "restaurant", "eat", "snack", "thali", "dosa", "lunch", "dinner"]):
        intent["categories"].append("Food")
    if any(k in q for k in ["history", "heritage", "fort", "palace", "temple", "museum"]):
        intent["categories"].append("Heritage")
    if any(k in q for k in ["park", "garden", "nature", "walk", "green"]):
        intent["categories"].append("Park")
    if any(k in q for k in ["shop", "market", "bazaar", "mall"]):
        intent["categories"].append("Shopping")
    if any(k in q for k in ["hotel", "stay", "lodge"]):
        intent["categories"].append("Hotel")
    if any(k in q for k in ["tourist", "sightseeing", "attraction"]):
        intent["categories"].append("Tourist Attraction")

    if any(k in q for k in ["wheelchair", "accessible", "handicap", "ramp"]):
        intent["requires_wheelchair"] = True

    if any(k in q for k in ["family", "kids", "children"]):
        intent["requires_family"] = True

    # Budget extraction (e.g. "budget 500", "under 300", "cheap", "affordable", "free")
    if "free" in q:
        intent["max_budget"] = 0
    elif any(k in q for k in ["cheap", "affordable", "budget"]):
        intent["max_budget"] = 300

    match_num = re.search(r'(?:under|budget|within|below|rs|inr|₹)\s*(\d+)', q)
    if match_num:
        try:
            intent["max_budget"] = int(match_num.group(1))
        except ValueError:
            pass

    return intent

async def process_ai_chat(req: AIChatRequest, db: Session) -> AIChatResponse:
    query = req.message.strip()
    intent = extract_query_intent(query)

    # 1. Database Retrieval (RAG)
    all_places = db.query(Place).all()
    all_heritage = db.query(Heritage).all()
    all_reports = db.query(Report).filter(Report.status.in_(["Verified", "Submitted"])).all()

    # Score and filter places based on query intent
    candidate_scores: List[tuple[Place, float, str]] = []

    for p in all_places:
        score = 50.0
        reasons = []

        # Category match
        if intent["categories"] and p.category in intent["categories"]:
            score += 35.0
            reasons.append(f"Matches category '{p.category}'")
        elif not intent["categories"]:
            score += 15.0

        # Keyword match in name or description
        for word in query.lower().split():
            if len(word) > 3:
                if word in p.name.lower():
                    score += 25.0
                    reasons.append(f"Direct name match for '{word}'")
                elif p.description and word in p.description.lower():
                    score += 10.0

        # Wheelchair preference
        if intent["requires_wheelchair"]:
            if p.accessibility_wheelchair:
                score += 20.0
                reasons.append("Wheelchair accessible")
            else:
                score -= 30.0

        # Family friendly preference
        if intent["requires_family"] and p.is_family_friendly:
            score += 15.0
            reasons.append("Suitable for families")

        # Budget match
        if intent["max_budget"] is not None:
            cost = p.avg_cost_inr if p.avg_cost_inr is not None else 0
            if cost <= intent["max_budget"]:
                score += 20.0
                reasons.append(f"Within budget (₹{cost} <= ₹{intent['max_budget']})")
            else:
                score -= 25.0

        # Rating boost
        if p.rating:
            score += (p.rating - 4.0) * 10.0

        reason_str = "; ".join(reasons) if reasons else "General recommendation based on Pune city dataset"
        candidate_scores.append((p, score, reason_str))

    # Sort candidates
    candidate_scores.sort(key=lambda x: x[1], reverse=True)
    top_candidates = candidate_scores[:4]

    selected_cards: List[AIPlaceCard] = []
    for p, score, reason_str in top_candidates:
        selected_cards.append(AIPlaceCard(
            id=p.id,
            name=p.name,
            category=p.category,
            address=p.address,
            lat=p.lat,
            lng=p.lng,
            rating=p.rating,
            price_tier=p.price_tier,
            reason=reason_str,
            evidence_source=p.source_name
        ))

    # Relevant safety notes if user asked about safety or incidents
    safety_notes = None
    if any(k in query.lower() for k in ["safe", "incident", "hazard", "avoid", "crime", "dark", "accident", "caution"]):
        recent_hazards = [r for r in all_reports if r.severity == "High"]
        if recent_hazards:
            hazard_summary = ", ".join([f"{h.category} near {h.address.split(',')[0]}" for h in recent_hazards[:2]])
            safety_notes = f"Notice: {len(recent_hazards)} high-priority civic hazards currently reported ({hazard_summary}). Plan your travel accordingly."
        else:
            safety_notes = "No severe hazards actively reported in central corridors. However, lack of reports does not guarantee safety."

    # 2. Check if external LLM API is configured
    if settings.LLM_API_KEY:
        try:
            places_summary = "\n".join([
                f"- {p.name} ({p.category}, Avg cost: ₹{p.avg_cost_inr}, Rating: {p.rating}/5, Wheelchair: {p.accessibility_wheelchair}): {p.description}"
                for p, _, _ in top_candidates
            ])
            llm_prompt = f"""You are CityPulse AI, an intelligent city assistant for Pune, Maharashtra.
User Query: {query}
Retrieved Verified City Data:
{places_summary}
Safety notes: {safety_notes or 'Central areas normal.'}

Provide a helpful, concise, well-structured answer explaining the best recommendations based only on this retrieved evidence. Mention price, highlights, and any accessibility or safety notes."""

            # Call Gemini REST API
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={settings.LLM_API_KEY}"
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(
                    gemini_url,
                    json={"contents": [{"parts": [{"text": llm_prompt}]}]},
                    headers={"Content-Type": "application/json"}
                )
                if res.status_code == 200:
                    resp_json = res.json()
                    candidates = resp_json.get("candidates", [])
                    if candidates:
                        text_resp = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        if text_resp:
                            return AIChatResponse(
                                answer=text_resp,
                                inferred_intent=intent,
                                places=selected_cards,
                                safety_notes=safety_notes,
                                data_limitations="Generated using Live LLM grounded on verified Pune municipal records.",
                                is_fallback=False
                            )
        except Exception as e:
            print(f"LLM API error ({e}), switching smoothly to deterministic fallback.")

    # 3. Deterministic Grounded Fallback Response (High-quality Hackathon Demo)
    names = [c.name for c in selected_cards[:3]]
    if selected_cards:
        answer = (
            f"Here are top-ranked recommendations in Pune matching your query:\n\n"
            f"1. **{selected_cards[0].name}** ({selected_cards[0].category}): "
            f"{selected_cards[0].reason}. Located at {selected_cards[0].address}.\n\n"
        )
        if len(selected_cards) > 1:
            answer += (
                f"2. **{selected_cards[1].name}** ({selected_cards[1].category}): "
                f"{selected_cards[1].reason}.\n\n"
            )
        if len(selected_cards) > 2:
            answer += (
                f"3. **{selected_cards[2].name}** ({selected_cards[2].category}): "
                f"{selected_cards[2].reason}.\n\n"
            )
        answer += "You can view each location directly on the interactive map or add them to your itinerary below."
    else:
        answer = "I couldn't find specific places matching all those filters in our verified Pune dataset. Try broadening your budget or category keywords."

    return AIChatResponse(
        answer=answer,
        inferred_intent=intent,
        places=selected_cards,
        safety_notes=safety_notes,
        data_limitations="CityPulse Deterministic RAG Engine: Grounded exclusively in verified Pune municipal and community records without external LLM hallucinations.",
        is_fallback=True
    )
