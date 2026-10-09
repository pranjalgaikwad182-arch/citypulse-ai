# CityPulse AI 🏙️
### AI-Powered City Exploration, Safety & Intelligence Platform

> **“Explore Smarter. Travel Safer. Experience More.”**  
> *Default Demo City: Pune, Maharashtra, India*

---

## 🌟 Executive Summary

**CityPulse AI** is a production-inspired, full-stack decision-support platform designed to answer five fundamental urban questions:

1. **Where should I go?** — Discover verified culinary spots, parks, heritage landmarks, and budget-friendly activities.
2. **What can I experience within my budget?** — Strict budget filtering, transparent average costs, and free admission discovery.
3. **How can I travel while considering reported safety concerns and current conditions?** — Risk-aware route comparison correlating real-time citizen incident corridors (potholes, waterlogging, dark unlit stretches).
4. **Which places best match my preferences?** — Multi-criteria place comparison with transparent, configurable weights and radar/bar score diagnostics.
5. **What is happening around me right now?** — Live weather advisories, traffic congestion feeds, social community broadcasts, and citizen incident reports.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, React Router, Recharts, Leaflet & React-Leaflet |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, SQLAlchemy ORM, BCrypt, Python-JOSE |
| **Database** | SQLite (zero-config local demo), schema ready for PostgreSQL / PostGIS |
| **Geospatial & Maps** | Leaflet with Carto Voyager & OpenStreetMap tiles, Haversine geospatial calculations, incident corridor analysis |
| **AI / ML & NLP** | Grounded Retrieval-Augmented Generation (RAG), rule-based NLP incident categorization, spatial & textual duplicate detection, deterministic fallback engine |
| **Media & Audio** | Browser `MediaRecorder` API for voice notes, audio playback, validated photo upload pipeline |
| **Testing** | Pytest & pytest-asyncio (Backend), Vitest & Testing Library with happy-dom (Frontend) |

---

## 🚀 Key Features

### 1. Interactive Exploration & Pune Geospatial Dataset
- Pan, zoom, category markers (Food, Heritage, Parks, Shopping, Hospitals, Public Transit).
- 16 verified Pune points of interest (Shaniwar Wada, Aga Khan Palace, Pataleshwar Caves, Sinhagad Fort, Vaishali, Cafe Goodluck, Kayani Bakery, Saras Baug, Tulshibaug, etc.).
- Geolocation "Locate Me" support and Google directions links.

### 2. Heritage & Culture with Verified Storytelling
- Four major historical epochs: Rashtrakuta Dynasty (8th C), Maratha Empire / Peshwa Era (1730s), British Raj & Freedom Movement (1890s-1940s), and modern folk craft preservation.
- **"Discover the Story"** interactive modal highlighting historical significance, architectural styles, and visiting hours backed by the Archaeological Survey of India (ASI).
- Curated pedestrian-friendly cultural walking trails.

### 3. Safety Intelligence & Risk-Aware Route Assistance
- Live citizen incident feed with statuses: `Submitted`, `Under Review`, `Verified`, `Resolved`, `Rejected`.
- Route comparison analyzing incident corridors within 500m buffer zones.
- Route A (Direct Arterial) vs. Route B (Secondary Bypass) comparing distance, travel time, and active hazard severity.
- Strict cautionary safety disclaimers: *Lack of reports never implies guaranteed safety.*

### 4. Best vs. Worst Place Comparison
- Compare 2 to 4 places side-by-side.
- Configurable weights with auto-normalization:
  - Affordability (25%)
  - User Ratings (20%)
  - Cleanliness & Amenities (15%)
  - Accessibility (15%)
  - Distance Suitability (10%)
  - Reported Safety Conditions (15%)
- Visual Recharts bar comparison chart with transparent rationale explanations.

### 5. Grounded AI City Companion
- Conversational assistant with pre-filled query pills.
- Grounded RAG architecture extracting budget, categories, wheelchair accessibility, and family suitability.
- Attaches interactive place cards with "View on Map" and "Add to Itinerary" actions.
- Transparent fallback engine operates 100% offline without external paid API keys.

### 6. Citizen Incident Reporting with Photos & Voice Notes
- Browser-based audio recording using the HTML5 `MediaRecorder` API.
- In-browser audio playback and photo upload preview.
- Real-time NLP duplicate detection flagging matching reports within 800m.
- Automatic incident categorization and urgency score calculation.

### 7. Smart Itinerary Planner
- Greedy nearest-neighbor spatial synthesizer balancing budget, available hours, and interest categories.
- Ordered timeline with travel distances, stay durations, and admission costs.
- Persistent saving and deletion of customized itineraries in the database.

### 8. City-Level Analytics Dashboard
- Incident distribution by category (Recharts Bar Chart).
- Weekly incident trend progression (Recharts Line Chart).
- Geographic hotspot clusters table (Shivajinagar, Swargate, Baner, Camp).
- Average resolution turnaround time and dataset provenance audits.

### 9. Role-Protected Admin & Moderation Console
- JWT authentication with BCrypt hashing.
- **1-Click Demo Login** button for judges: `admin@citypulse.ai` / `CityPulse@Admin2026`.
- Full moderation workflow: verify evidence, mark resolved, reject spam, and add official inspection notes.

---

## 🏃 Quickstart Guide

### Prerequisites
- Python 3.11+
- Node.js 20+

### 1. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API is now live at `http://localhost:8000` with Swagger documentation at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The web dashboard is now live at `http://localhost:3000`.

---

## 🧪 Automated Testing

### Run Backend Tests (Pytest)
```bash
cd backend
python -m pytest -v
```
*Result: 11 passed (health check, places filtering, NLP categorizer, duplicate detection, route corridor calculation, place comparison, AI fallback, analytics).*

### Run Frontend Tests (Vitest)
```bash
cd frontend
npm test
```
*Result: 2 passed (PlaceCard rendering, Toast notification container).*

---

## 🔐 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Municipal Admin** | `admin@citypulse.ai` | `CityPulse@Admin2026` |
| **Citizen User** | `citizen@citypulse.ai` | `Citizen@2026` |

*(A 1-click Demo Sign-In button is available directly on the Admin page).*

---

## ⚖️ Real Data vs. Demonstration Mode Policy

1. **Grounded Public Data:** Places, heritage records, historical descriptions, and coordinates reflect real Pune landmarks sourced from OpenStreetMap, Archaeological Survey of India (ASI), and the Pune Municipal Corporation (PMC).
2. **Explicit Demo Labels:** Sample citizen reports, traffic delays, and social media feed items are clearly labeled with `DEMO DATA` tags to demonstrate edge-case incident handling without misrepresenting simulated observations as live emergencies.
3. **Zero Paid API Locks:** The platform runs 100% out of the box with zero required credit cards or paid API keys.
