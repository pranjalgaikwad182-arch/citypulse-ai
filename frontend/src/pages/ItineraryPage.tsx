import React, { useState, useEffect } from 'react';
import { Place, Itinerary, ItineraryStop } from '../types';
import { api } from '../services/api';
import {
  CalendarCheck,
  Clock,
  Sparkles,
  MapPin,
  Trash2,
  Bookmark,
  Navigation,
  DollarSign,
  Car,
  Footprints,
  Train,
  CheckCircle,
  Plus,
  ArrowRight
} from 'lucide-react';

interface ItineraryPageProps {
  customStops: Place[];
  onRemoveCustomStop: (placeId: number) => void;
  showToast: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const ItineraryPage: React.FC<ItineraryPageProps> = ({
  customStops,
  onRemoveCustomStop,
  showToast,
}) => {
  // Generator Parameters
  const [startingLocation, setStartingLocation] = useState('Shivajinagar Interchange');
  const [availableHours, setAvailableHours] = useState(4.0);
  const [budget, setBudget] = useState(1000);
  const [travelMode, setTravelMode] = useState('driving');
  const [preferredStopsCount, setPreferredStopsCount] = useState(4);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Heritage', 'Food', 'Park']);
  const [wheelchairOnly, setWheelchairOnly] = useState(false);

  // Active generated itinerary
  const [generatedItinerary, setGeneratedItinerary] = useState<Itinerary | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(false);

  const interestOptions = ['Heritage', 'Food', 'Park', 'Shopping', 'Tourist Attraction'];

  useEffect(() => {
    loadSavedItineraries();
  }, []);

  const loadSavedItineraries = async () => {
    try {
      const saved = await api.getSavedItineraries();
      setSavedItineraries(saved);
    } catch (err) {
      console.warn('Could not load saved itineraries:', err);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.generateItinerary({
        starting_location: startingLocation,
        available_time_hours: availableHours,
        budget_inr: budget,
        interests: selectedInterests,
        travel_mode: travelMode,
        preferred_stops_count: preferredStopsCount,
        wheelchair_only: wheelchairOnly,
      });
      setGeneratedItinerary(res);
      showToast('Itinerary Generated', `${res.title} planned with ${res.stops.length} stops.`, 'success');
    } catch (err: any) {
      showToast('Generation Error', err.message || 'Unable to generate itinerary.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedItinerary) return;
    try {
      const saved = await api.saveItinerary(generatedItinerary);
      setSavedItineraries((prev) => [saved, ...prev]);
      showToast('Itinerary Saved', 'Your itinerary has been saved to your profile.', 'success');
    } catch (err: any) {
      showToast('Save Failed', err.message || 'Could not save itinerary.', 'error');
    }
  };

  const handleDeleteSaved = async (id?: number) => {
    if (!id) return;
    try {
      await api.deleteItinerary(id);
      setSavedItineraries((prev) => prev.filter((it) => it.id !== id));
      showToast('Deleted', 'Itinerary removed from saved trips.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((i) => i !== interest));
      }
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const removeStop = (idx: number) => {
    if (!generatedItinerary) return;
    const newStops = [...generatedItinerary.stops];
    newStops.splice(idx, 1);
    setGeneratedItinerary({
      ...generatedItinerary,
      stops: newStops,
      total_duration_mins: Math.max(30, generatedItinerary.total_duration_mins - 45),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-emerald-900/40 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold mb-3">
          <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Intelligent Route & Schedule Synthesizer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Smart City Itinerary Planner
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Plan tailored exploration routes based on your available hours, exact budget, preferred interests, and mobility preferences.
          Synthesized through nearest-neighbor spatial algorithms with verified opening hours and cost limits.
        </p>
      </div>

      {/* Generator Configuration Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Itinerary Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs text-slate-300">
          {/* Starting Point */}
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Starting Hub
            </label>
            <select
              value={startingLocation}
              onChange={(e) => setStartingLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Shivajinagar Interchange">Shivajinagar Interchange</option>
              <option value="Pune Railway Station">Pune Railway Station</option>
              <option value="Swargate Transit Hub">Swargate Transit Hub</option>
              <option value="Deccan Gymkhana">Deccan Gymkhana (FC Rd)</option>
              <option value="Viman Nagar">Viman Nagar (Airport)</option>
            </select>
          </div>

          {/* Available Time */}
          <div>
            <div className="flex justify-between font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              <span>Available Time:</span>
              <span className="text-cyan-400 font-bold">{availableHours} Hours</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              step="0.5"
              value={availableHours}
              onChange={(e) => setAvailableHours(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Budget */}
          <div>
            <div className="flex justify-between font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              <span>Budget Cap:</span>
              <span className="text-emerald-400 font-bold">₹{budget}</span>
            </div>
            <input
              type="range"
              min="200"
              max="3000"
              step="100"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Preferred Stops */}
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Number of Stops
            </label>
            <select
              value={preferredStopsCount}
              onChange={(e) => setPreferredStopsCount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value={2}>2 Highlights (Relaxed)</option>
              <option value={3}>3 Stops (Standard)</option>
              <option value={4}>4 Stops (Comprehensive)</option>
              <option value={5}>5 Stops (Fast Pace)</option>
            </select>
          </div>
        </div>

        {/* Interests & Accessibility */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Interests & Focus Categories:
            </label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((opt) => {
                const isSelected = selectedInterests.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleToggleInterest(opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-600 border-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="itin-wheelchair"
              checked={wheelchairOnly}
              onChange={(e) => setWheelchairOnly(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="itin-wheelchair" className="text-xs text-slate-300 cursor-pointer select-none">
              Filter exclusively for wheelchair accessible stops
            </label>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Synthesizing Itinerary...' : 'Generate Smart Itinerary'}</span>
        </button>
      </div>

      {/* Generated Itinerary Display */}
      {generatedItinerary && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300">
                Generated Plan
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {generatedItinerary.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Starting at {generatedItinerary.starting_location} • Est. Travel Distance: ~{generatedItinerary.distance_estimate_km} km
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-400">Total Approx Cost</div>
                <div className="text-lg font-bold text-emerald-400">
                  ₹{generatedItinerary.estimated_cost_inr}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-4 h-4" />
                <span>Save Itinerary</span>
              </button>
            </div>
          </div>

          {/* Ordered Stops Timeline */}
          <div className="space-y-4">
            {generatedItinerary.stops.map((stop, idx) => (
              <div
                key={stop.place_id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 font-bold text-sm flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{stop.name}</h4>
                      <span className="text-[10px] bg-slate-800 text-cyan-400 px-2 py-0.5 rounded">
                        {stop.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{stop.notes}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{stop.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Est. Stay & Cost</span>
                    <span className="font-semibold text-slate-200">
                      {stop.visit_duration_mins}m • {stop.approx_cost_inr === 0 ? 'Free' : `₹${stop.approx_cost_inr}`}
                    </span>
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white"
                    title="Directions"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => removeStop(idx)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition"
                    title="Remove Stop"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 italic pt-2">
            Notice: {generatedItinerary.disclaimer}
          </div>
        </section>
      )}

      {/* Saved Itineraries Section */}
      {savedItineraries.length > 0 && (
        <section className="space-y-4 pt-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-emerald-400" />
            Your Saved City Itineraries ({savedItineraries.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedItineraries.map((it) => (
              <div
                key={it.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white">{it.title}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSaved(it.id)}
                      className="text-slate-500 hover:text-rose-400 transition p-1"
                      title="Delete saved itinerary"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-400 mb-3">
                    {it.stops.length} stops • Total Cost: ₹{it.estimated_cost_inr} • {it.total_duration_mins} mins
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {it.stops.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-300"
                      >
                        {idx + 1}. {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500">From: {it.starting_location}</span>
                  <button
                    type="button"
                    onClick={() => setGeneratedItinerary(it)}
                    className="text-cyan-400 hover:underline font-medium"
                  >
                    Load into viewer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
