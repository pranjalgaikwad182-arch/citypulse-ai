import React, { useState, useEffect } from 'react';
import { CityAnalytics } from '../types';
import { api } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Clock,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Database,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<CityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAnalytics()
      .then((data) => setAnalytics(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-cyan-900/40 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-semibold mb-3">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Municipal Metrics & Urban Analytics Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          City-Level Observations & Incident Trends
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Aggregated diagnostics calculated dynamically from citizen reports, municipal road maintenance logs, and verified point-of-interest databases.
        </p>
      </div>

      {loading || !analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-2xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Audited Places</span>
                <div className="text-2xl font-black text-white mt-1">{analytics.total_places}</div>
                <span className="text-[10px] text-cyan-400">Pune Open Registry</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Database className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Total Citizen Reports</span>
                <div className="text-2xl font-black text-white mt-1">{analytics.total_reports}</div>
                <span className="text-[10px] text-amber-400">{analytics.open_reports} Active / In Review</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Resolved Incidents</span>
                <div className="text-2xl font-black text-white mt-1">{analytics.resolved_reports}</div>
                <span className="text-[10px] text-emerald-400">Verified by Marshals</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Avg Resolution Time</span>
                <div className="text-2xl font-black text-white mt-1">{analytics.avg_resolution_hours}h</div>
                <span className="text-[10px] text-slate-400">Ward Dispatch Turnaround</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reports by Category Bar Chart */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">Reports by Category</h3>
                  <span className="text-xs text-slate-400">Incident breakdown across civic domains</span>
                </div>
                <BarChart3 className="w-5 h-5 text-cyan-400" />
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.reports_by_category} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="category"
                      stroke="#94a3b8"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Incident Trend Line Chart */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">Incident Trends Over Time</h3>
                  <span className="text-xs text-slate-400">Reported vs. Resolved incident progression</span>
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.monthly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="period" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="reported" stroke="#ef4444" strokeWidth={2} name="Reported Hazards" />
                    <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Geographic Hotspot Clusters Table */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                Geographic Incident Hotspots (Pune Municipal Wards)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Identified spatial clusters with repetitive hazards or traffic bottleneck alerts.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 rounded-l-xl">Ward / Urban Area</th>
                    <th className="p-3">Active Incidents</th>
                    <th className="p-3">Dominant Hazard Type</th>
                    <th className="p-3 rounded-r-xl">Risk Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {analytics.hotspot_clusters.map((cluster, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-semibold text-white">{cluster.area}</td>
                      <td className="p-3 font-bold text-cyan-400">{cluster.incidents}</td>
                      <td className="p-3 text-slate-300">{cluster.dominant_issue}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            cluster.risk_index.includes('High')
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {cluster.risk_index}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Freshness & Evidence Transparency Panel */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              Dataset Provenance & Audit Transparency
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {analytics.source_freshness_stats.map((src, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-slate-200">{src.source}</div>
                  <div className="text-[11px] text-cyan-400 mt-1">{src.records} Records Verified</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Freshness: {src.freshness}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
