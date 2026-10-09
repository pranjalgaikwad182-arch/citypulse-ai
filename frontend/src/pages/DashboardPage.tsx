import React, { useState } from 'react';
import { Place, CitizenReport, WeatherData, TrafficIncident } from '../types';
import { CityMap } from '../components/CityMap';
import { PlaceCard } from '../components/PlaceCard';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Shield,
  Sparkles,
  CloudSun,
  AlertTriangle,
  ArrowRight,
  MapPin,
  TrendingUp,
  Layers,
  Search,
  CheckCircle2,
  Car
} from 'lucide-react';

interface DashboardPageProps {
  places: Place[];
  reports: CitizenReport[];
  weather: WeatherData | null;
  traffic: TrafficIncident[];
  onAddToItinerary: (place: Place) => void;
  itineraryPlaceIds: number[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  places,
  reports,
  weather,
  traffic,
  onAddToItinerary,
  itineraryPlaceIds,
}) => {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickCategory, setQuickCategory] = useState('All');
  const [aiInput, setAiInput] = useState('');
  const navigate = useNavigate();

  const categories = ['All', 'Food', 'Heritage', 'Park', 'Shopping', 'Tourist Attraction'];

  const filteredPlaces = places.filter((p) => {
    const matchCat = quickCategory === 'All' || p.category === quickCategory;
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeHazards = reports.filter((r) => r.severity === 'High' && r.status !== 'Resolved');

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiInput.trim()) {
      navigate(`/ai?q=${encodeURIComponent(aiInput)}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Search & AI Companion Entry */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/60 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-Powered Urban Decision Support • Pune, MH</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Explore Smarter. Travel Safer.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">
              Experience More.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
            Transforming fragmented municipal records, real-time citizen voice reports, verified heritage gazetteers, and route hazards into actionable intelligence.
          </p>

          {/* AI Quick Query Bar */}
          <form onSubmit={handleAiSubmit} className="flex flex-col sm:flex-row gap-2 max-w-2xl mb-4">
            <div className="relative flex-1">
              <Sparkles className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400" />
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask AI: 'Find affordable food near Shaniwar Wada under ₹200'..."
                className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-violet-500 pl-11 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none transition shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-violet-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ask Companion</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-500 font-medium">Quick Prompts:</span>
            {[
              'Wheelchair accessible heritage places',
              'Affordable street food on FC Road',
              'Active waterlogging or road closures',
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => navigate(`/ai?q=${encodeURIComponent(prompt)}`)}
                className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/60 transition cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Live City Pulse Ticker: Weather, Road Condition & Safety Alert */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weather Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <CloudSun className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Pune Weather</span>
              <span className="text-[10px] text-emerald-400 font-medium">Updated</span>
            </div>
            <div className="text-xl font-bold text-white flex items-baseline gap-2">
              {weather ? `${Math.round(weather.temp_celsius)}°C` : '28°C'}
              <span className="text-xs font-normal text-slate-300">
                {weather?.condition || 'Partly Cloudy'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5" title={weather?.practical_advice}>
              {weather?.practical_advice || 'Pleasant weather for outdoor city exploration.'}
            </p>
          </div>
        </div>

        {/* Traffic Pulse */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Car className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Traffic & Road Works</span>
              <span className="text-[10px] text-cyan-400 font-medium">{traffic.length} Active Feeds</span>
            </div>
            <div className="text-sm font-bold text-white truncate mt-0.5">
              {traffic[0]?.title || 'Moderate Traffic Flow on Arterial Corridors'}
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {traffic[0]?.description || 'Check route assistance before traveling.'}
            </p>
          </div>
        </div>

        {/* Citizen Safety Alerts */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            activeHazards.length > 0 ? 'bg-rose-500/10 border border-rose-500/30' : 'bg-emerald-500/10 border border-emerald-500/30'
          }`}>
            <AlertTriangle className={`w-6 h-6 ${activeHazards.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Safety & Hazards</span>
              <Link to="/safety" className="text-[10px] text-cyan-400 hover:underline">
                View All ({reports.length})
              </Link>
            </div>
            <div className="text-sm font-bold text-white truncate mt-0.5">
              {activeHazards.length > 0
                ? `${activeHazards.length} High-Severity Incident(s)`
                : 'No Critical Emergencies Active'}
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {activeHazards[0]?.title || 'Community reporting operational.'}
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Map & Side Explorer */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Interactive City Explorer & Incident Radar
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select category markers to view details, historical stories, or active citizen safety reports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/safety"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Route Safety Assistant</span>
            </Link>
            <Link
              to="/compare"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              <span>Compare Places</span>
            </Link>
          </div>
        </div>

        {/* Map Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CityMap
              places={filteredPlaces}
              reports={reports}
              selectedPlace={selectedPlace}
              onSelectPlace={(p) => setSelectedPlace(p)}
              height="520px"
            />
          </div>

          {/* Quick Info & Selected Place Spotlight */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-[520px] overflow-y-auto">
            {selectedPlace ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                    {selectedPlace.category}
                  </span>
                  <button
                    onClick={() => setSelectedPlace(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Clear selection
                  </button>
                </div>

                {selectedPlace.image_url && (
                  <img
                    src={selectedPlace.image_url}
                    alt={selectedPlace.name}
                    className="w-full h-36 object-cover rounded-xl"
                  />
                )}

                <div>
                  <h3 className="font-bold text-lg text-white">{selectedPlace.name}</h3>
                  <div className="text-xs text-slate-400">{selectedPlace.subcategory}</div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedPlace.description}
                </p>

                <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Average Admission/Meal:</span>
                    <span className="font-bold text-emerald-400">
                      {selectedPlace.avg_cost_inr === 0 ? 'Free' : `₹${selectedPlace.avg_cost_inr}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Rating:</span>
                    <span className="font-bold text-amber-400">
                      {selectedPlace.rating ? `${selectedPlace.rating} / 5.0` : 'Unrated'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Wheelchair Friendly:</span>
                    <span className={selectedPlace.accessibility_wheelchair ? 'text-emerald-400' : 'text-slate-500'}>
                      {selectedPlace.accessibility_wheelchair ? 'Yes (Verified)' : 'Limited / Step Access'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => onAddToItinerary(selectedPlace)}
                    className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs transition"
                  >
                    {itineraryPlaceIds.includes(selectedPlace.id) ? 'Added to Itinerary' : 'Add to Itinerary'}
                  </button>
                  <Link
                    to={`/explore?q=${encodeURIComponent(selectedPlace.name)}`}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    City Overview Spotlight
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Click any marker on the map to inspect place details, historical significance, or reported hazards.
                  </p>

                  <div className="space-y-3">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="text-xs font-semibold text-slate-200 mb-1">
                        Recent Verified Community Reports
                      </div>
                      <div className="space-y-2 mt-2">
                        {reports.slice(0, 3).map((rep) => (
                          <div key={rep.id} className="text-[11px] border-l-2 border-cyan-500 pl-2">
                            <div className="font-medium text-slate-300 truncate">{rep.title}</div>
                            <div className="text-slate-500 text-[10px]">{rep.category} • {rep.status}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="text-xs font-semibold text-slate-200 mb-1">
                        Active Demonstration City
                      </div>
                      <div className="text-xs text-slate-400 leading-relaxed">
                        Pune, Maharashtra is currently active with 16 audited places, 4 ASI heritage records, and live incident correlation.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <Link
                    to="/reports"
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition flex items-center justify-center gap-2"
                  >
                    <span>Submit Citizen Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recommended Places in Pune */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              Discover Pune: Handpicked Spots
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Verified food, heritage landmarks, and budget-friendly discoveries.
            </p>
          </div>

          {/* Quick Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setQuickCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  quickCategory === cat
                    ? 'bg-cyan-600 text-slate-950 font-semibold shadow-md shadow-cyan-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Place Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredPlaces.slice(0, 8).map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onViewOnMap={(p) => {
                setSelectedPlace(p);
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
              onAddToItinerary={onAddToItinerary}
              isAddedToItinerary={itineraryPlaceIds.includes(place.id)}
              onToggleCompare={(p) => navigate(`/compare?add=${p.id}`)}
            />
          ))}
        </div>

        <div className="text-center pt-4">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
          >
            <span>View All Explore Listings & Full Filters</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
