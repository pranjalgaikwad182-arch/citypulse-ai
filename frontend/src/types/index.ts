export interface Place {
  id: number;
  name: str;
  category: string;
  subcategory?: string;
  address: string;
  lat: number;
  lng: number;
  price_tier?: string;
  avg_cost_inr?: number;
  rating?: number;
  rating_source?: string;
  reviews_count: number;
  opening_hours?: string;
  accessibility_wheelchair: boolean;
  is_family_friendly: boolean;
  description?: string;
  image_url?: string;
  source_name: string;
  data_freshness: string;
  created_at: string;
}

type str = string;

export interface HeritageSite {
  id: number;
  place_id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  image_url?: string;
  historical_significance: string;
  era_period?: string;
  architectural_style?: string;
  visiting_info?: string;
  verified_story: string;
  estimated_visit_mins: number;
  source_attribution: string;
}

export interface CitizenReport {
  id: number;
  report_code: string;
  title: string;
  category: string;
  description: string;
  severity: "Low" | "Medium" | "High";
  status: "Submitted" | "Under Review" | "Verified" | "Resolved" | "Rejected";
  lat: number;
  lng: number;
  address: string;
  photo_url?: string;
  audio_url?: string;
  reporter_name: string;
  duplicate_of_id?: number;
  ai_category_tag?: string;
  urgency_score: number;
  verification_notes?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DuplicateCheckResult {
  has_duplicates: boolean;
  suggested_duplicates: Array<{
    report_id: number;
    title: string;
    similarity_score: number;
    distance_km: number;
    status: string;
    created_at?: string;
  }>;
  inferred_category: string;
  urgency_score: number;
}

export interface DimensionBreakdown {
  dimension: string;
  score: number;
  raw_value: string;
  source: string;
  freshness: string;
  weight: number;
}

export interface ComparisonPlaceItem {
  place_id: number;
  name: string;
  category: string;
  image_url?: string;
  total_score: number;
  is_sufficient_data: boolean;
  dimensions: DimensionBreakdown[];
  summary_verdict: string;
}

export interface ComparisonResponse {
  places: ComparisonPlaceItem[];
  weights_used: Record<string, number>;
  recommendation_explanation: string;
  best_place_id?: number;
}

export interface RouteAlternative {
  route_id: string;
  title: string;
  distance_km: number;
  duration_mins: number;
  path_coordinates: [number, number][];
  nearby_incidents_count: number;
  nearby_incidents: Array<{
    id: number;
    title: string;
    category: string;
    severity: string;
    status: string;
    address: string;
    distance_to_corridor_m: number;
    created_at: string;
  }>;
  safety_risk_level: string;
  recommendation_rationale: string;
  cautious_advisory: string;
}

export interface RouteCompareResponse {
  provider: string;
  routes: RouteAlternative[];
  recommended_route_id: string;
  safety_disclaimer: string;
}

export interface AIPlaceCard {
  id: number;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  price_tier?: string;
  reason: string;
  evidence_source: string;
}

export interface AIChatResponse {
  answer: string;
  inferred_intent: {
    categories: string[];
    max_budget?: number;
    requires_wheelchair: boolean;
    requires_family: boolean;
    keywords: string[];
  };
  places: AIPlaceCard[];
  safety_notes?: string;
  data_limitations?: string;
  is_fallback: boolean;
}

export interface WeatherData {
  city: string;
  temp_celsius: number;
  feels_like_celsius: number;
  humidity_percent: number;
  wind_kmh: number;
  condition: string;
  description: string;
  icon: string;
  practical_advice: string;
  provider: string;
  is_demo: boolean;
  updated_at: string;
}

export interface TrafficIncident {
  id: number;
  incident_type: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  severity: string;
  delay_mins: number;
  source: string;
  is_active: boolean;
  created_at: string;
}

export interface CommunityPost {
  id: number;
  source_name: string;
  author: string;
  content: string;
  original_link?: string;
  category: string;
  location_name?: string;
  lat?: number;
  lng?: number;
  is_demo: boolean;
  verification_status: string;
  published_at: string;
}

export interface ItineraryStop {
  place_id: number;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  visit_duration_mins: number;
  approx_cost_inr: number;
  image_url?: string;
  opening_hours?: string;
  notes: string;
}

export interface Itinerary {
  id?: number;
  title: string;
  starting_location: string;
  available_time_hours: number;
  budget_inr: number;
  travel_mode: string;
  total_duration_mins: number;
  estimated_cost_inr: number;
  stops: ItineraryStop[];
  distance_estimate_km: number;
  disclaimer: string;
}

export interface CityAnalytics {
  total_places: number;
  total_reports: number;
  open_reports: number;
  resolved_reports: number;
  reports_by_category: { category: string; count: number }[];
  reports_by_status: { status: string; count: number }[];
  monthly_trends: { period: string; reported: number; resolved: number }[];
  hotspot_clusters: { area: string; incidents: number; dominant_issue: string; risk_index: string }[];
  avg_resolution_hours: number;
  source_freshness_stats: { source: string; records: number; freshness: string }[];
  data_mode: string;
}

export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: "admin" | "citizen";
  is_active: boolean;
}
