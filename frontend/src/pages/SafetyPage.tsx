import React, { useState, useEffect } from 'react';
import { CitizenReport, RouteAlternative, RouteCompareResponse } from '../types';
import { api } from '../services/api';
import { CityMap } from '../components/CityMap';
import {
  Shield,
  AlertTriangle,
  Navigation,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  ArrowRight,
  Info,
  Car,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface SafetyPageProps {
  reports: CitizenReport[];
}

export const SafetyPage: React.FC<SafetyPageProps> = ({ reports }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Routing State
  const [routeOrigin, setRouteOrigin] = useState<string>('Shivajinagar Interchange');
  const [routeDest, setRouteDest] = useState<string>('Swargate Transit Hub');
  const [routeResult, setRouteResult] = useState<RouteCompareResponse | null>(null);
  const [activeRouteId, setActiveRouteId] = useState<string>('route-1');
  const [routingLoading, setRoutingLoading] = useState<boolean>(false);

  const presets = [
    {
      label: 'Shivajinagar ➔ Swargate (Central Corridor)',
      start: { lat: 18.5314, lng: 73.8446, name: 'Shivajinagar Interchange' },
      dest: { lat: 18.5015, lng: 73.8580, name: 'Swargate Transit Hub' },
    },
    {
      label: 'FC Road ➔ Pune Railway Station',
      start: { lat: 18.5199, lng: 73.8407, name: 'FC Road, Deccan' },
      dest: { lat: 18.5284, lng: 73.8744, name: 'Pune Railway Station' },
    },
    {
      label: 'Baner ➔ Deccan Gymkhana',
      start: { lat: 18.5590, lng: 73.7868, name: 'Baner Road Junction' },
      dest: { lat: 18.5173, lng: 73.8415, name: 'Deccan Gymkhana' },
    },
  ];

  const handleRunRouting = async (
    start = { lat: 18.5314, lng: 73.8446, name: routeOrigin },
    dest = { lat: 18.5015, lng: 73.8580, name: routeDest }
  ) => {
    setRoutingLoading(true);
    try {
      const res = await api.compareRoutes(start, dest);
      setRouteResult(res);
      setActiveRouteId(res.recommended_route_id);
    } catch (err) {
      console.error('Failed to compare routes:', err);
    } finally {
      setRoutingLoading(false);
    }
  };

  useEffect(() => {
    // Run default route analysis on mount
    handleRunRouting();
  }, []);

  const filteredReports = reports.filter((r) => {
    const matchSev = selectedSeverity === 'All' || r.severity === selectedSeverity;
    const matchCat = selectedCategory === 'All' || r.category === selectedCategory;
    return matchSev && matchCat;
  });

  const activeRoute = routeResult?.routes.find((r) => r.route_id === activeRouteId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-rose-900/40 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950 border border-rose-800 text-rose-300 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5 text-rose-400" />
          <span>Safety Intelligence & Risk-Aware Routing</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Urban Safety & Hazard Awareness
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Real-time citizen reporting of road closures, waterlogging, pothole craters, broken streetlights, and traffic bottlenecks.
          Includes route comparison to identify hazard corridors before you travel.
        </p>
      </div>

      {/* Cautionary Safety Notice */}
      <div className="bg-amber-950/20 border border-amber-900/50 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <strong className="text-amber-300 font-semibold block mb-0.5">
            Transparent Safety Communication Notice:
          </strong>
          Incident observations are based on verified citizen reports, civic bulletins, and municipal alerts.
          CityPulse AI never claims a route is guaranteed safe; lack of reported incidents does not mean zero risk.
          Please check current ground conditions and obey local police directives.
        </div>
      </div>

      {/* Risk-Aware Route Assistance Section */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Navigation className="w-4 h-4" /> Risk-Aware Route Assistance
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Compare Routes with Spatial Incident Corridor Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Analyze route alternatives and detect reported potholes, accidents, and waterlogging within corridor buffer zones.
          </p>
        </div>

        {/* Preset Route Selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Quick Route Corridors:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setRouteOrigin(p.start.name);
                setRouteDest(p.dest.name);
                handleRunRouting(p.start, p.dest);
              }}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Routing Results & Map Comparison */}
        {routeResult && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {/* Map Preview of Route */}
            <div className="lg:col-span-2">
              <CityMap
                reports={reports}
                routePolyline={activeRoute?.path_coordinates}
                routeColor={activeRouteId === 'route-1' ? '#06b6d4' : '#8b5cf6'}
                height="450px"
              />
            </div>

            {/* Alternatives Cards */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                {routeResult.routes.map((rt) => {
                  const isSelected = rt.route_id === activeRouteId;
                  const isRec = rt.route_id === routeResult.recommended_route_id;

                  return (
                    <div
                      key={rt.route_id}
                      onClick={() => setActiveRouteId(rt.route_id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-white">{rt.title}</span>
                        {isRec && (
                          <span className="text-[10px] bg-emerald-950 border border-emerald-700 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                            Recommended
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Distance:</span>
                          <span className="font-bold text-slate-200">{rt.distance_km} km</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Est. Time:</span>
                          <span className="font-bold text-slate-200">~{rt.duration_mins} mins</span>
                        </div>
                      </div>

                      {/* Corridor Incident Warning */}
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Reported Hazards:</span>
                          <span className={`font-bold ${rt.nearby_incidents_count > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {rt.nearby_incidents_count} along corridor
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-300 font-medium">{rt.safety_risk_level}</div>
                        <p className="text-[10px] text-slate-400 italic mt-1 leading-snug">
                          {rt.recommendation_rationale}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
                <span className="text-slate-300 font-semibold block mb-0.5">Corridor Cautionary Rule:</span>
                {activeRoute?.cautious_advisory}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Incident Reports Feed & Filters */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Active Citizen & Civic Incident Feed
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Filter by reported severity and incident category across Pune municipal wards.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Severities</option>
              <option value="High">High Severity</option>
              <option value="Medium">Medium Severity</option>
              <option value="Low">Low Severity</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Categories</option>
              <option value="Pothole & Roadwork">Pothole & Roadwork</option>
              <option value="Waterlogging">Waterlogging</option>
              <option value="Broken Streetlight">Broken Streetlight</option>
              <option value="Accident">Accident</option>
              <option value="Road Closure">Road Closure</option>
              <option value="Harassment / Unsafe Condition">Harassment / Unsafe</option>
            </select>
          </div>
        </div>

        {/* Reports Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((rep) => {
            const isHigh = rep.severity === 'High';
            const isVerified = rep.status === 'Verified';

            return (
              <div
                key={rep.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        isHigh
                          ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                          : 'bg-amber-950/80 border-amber-800 text-amber-300'
                      }`}
                    >
                      {rep.severity} Severity
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                        isVerified
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : rep.status === 'Resolved'
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-950 text-amber-400 border border-slate-800'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white mb-1.5 leading-snug">{rep.title}</h3>
                  <div className="text-xs text-cyan-400 font-medium mb-2">{rep.category}</div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {rep.description}
                  </p>

                  {rep.verification_notes && (
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 mb-3">
                      <strong className="text-slate-300 block mb-0.5">Municipal Verification Note:</strong>
                      {rep.verification_notes}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{rep.address}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span>ID: {rep.report_code}</span>
                    <span>Reported by: {rep.reporter_name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
