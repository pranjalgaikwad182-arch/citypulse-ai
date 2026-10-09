from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.place import Place
from app.models.heritage import Heritage
from app.models.report import Report
from app.models.traffic import TrafficIncident
from app.models.community import CommunityPost
from app.core.security import get_password_hash

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Place).first():
        return

    print("Seeding CityPulse database for Pune...")

    # 1. Users
    admin_user = User(
        email="admin@citypulse.ai",
        hashed_password=get_password_hash("CityPulse@Admin2026"),
        full_name="CityPulse Municipal Admin",
        role="admin",
        is_active=True
    )
    citizen_user = User(
        email="citizen@citypulse.ai",
        hashed_password=get_password_hash("Citizen@2026"),
        full_name="Pranjal Resident",
        role="citizen",
        is_active=True
    )
    db.add_all([admin_user, citizen_user])
    db.flush()

    # 2. Places in Pune
    places_data = [
        {
            "name": "Shaniwar Wada",
            "category": "Heritage",
            "subcategory": "Historical Fort & Palace",
            "address": "Shaniwar Peth, Pune, Maharashtra 411030",
            "lat": 18.5196,
            "lng": 73.8553,
            "price_tier": "₹",
            "avg_cost_inr": 25,
            "rating": 4.5,
            "rating_source": "Archaeological Survey & Verified Reviews",
            "reviews_count": 14200,
            "opening_hours": "09:30 AM - 05:30 PM",
            "accessibility_wheelchair": False,
            "is_family_friendly": True,
            "description": "Historic 7-story seat of the Peshwa rulers of the Maratha Empire, built in 1732. Famous for the Delhi Gate and evening light & sound shows.",
            "image_url": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
            "source_name": "Pune Municipal Heritage Cell / OSM",
            "data_freshness": "Verified 2026"
        },
        {
            "name": "Aga Khan Palace",
            "category": "Heritage",
            "subcategory": "Memorial & National Landmark",
            "address": "Nagar Road, Samrat Ashok Path, Pune 411006",
            "lat": 18.5524,
            "lng": 73.9015,
            "price_tier": "₹",
            "avg_cost_inr": 25,
            "rating": 4.6,
            "rating_source": "ASI / State Tourism Directorate",
            "reviews_count": 9800,
            "opening_hours": "09:00 AM - 05:30 PM",
            "accessibility_wheelchair": True,
            "is_family_friendly": True,
            "description": "Majestic palace with Italian arches and spacious lawns, built in 1892 by Sultan Muhammed Shah Aga Khan III. Served as a prison for Mahatma Gandhi during the Quit India movement.",
            "image_url": "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80",
            "source_name": "Archaeological Survey of India",
            "data_freshness": "Verified 2026"
        },
        {
            "name": "Pataleshwar Cave Temple",
            "category": "Heritage",
            "subcategory": "Monolithic Rock-Cut Temple",
            "address": "Jangali Maharaj Road, Shivajinagar, Pune 411005",
            "lat": 18.5283,
            "lng": 73.8504,
            "price_tier": "Free",
            "avg_cost_inr": 0,
            "rating": 4.4,
            "rating_source": "State Archaeology Records",
            "reviews_count": 6400,
            "opening_hours": "08:30 AM - 05:30 PM",
            "accessibility_wheelchair": True,
            "is_family_friendly": True,
            "description": "8th-century rock-cut cave temple carved out of basaltic rock during the Rashtrakuta period, dedicated to Lord Shiva with an ornate circular Nandi mandapa.",
            "image_url": "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=800&q=80",
            "source_name": "Maharashtra State Archaeology",
            "data_freshness": "Verified 2026"
        },
        {
            "name": "Sinhagad Fort",
            "category": "Tourist Attraction",
            "subcategory": "Hill Fortress & Trekking",
            "address": "Sinhagad Ghat Road, Thoptewadi, Pune 411025",
            "lat": 18.3663,
            "lng": 73.7558,
            "price_tier": "₹",
            "avg_cost_inr": 50,
            "rating": 4.7,
            "rating_source": "Maharashtra Tourism / Public Records",
            "reviews_count": 21000,
            "opening_hours": "06:00 AM - 06:00 PM",
            "accessibility_wheelchair": False,
            "is_family_friendly": True,
            "description": "Ancient mountain fortress perched on a cliff at 1,312 meters, famous for Tanaji Malusare's heroic 1670 battle. Popular for sweeping Sahyadri vistas, authentic pithla-bhakri and matka curd.",
            "image_url": "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=800&q=80",
            "source_name": "Forest Dept & District Tourism",
            "data_freshness": "Verified 2026"
        },
        {
            "name": "Vaishali Restaurant",
            "category": "Food",
            "subcategory": "Iconic South Indian & Student Cafe",
            "address": "FC Road, Deccan Gymkhana, Pune 411004",
            "lat": 18.5199,
            "lng": 73.8407,
            "price_tier": "₹₹",
            "avg_cost_inr": 250,
            "rating": 4.6,
            "rating_source": "Verified Food Guide / Resident Surveys",
            "reviews_count": 32000,
            "opening_hours": "07:00 AM - 11:00 PM",
            "accessibility_wheelchair": True,
            "is_family_friendly": True,
            "description": "Cult favorite cultural hub of Pune students, academics, and families since 1971. Renowned for Mysore Masala Dosa, SPDP (Sev Potato Dahi Puri), and filter coffee.",
            "image_url": "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80",
            "source_name": "Pune Hospitality Registry",
            "data_freshness": "Verified 2026"
        },
        {
            "name": "Cafe Goodluck",
            "category": "Food",
            "subcategory": "Heritage Irani Cafe",
            "address": "Fergusson College Rd, Deccan Gymkhana, Pune 411004",
            "lat": 18.5173,
            "lng": 73.8415,
            "price_tier": "₹",
            "avg_cost_inr": 150,
            "rating": 4.4,
            "rating_source": "Pune Culinary Archives",
            "reviews_count": 28000,
            "opening_hours": "07:30 AM - 11:30 PM",
            "accessibility_wheelchair": False,
            "is_family_friendly": True,
            "description": "Established in 1935, Pune's oldest operating Irani cafe. Beloved for Bun Maska, Irani Chai, Kheema Pav, and caramel custard.",
            "image_url": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
            "source_name": "Culinary Heritage Index",
            "data_freshness": "Verified 2026"
        },
        {
            "name": "Kayani Bakery",
            "category": "Food",
            "subcategory": "Legendary Parsi Bakery",
            "address": "6, Dr Coyaji Rd, Hulshur, Camp, Pune 411001",
            "lat": 18.5126,
            "lng": 73.8781,
            "price_tier": "₹₹",
            "avg_cost_inr": 300,
            "rating": 4.5,
            "rating_source": "Culinary Heritage Directory",
            "reviews_count": 18500,
            "opening_hours": "07:30 AM - 01:00 PM, 03:30 PM - 08:00 PM (Closed Sun)",
            "accessibility_wheelchair": False,
            "is_family_friendly": True,
            "description": "Parsi confectionery founded in 1955, world-famous for its melt-in-the-mouth Shrewsbury biscuits, walnut cakes, and cheese straws.",
            "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
            "source_name": "Camp Trade Association",
            "data_freshness": "Verified 2026"
        },
        {
            "name": "Pu La Deshpande Garden (Okayama Friendship Garden)",
            "category": "Park",
            "subcategory": "Japanese Stroll Garden",
            "address": "Sinhagad Rd, Dattawadi, Pune 411030",
            "lat": 18.4919,
            "lng": 73.8344,
            "price_tier": "₹",
            "avg_cost_inr": 20,
            "rating": 4.6,
            "rating_source": "PMC Garden Dept",
            "reviews_count": 19500,
            "opening_hours": "06:00 AM - 10:30 AM, 04:00 PM - 08:00 PM",
            "accessibility_wheelchair": True,
            "is_family_friendly": True,
            "description": "Sprawling 10-acre landscape garden inspired by Okayama's 300-year-old Korakuen Garden. Features water canals, wooden bridges, koi ponds, and sculpted flora.",
            "image_url": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
            "source_name": "Pune Municipal Corporation Gardens",
            "data_freshness": "Verified 2026"
        },
        {
            "name": "Saras Baug",
            "category": "Park",
            "subcategory": "Civic Garden & Lake Temple",
            "address": "Sanbaug Road, Sadashiv Peth, Pune 411030",
            "lat": 18.5009,
            "lng": 73.8538,
            "price_tier": "Free",
            "avg_cost_inr": 0,
            "rating": 4.5,
            "rating_source": "PMC Garden Department",
            "reviews_count": 22000,
            "opening_hours": "06:00 AM - 09:00 PM",
            "accessibility_wheelchair": True,
            "is_family_friendly": True,
            "description": "Historic 25-acre garden built on what was once a lakebed by Peshwa Madhavrao I in 1784. Houses the famous Talyatla Ganpati temple and wide green lawns.",
            "image_url": "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80",
            "source_name": "PMC Open Spaces Registry",
            "data_freshness": "Verified 2026"
        },
        {
            "name": "FC Road Shopping Street",
            "category": "Shopping",
            "subcategory": "Street Market & Boutiques",
            "address": "Fergusson College Road, Shivajinagar, Pune 411004",
            "lat": 18.5230,
            "lng": 73.8410,
            "price_tier": "₹",
            "avg_cost_inr": 400,
            "rating": 4.4,
            "rating_source": "Local Commerce Directory",
            "reviews_count": 14000,
            "opening_hours": "11:00 AM - 10:00 PM",
            "accessibility_wheelchair": False,
            "is_family_friendly": True,
            "description": "Vibrant budget shopping avenue featuring footwear, apparel, college souvenirs, and bustling street food stalls outside Fergusson College campus.",
            "image_url": "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80",
            "source_name": "Pune Retail Association",
            "data_freshness": "Verified 2026"
        },
        {
            "name": "Tulshibaug Market",
            "category": "Shopping",
            "subcategory": "Traditional Maharashtrian Bazaar",
            "address": "Budhwar Peth, Pune 411002",
            "lat": 18.5152,
            "lng": 73.8561,
            "price_tier": "₹",
            "avg_cost_inr": 300,
            "rating": 4.3,
            "rating_source": "Old Pune Merchant Guild",
            "reviews_count": 16500,
            "opening_hours": "10:00 AM - 09:30 PM (Closed Mon mornings)",
            "accessibility_wheelchair": False,
            "is_family_friendly": True,
            "description": "Pune's historic heart of traditional retail dating back to the Peshwa era, next to the 18th-century Ram temple. Packed with traditional brassware, cosmetics, jewelry, and spices.",
            "image_url": "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=800&q=80",
            "source_name": "Old City Heritage Walk",
            "data_freshness": "Verified 2026"
        },
        {
            "name": "Raja Dinkar Kelkar Museum",
            "category": "Heritage",
            "subcategory": "Artifacts Museum",
            "address": "Natraj Colony, Shukrawar Peth, Pune 411002",
            "lat": 18.5110,
            "lng": 73.8540,
            "price_tier": "₹",
            "avg_cost_inr": 100,
            "rating": 4.4,
            "rating_source": "State Museums Directorate",
            "reviews_count": 5200,
            "opening_hours": "10:00 AM - 05:30 PM",
            "accessibility_wheelchair": True,
            "is_family_friendly": True,
            "description": "Astonishing collection of 20,000+ everyday Indian artifacts assembled by Dr. D.G. Kelkar, including musical instruments, Mughal lamps, textiles, and the reconstructed Mastani Mahal.",
            "image_url": "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80",
            "source_name": "Museum Trust / Directorate of Archaeology",
            "data_freshness": "Verified 2026"
        },
        {
            "name": "KEM Hospital",
            "category": "Hospital",
            "subcategory": "Tertiary Care & Emergency Center",
            "address": "489, Rasta Peth, Sardar Moodliar Rd, Pune 411011",
            "lat": 18.5208,
            "lng": 73.8679,
            "price_tier": "₹₹",
            "avg_cost_inr": 500,
            "rating": 4.2,
            "rating_source": "NABH Health Accreditation",
            "reviews_count": 4800,
            "opening_hours": "24 Hours (Emergency)",
            "accessibility_wheelchair": True,
            "is_family_friendly": True,
            "description": "550-bed major charitable tertiary healthcare center with 24x7 trauma care, pediatric intensive care, and cardiac emergency response.",
            "image_url": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80",
            "source_name": "Public Health Registry",
            "data_freshness": "Verified 2026"
        },
        {
            "name": "Pune Railway Station Interchange",
            "category": "Public Transport",
            "subcategory": "Main Railway & Metro Station",
            "address": "Station Rd, Agarkar Nagar, Pune 411001",
            "lat": 18.5284,
            "lng": 73.8744,
            "price_tier": "Free",
            "avg_cost_inr": 20,
            "rating": 4.1,
            "rating_source": "Central Railway / Maha Metro",
            "reviews_count": 31000,
            "opening_hours": "24 Hours",
            "accessibility_wheelchair": True,
            "is_family_friendly": True,
            "description": "Primary rail terminus linking Pune to national destinations, integrated with Maha Metro Line 2 (Aqua Line) and PMPML city bus terminal.",
            "image_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
            "source_name": "Maha Metro & Indian Railways",
            "data_freshness": "Verified 2026"
        },
        {
            "name": "Swargate Multi-Modal Transit Hub",
            "category": "Public Transport",
            "subcategory": "Metro, MSRTC & PMPML Bus Depot",
            "address": "Swargate, Jedhe Chowk, Pune 411042",
            "lat": 18.5015,
            "lng": 73.8580,
            "price_tier": "Free",
            "avg_cost_inr": 20,
            "rating": 4.0,
            "rating_source": "MSRTC & Maha Metro",
            "reviews_count": 18900,
            "opening_hours": "24 Hours",
            "accessibility_wheelchair": True,
            "is_family_friendly": True,
            "description": "Massive southern transit exchange featuring underground Pune Metro station, interstate MSRTC bus terminal, and major intra-city bus terminus.",
            "image_url": "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
            "source_name": "Pune Municipal Transport Registry",
            "data_freshness": "Verified 2026"
        },
        {
            "name": "Hotel Shreyas",
            "category": "Hotel",
            "subcategory": "Heritage Hospitality & Dining",
            "address": "1242 B, Apte Rd, Shivajinagar, Pune 411004",
            "lat": 18.5245,
            "lng": 73.8441,
            "price_tier": "₹₹",
            "avg_cost_inr": 2200,
            "rating": 4.3,
            "rating_source": "Maharashtra Hospitality Board",
            "reviews_count": 4200,
            "opening_hours": "24 Hours Check-in",
            "accessibility_wheelchair": True,
            "is_family_friendly": True,
            "description": "Established Pune institution celebrated for comfortable mid-budget family stay and authentic Maharashtrian vegetarian Thali feast.",
            "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
            "source_name": "Hotel & Restaurant Association of Western India",
            "data_freshness": "Verified 2026"
        }
    ]

    places_objs = []
    for p in places_data:
        obj = Place(**p)
        db.add(obj)
        places_objs.append(obj)
    db.flush()

    # 3. Heritage Entries linked to places
    shaniwar_wada = next(p for p in places_objs if p.name == "Shaniwar Wada")
    aga_khan = next(p for p in places_objs if p.name == "Aga Khan Palace")
    pataleshwar = next(p for p in places_objs if p.name == "Pataleshwar Cave Temple")
    kelkar = next(p for p in places_objs if p.name == "Raja Dinkar Kelkar Museum")

    heritage_data = [
        Heritage(
            place_id=shaniwar_wada.id,
            historical_significance="Seat of the Peshwa prime ministers of the Maratha Empire until 1818.",
            era_period="Maratha Empire (1732 AD)",
            architectural_style="Maratha & Mughal Fortification with teakwood pillars",
            visiting_info="Light and sound show at 07:15 PM (Marathi) and 08:15 PM (English). Entry tickets at Delhi Gate.",
            verified_story="Foundation laid by Peshwa Baji Rao I on Saturday, 10 January 1730. The fort was heavily damaged by a mysterious fire in 1828 that burned for seven days, leaving the sturdy stone bastions and Delhi Darwaza standing today.",
            estimated_visit_mins=75,
            source_attribution="Archaeological Survey of India & Historical Records"
        ),
        Heritage(
            place_id=aga_khan.id,
            historical_significance="National Monument associated with the Indian Freedom Movement and Gandhi's Quit India internment.",
            era_period="British Raj (1892 AD)",
            architectural_style="Italianate Gothic with wide arches and sprawling garden terraces",
            visiting_info="Open daily except national holidays. Photography allowed in gardens. Museum houses Gandhi's personal items.",
            verified_story="Built in 1892 by the 3rd Aga Khan as a famine-relief initiative to employ thousands of villagers. During the 1942 Quit India struggle, Mahatma Gandhi, Kasturba Gandhi, and Mahadev Desai were imprisoned here. Kasturba and Mahadev Desai both breathed their last here; their samadhis rest peacefully within the palace gardens.",
            estimated_visit_mins=90,
            source_attribution="ASI Monument Notification No. 14 / National Gandhi Memorial"
        ),
        Heritage(
            place_id=pataleshwar.id,
            historical_significance="Ancient rock-cut shrine representing the earliest surviving architectural heritage of urban Pune.",
            era_period="Rashtrakuta Dynasty (8th Century AD)",
            architectural_style="Rock-cut Monolithic Basalt Architecture (similar to Ellora Caves)",
            visiting_info="Free entry. Cool shaded courtyard even in peak summer. Modest footwear removal required at sanctum.",
            verified_story="Carved straight into a single massive basalt outcrop in the 8th century, the sanctum houses a Shiva Lingam flanked by massive monolithic pillars. An extraordinary circular umbrella-shaped Nandi pavilion stands before the sanctum. The shrine was left slightly incomplete due to a faultline encountered in the rock.",
            estimated_visit_mins=45,
            source_attribution="Maharashtra Directorate of Archaeology & Museums"
        ),
        Heritage(
            place_id=kelkar.id,
            historical_significance="Single largest private collection of traditional Indian folk arts, lifestyle crafts, and musical instruments.",
            era_period="18th to 20th Century Craft Traditions",
            architectural_style="Traditional Peshwa Wada-style multi-storey galleries",
            visiting_info="Audio guides available. Close to Tulshibaug. Wheelchair ramp available at main ground wing.",
            verified_story="Between 1920 and 1960, optician and poet Dr. Dinkar Kelkar traversed rural corners of Maharashtra, Rajasthan, and Gujarat to salvage rare daily utensils, betel nut cutters, lamps, palanquins, and musical instruments before they vanished into modernity, donating them to the Government of Maharashtra in memory of his son Raja.",
            estimated_visit_mins=80,
            source_attribution="Kelkar Museum Trust / Government of Maharashtra"
        )
    ]
    db.add_all(heritage_data)

    # 4. Citizen Reports (Pune)
    now = datetime.now(timezone.utc)
    reports_data = [
        Report(
            report_code="REP-2026-0101",
            title="Deep road crater and broken asphalt causing bike skids",
            category="Pothole & Roadwork",
            description="Deep crater near the Baner D-Mart junction right after the service road turn. Two two-wheelers skidded during morning traffic. Needs immediate gravel patch.",
            severity="High",
            status="Verified",
            lat=18.5590,
            lng=73.7868,
            address="Baner Road, Near D-Mart, Pune 411045",
            reporter_name="Amitabh K. (Citizen Volunteer)",
            ai_category_tag="Pothole & Roadwork",
            urgency_score=0.85,
            verification_notes="Inspected by PMC Ward 9 Road Dept supervisor. Cold-mix patch scheduled for tomorrow.",
            verified_by="PMC Ward Inspector Patil",
            created_at=now - timedelta(hours=6)
        ),
        Report(
            report_code="REP-2026-0102",
            title="Severe waterlogging under Shimla Office Railway Underpass",
            category="Waterlogging",
            description="Over 1.5 feet of stagnant water accumulated following afternoon downpour under the railway bridge. Auto-rickshaws and two-wheelers are being diverted.",
            severity="High",
            status="Verified",
            lat=18.5312,
            lng=73.8475,
            address="Shimla Office Chowk, Shivajinagar, Pune 411005",
            reporter_name="Sneha Deshmukh",
            ai_category_tag="Waterlogging",
            urgency_score=0.90,
            verification_notes="Stormwater suction tanker deployed by PMC Disaster Cell. Traffic police rerouting via Sancheti bridge.",
            verified_by="Disaster Cell Pune",
            created_at=now - timedelta(hours=3)
        ),
        Report(
            report_code="REP-2026-0103",
            title="Unlit dark stretch due to 4 defunct streetlights",
            category="Broken Streetlight",
            description="All four streetlights between Lane 3 and Lane 5 near Model Colony Jogging Track are completely non-functional. The entire lane is pitch dark, raising pedestrian safety concerns.",
            severity="Medium",
            status="Under Review",
            lat=18.5365,
            lng=73.8340,
            address="Model Colony, Lane 4, Shivajinagar, Pune 411016",
            reporter_name="Kavita R.",
            ai_category_tag="Broken Streetlight",
            urgency_score=0.65,
            verification_notes="Ticket assigned to MSEDCL street lighting contract team.",
            created_at=now - timedelta(hours=14)
        ),
        Report(
            report_code="REP-2026-0104",
            title="Minor car collision at Swargate junction causing bottleneck",
            category="Accident",
            description="Minor rear-end collision between an MSRTC bus and hatchback at Jedhe Chowk. No severe injuries, but vehicles are blocking two lanes towards Saras Baug.",
            severity="Medium",
            status="Resolved",
            lat=18.5020,
            lng=73.8575,
            address="Jedhe Chowk, Swargate, Pune 411042",
            reporter_name="Traffic Marshal Joshi",
            ai_category_tag="Accident",
            urgency_score=0.70,
            verification_notes="Vehicles towed to side by Swargate Traffic Division; lanes reopened.",
            verified_by="Swargate Traffic Police",
            created_at=now - timedelta(hours=22)
        ),
        Report(
            report_code="REP-2026-0105",
            title="Metro utility excavation barricade encroaching footpath",
            category="Road Closure",
            description="Temporary metal barricades on Karve Road near Nal Stop have expanded onto the pedestrian footpath, forcing walkers onto the main roadway.",
            severity="Medium",
            status="Submitted",
            lat=18.5085,
            lng=73.8312,
            address="Karve Road, Near Nal Stop Flyover, Pune 411004",
            reporter_name="Rohan Varma",
            ai_category_tag="Road Closure",
            urgency_score=0.55,
            created_at=now - timedelta(hours=2)
        ),
        Report(
            report_code="REP-2026-0106",
            title="Poorly illuminated subway exit near Pune Station",
            category="Harassment / Unsafe Condition",
            description="Pedestrian subway exit leading to Sassoon road has flickering lighting and groups loitering late evening. Suggesting regular police patrolling.",
            severity="Medium",
            status="Under Review",
            lat=18.5270,
            lng=73.8730,
            address="Station Subway Exit, Sassoon Road, Pune 411001",
            reporter_name="Citizen Watch",
            ai_category_tag="Harassment / Unsafe Condition",
            urgency_score=0.72,
            created_at=now - timedelta(hours=10)
        )
    ]
    db.add_all(reports_data)

    # 5. Traffic Incidents
    traffic_data = [
        TrafficIncident(
            incident_type="Congestion",
            title="Heavy Crawling Traffic on Senapati Bapat Road",
            description="Evening office exit volume causing 20 min delays between Symbiosis College and Chatushrungi temple.",
            lat=18.5320,
            lng=73.8290,
            severity="High",
            delay_mins=22,
            source="Pune Traffic Police Advisory Feed (Demo)",
            is_active=True
        ),
        TrafficIncident(
            incident_type="Roadwork",
            title="Underground Cable Laying on Karve Road",
            description="Left lane barricaded for 200m near Garware College Metro station. Single lane movement.",
            lat=18.5110,
            lng=73.8350,
            severity="Moderate",
            delay_mins=12,
            source="Maha Metro Civic Works",
            is_active=True
        ),
        TrafficIncident(
            incident_type="Waterlogging",
            title="Water Stagnation Near Shivajinagar Underpass",
            description="Slow-moving traffic due to water accumulation; lane narrowing in place.",
            lat=18.5312,
            lng=73.8475,
            severity="Moderate",
            delay_mins=15,
            source="Disaster Management Cell",
            is_active=True
        )
    ]
    db.add_all(traffic_data)

    # 6. Community Posts (Demo Data)
    community_data = [
        CommunityPost(
            source_name="X / Twitter @PuneTrafficPolice",
            author="Pune Traffic Police Official",
            content="Heavy vehicular movement reported at Jedhe Chowk Swargate towards Saras Baug. Commuters heading to Sinhagad Road are advised to use Mitra Mandal Chowk diversion.",
            original_link="https://twitter.com/punetraffic",
            category="Traffic",
            location_name="Swargate / Jedhe Chowk",
            lat=18.5015,
            lng=73.8580,
            is_demo=True,
            verification_status="Official Department Broadcast",
            published_at=now - timedelta(hours=2)
        ),
        CommunityPost(
            source_name="Reddit r/pune",
            author="u/punekar_explorer",
            content="Anyone visiting Shaniwar Wada today: entry queues are moving fast, audio guide app works well. Note that parking on Bajirao road is strictly tow-away, park at Mandai multi-level parking instead!",
            original_link="https://reddit.com/r/pune",
            category="Cultural Event",
            location_name="Shaniwar Wada",
            lat=18.5196,
            lng=73.8553,
            is_demo=True,
            verification_status="Verified Community Tip",
            published_at=now - timedelta(hours=5)
        ),
        CommunityPost(
            source_name="Pune Citizen Forum RSS",
            author="Civic Grievance Forum",
            content="PMC stormwater line desilting drive in progress across Sadashiv Peth and Deccan Gymkhana ahead of monsoon forecast. Residents can submit clogged storm drain reports through CityPulse AI.",
            original_link="https://punecitizens.org",
            category="Civic Grievance",
            location_name="Sadashiv Peth",
            lat=18.5080,
            lng=73.8500,
            is_demo=True,
            verification_status="Public Bulletin",
            published_at=now - timedelta(hours=18)
        )
    ]
    db.add_all(community_data)

    db.commit()
    print("Database seeding completed successfully.")
