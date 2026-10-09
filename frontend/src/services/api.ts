import {
  Place,
  HeritageSite,
  CitizenReport,
  DuplicateCheckResult,
  ComparisonResponse,
  RouteCompareResponse,
  AIChatResponse,
  WeatherData,
  TrafficIncident,
  CommunityPost,
  Itinerary,
  CityAnalytics,
  User
} from '../types';

const BASE_URL = '/api';

export const api = {
  // Places
  async getPlaces(params?: {
    category?: string;
    max_budget?: number;
    min_rating?: number;
    wheelchair_only?: boolean;
    family_only?: boolean;
    query?: string;
  }): Promise<Place[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.max_budget) searchParams.set('max_budget', params.max_budget.toString());
    if (params?.min_rating) searchParams.set('min_rating', params.min_rating.toString());
    if (params?.wheelchair_only) searchParams.set('wheelchair_only', 'true');
    if (params?.family_only) searchParams.set('family_only', 'true');
    if (params?.query) searchParams.set('query', params.query);

    const res = await fetch(`${BASE_URL}/places?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch places');
    return res.json();
  },

  async getPlaceById(id: number): Promise<Place> {
    const res = await fetch(`${BASE_URL}/places/${id}`);
    if (!res.ok) throw new Error('Failed to fetch place details');
    return res.json();
  },

  // Heritage
  async getHeritage(): Promise<HeritageSite[]> {
    const res = await fetch(`${BASE_URL}/heritage`);
    if (!res.ok) throw new Error('Failed to fetch heritage sites');
    return res.json();
  },

  async getHeritageStory(id: number): Promise<any> {
    const res = await fetch(`${BASE_URL}/heritage/${id}/story`);
    if (!res.ok) throw new Error('Failed to fetch heritage story');
    return res.json();
  },

  // Citizen Reports
  async getReports(params?: { category?: string; status?: string; severity?: string }): Promise<CitizenReport[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.severity) searchParams.set('severity', params.severity);

    const res = await fetch(`${BASE_URL}/reports?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  async checkDuplicate(formData: FormData): Promise<DuplicateCheckResult> {
    const res = await fetch(`${BASE_URL}/reports/check-duplicate`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to check duplicate reports');
    return res.json();
  },

  async submitReport(formData: FormData): Promise<CitizenReport> {
    const res = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to submit report');
    }
    return res.json();
  },

  async updateReportStatus(
    id: number,
    data: { status?: string; verification_notes?: string; severity?: string },
    token: string
  ): Promise<CitizenReport> {
    const res = await fetch(`${BASE_URL}/reports/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update report status');
    return res.json();
  },

  // Place Comparison
  async comparePlaces(
    placeIds: number[],
    weights?: Record<string, number>,
    userCoords?: { lat: number; lng: number }
  ): Promise<ComparisonResponse> {
    const res = await fetch(`${BASE_URL}/places/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        place_ids: placeIds,
        weights,
        user_lat: userCoords?.lat,
        user_lng: userCoords?.lng,
      }),
    });
    if (!res.ok) throw new Error('Failed to compare places');
    return res.json();
  },

  // Risk-Aware Routes
  async compareRoutes(
    start: { lat: number; lng: number; name?: string },
    dest: { lat: number; lng: number; name?: string }
  ): Promise<RouteCompareResponse> {
    const res = await fetch(`${BASE_URL}/routes/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_lat: start.lat,
        start_lng: start.lng,
        start_name: start.name,
        dest_lat: dest.lat,
        dest_lng: dest.lng,
        dest_name: dest.name,
      }),
    });
    if (!res.ok) throw new Error('Failed to compare routes');
    return res.json();
  },

  // AI Chat
  async sendAIChat(
    message: string,
    coords?: { lat: number; lng: number },
    history?: Array<{ role: string; content: string }>
  ): Promise<AIChatResponse> {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        user_lat: coords?.lat,
        user_lng: coords?.lng,
        conversation_history: history || [],
      }),
    });
    if (!res.ok) throw new Error('Failed to process AI chat');
    return res.json();
  },

  // Weather, Traffic, Community
  async getWeather(): Promise<WeatherData> {
    const res = await fetch(`${BASE_URL}/weather`);
    if (!res.ok) throw new Error('Failed to fetch weather');
    return res.json();
  },

  async getTraffic(): Promise<TrafficIncident[]> {
    const res = await fetch(`${BASE_URL}/traffic`);
    if (!res.ok) throw new Error('Failed to fetch traffic');
    return res.json();
  },

  async getCommunity(): Promise<CommunityPost[]> {
    const res = await fetch(`${BASE_URL}/community`);
    if (!res.ok) throw new Error('Failed to fetch community updates');
    return res.json();
  },

  // Smart Itinerary
  async generateItinerary(params: {
    starting_location: string;
    available_time_hours: number;
    budget_inr: number;
    interests: string[];
    travel_mode: string;
    preferred_stops_count: number;
    wheelchair_only: boolean;
  }): Promise<Itinerary> {
    const res = await fetch(`${BASE_URL}/itineraries/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to generate itinerary');
    return res.json();
  },

  async saveItinerary(itinerary: Itinerary): Promise<Itinerary> {
    const res = await fetch(`${BASE_URL}/itineraries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itinerary),
    });
    if (!res.ok) throw new Error('Failed to save itinerary');
    return res.json();
  },

  async getSavedItineraries(): Promise<Itinerary[]> {
    const res = await fetch(`${BASE_URL}/itineraries`);
    if (!res.ok) throw new Error('Failed to fetch saved itineraries');
    return res.json();
  },

  async deleteItinerary(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/itineraries/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete itinerary');
  },

  // Analytics
  async getAnalytics(): Promise<CityAnalytics> {
    const res = await fetch(`${BASE_URL}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Authentication failed');
    }
    return res.json();
  },

  async getMe(token: string): Promise<User> {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch user session');
    return res.json();
  },
};
