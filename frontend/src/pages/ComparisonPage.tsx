import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Place, ComparisonResponse, ComparisonPlaceItem } from '../types';
import { api } from '../services/api';
import {
  Layers,
  Sliders,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Star,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ComparisonPageProps {
  places: Place[];
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({ places }) => {
  const [searchParams] = useSearchParams();
  const initialAddId = searchParams.get('add');

  // Selected places to compare (2 to 4)
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<number[]>([1, 2]); // Default Shaniwar Wada & Aga Khan Palace

  // Weights (percentages out of 100)
  const [weights, setWeights] = useState({
    affordability: 25,
    ratings: 20,
    cleanliness: 15,
    accessibility: 15,
    distance: 10,
    safety: 15,
  });

  const [comparisonResult, setComparisonResult] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialAddId) {
      const idNum = parseInt(initialAddId, 10);
      if (!isNaN(idNum) && !selectedPlaceIds.includes(idNum)) {
        if (selectedPlaceIds.length >= 4) {
          setSelectedPlaceIds([selectedPlaceIds[0], selectedPlaceIds[1], selectedPlaceIds[2], idNum]);
        } else {
          setSelectedPlaceIds([...selectedPlaceIds, idNum]);
        }
      }
    }
  }, [initialAddId]);

  const runComparison = async () => {
    if (selectedPlaceIds.length < 2) {
      setError('Please select at least 2 places to compare.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // Normalize weights
      const sum = Object.values(weights).reduce((a, b) => a + b, 0) || 100;
      const normalizedWeights = {
        affordability: weights.affordability / sum,
        ratings: weights.ratings / sum,
        cleanliness: weights.cleanliness / sum,
        accessibility: weights.accessibility / sum,
        distance: weights.distance / sum,
        safety: weights.safety / sum,
      };

      const res = await api.comparePlaces(selectedPlaceIds, normalizedWeights);
      setComparisonResult(res);
    } catch (err: any) {
      setError(err.message || 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (places.length >= 2) {
      runComparison();
    }
  }, [selectedPlaceIds, places]);

  const handleTogglePlace = (id: number) => {
    if (selectedPlaceIds.includes(id)) {
      if (selectedPlaceIds.length <= 2) {
        setError('Minimum 2 places required for side-by-side comparison.');
        return;
      }
      setSelectedPlaceIds(selectedPlaceIds.filter((pId) => pId !== id));
    } else {
      if (selectedPlaceIds.length >= 4) {
        setError('Maximum 4 places can be compared simultaneously.');
        return;
      }
      setSelectedPlaceIds([...selectedPlaceIds, id]);
    }
  };

  const handleWeightChange = (key: keyof typeof weights, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetWeights = () => {
    setWeights({
      affordability: 25,
      ratings: 20,
      cleanliness: 15,
      accessibility: 15,
      distance: 10,
      safety: 15,
    });
  };

  // Prepare chart data for Recharts
  const chartData = comparisonResult?.places[0]?.dimensions.map((dim, idx) => {
    const row: any = { dimension: dim.dimension };
    comparisonResult.places.forEach((p) => {
      row[p.name] = p.dimensions[idx]?.score || 0;
    });
    return row;
  }) || [];

  const barColors = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-indigo-900/40 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-semibold mb-3">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Transparent Multi-Criteria Decision Model</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Best vs. Worst Place Comparison
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Evaluate 2 to 4 urban destinations side-by-side across verified affordability, visitor ratings, accessibility audits, cleanliness indices, and real-time reported safety conditions.
          Adjust custom dimension weights to reflect your personal travel priorities.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Place Selection Chips */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Select Places to Compare (2 - 4):
          </span>
          <span className="text-xs text-cyan-400 font-medium">
            {selectedPlaceIds.length} of 4 selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {places.map((place) => {
            const isSelected = selectedPlaceIds.includes(place.id);
            return (
              <button
                key={place.id}
                type="button"
                onClick={() => handleTogglePlace(place.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-600 border-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-600/20'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />}
                <span>{place.name}</span>
                <span className="text-[10px] opacity-75">({place.category})</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Configurable Transparent Weights Slider Panel */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-violet-400" />
            <h3 className="font-bold text-sm text-white">Configurable Decision Weights</h3>
            <span className="text-xs text-slate-500">(Adjust to personalize ranking formula)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetWeights}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
            <button
              onClick={runComparison}
              className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md transition cursor-pointer"
            >
              Recalculate
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-slate-300">
          <div>
            <div className="flex justify-between mb-1.5">
              <span>Affordability Weight:</span>
              <span className="font-bold text-cyan-400">{weights.affordability}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.affordability}
              onChange={(e) => handleWeightChange('affordability', Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span>Ratings Weight:</span>
              <span className="font-bold text-cyan-400">{weights.ratings}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.ratings}
              onChange={(e) => handleWeightChange('ratings', Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span>Cleanliness & Amenities:</span>
              <span className="font-bold text-cyan-400">{weights.cleanliness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.cleanliness}
              onChange={(e) => handleWeightChange('cleanliness', Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span>Accessibility:</span>
              <span className="font-bold text-cyan-400">{weights.accessibility}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.accessibility}
              onChange={(e) => handleWeightChange('accessibility', Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span>Distance Suitability:</span>
              <span className="font-bold text-cyan-400">{weights.distance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.distance}
              onChange={(e) => handleWeightChange('distance', Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span>Reported Safety Conditions:</span>
              <span className="font-bold text-cyan-400">{weights.safety}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.safety}
              onChange={(e) => handleWeightChange('safety', Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Comparison Results */}
      {comparisonResult && (
        <section className="space-y-6">
          {/* Winner Verdict Banner */}
          <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900 to-violet-950/70 border border-cyan-800/60 rounded-3xl p-6 shadow-xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider block mb-1">
                Transparent Decision Explanation:
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {comparisonResult.recommendation_explanation}
              </p>
            </div>
          </div>

          {/* Visual Bar Chart Comparison */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Comparative Dimension Breakdown (0 - 100 Scale)
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="dimension" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  {comparisonResult.places.map((place, idx) => (
                    <Bar
                      key={place.place_id}
                      dataKey={place.name}
                      fill={barColors[idx % barColors.length]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side-by-Side Detailed Dimension Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {comparisonResult.places.map((place, pIdx) => {
              const isTop = place.place_id === comparisonResult.best_place_id;
              return (
                <div
                  key={place.place_id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                    isTop
                      ? 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/10'
                      : 'bg-slate-900/70 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                        {place.category}
                      </span>
                      {isTop && (
                        <span className="text-[10px] bg-cyan-950 border border-cyan-700 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                          Top Scorer
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-base text-white mb-1">{place.name}</h4>
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 mb-3">
                      {place.total_score} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-4 italic leading-relaxed">
                      "{place.summary_verdict}"
                    </p>

                    <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                      {place.dimensions.map((dim, dIdx) => (
                        <div key={dIdx} className="space-y-1">
                          <div className="flex justify-between text-slate-300 text-[11px]">
                            <span className="font-medium text-slate-400">{dim.dimension}</span>
                            <span className="font-bold text-cyan-400">{dim.score}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate" title={dim.raw_value}>
                            {dim.raw_value}
                          </div>
                          <div className="text-[9px] text-slate-500 italic">
                            Source: {dim.source.split('/')[0]} ({dim.freshness})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
