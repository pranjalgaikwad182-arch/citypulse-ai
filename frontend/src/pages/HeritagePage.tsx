import React, { useState, useEffect } from 'react';
import { HeritageSite } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import {
  Landmark,
  BookOpen,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Compass,
  Footprints
} from 'lucide-react';

export const HeritagePage: React.FC = () => {
  const [heritageSites, setHeritageSites] = useState<HeritageSite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStory, setSelectedStory] = useState<HeritageSite | null>(null);

  useEffect(() => {
    api
      .getHeritage()
      .then((data) => setHeritageSites(data))
      .catch((err) => console.error('Failed to load heritage data:', err))
      .finally(() => setLoading(false));
  }, []);

  const timelineEvents = [
    {
      period: '8th Century AD (Rashtrakuta Dynasty)',
      landmark: 'Pataleshwar Cave Temple',
      highlight: 'Monolithic subterranean basalt rock-cut shrine carved in central Pune.',
    },
    {
      period: '1732 AD (Maratha Empire / Peshwa Era)',
      landmark: 'Shaniwar Wada & Bajirao I',
      highlight: 'Construction of the 7-storey Peshwa seat of governance and the historic Delhi Gate.',
    },
    {
      period: '1784 AD (Peshwa Madhavrao I)',
      landmark: 'Saras Baug & Talyatla Ganpati',
      highlight: 'Lake bed transformed into a civic garden and community temple.',
    },
    {
      period: '1892 AD (British Raj & Famine Relief)',
      landmark: 'Aga Khan Palace',
      highlight: 'Italianate palace constructed; later served as Gandhi’s 1942 Quit India internment site.',
    },
    {
      period: '1962 AD (Folk Culture Preservation)',
      landmark: 'Raja Dinkar Kelkar Museum',
      highlight: '20,000+ daily Indian everyday cultural artifacts and reconstructed Mastani Mahal.',
    },
  ];

  const walkingItineraries = [
    {
      title: 'Peshwa Era Heritage Walking Trail',
      duration: '3.5 Hours',
      distance: '3.2 km',
      stops: ['Shaniwar Wada', 'Tulshibaug Temple', 'Raja Dinkar Kelkar Museum'],
      description: 'Stroll through old Pune peths (precincts), exploring Peshwa architecture, brassware bazaars, and traditional wada structures.',
    },
    {
      title: 'Freedom Struggle & Monuments Trail',
      duration: '2.5 Hours',
      distance: '4.5 km',
      stops: ['Aga Khan Palace', 'Kasturba Samadhi', 'Gandhi Memorial Lawns'],
      description: 'Explore the tranquil arches and solemn memorials commemorating India’s 1942 Quit India movement heroes.',
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-950/50 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-violet-900/40 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/40 border border-violet-700/50 text-violet-300 text-xs font-semibold mb-3">
          <Landmark className="w-3.5 h-3.5 text-violet-400" />
          <span>Archaeological & Cultural Chronicles</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Heritage & Culture of Pune
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          From ancient 8th-century Rashtrakuta rock-cut basalt sanctuaries to the imperial ramparts of the Maratha Empire and sacred monuments of the Indian Freedom Struggle.
          All accounts sourced directly from verified Archaeological Survey of India (ASI) records.
        </p>
      </div>

      {/* Featured Heritage Sites */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            National & State Heritage Monuments
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {heritageSites.length} Verified Monuments
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {heritageSites.map((site) => (
              <div
                key={site.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-violet-500/50 rounded-2xl overflow-hidden shadow-lg transition duration-300 flex flex-col group"
              >
                <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                  {site.image_url ? (
                    <img
                      src={site.image_url}
                      alt={site.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                      ASI Monument
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute top-3 left-3 bg-violet-950/80 backdrop-blur-md border border-violet-800/80 px-2.5 py-1 rounded-full text-xs font-semibold text-violet-300">
                    {site.era_period || 'Historic Epoch'}
                  </div>
                  <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Est. Visit: ~{site.estimated_visit_mins} mins</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-white mb-1 group-hover:text-violet-400 transition-colors">
                      {site.name}
                    </h3>
                    <div className="text-xs text-cyan-400 font-medium mb-3">
                      {site.architectural_style || 'Monolithic & Traditional Architecture'}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                      {site.historical_significance}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 italic truncate max-w-[170px]" title={site.source_attribution}>
                      Source: {site.source_attribution}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedStory(site)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 text-xs font-semibold transition cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Discover the Story</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Historical Chronology / Timeline */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Chronological Timeline of Urban Pune
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Historical progression and architectural milestones across centuries.
          </p>
        </div>

        <div className="relative border-l-2 border-slate-800 ml-4 space-y-8 pl-6">
          {timelineEvents.map((event, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-cyan-500 border-4 border-slate-950 group-hover:scale-125 transition-transform" />
              <div className="text-xs font-mono font-bold text-cyan-400">{event.period}</div>
              <div className="text-sm font-bold text-white mt-0.5">{event.landmark}</div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                {event.highlight}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cultural Walking Itineraries */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Footprints className="w-5 h-5 text-emerald-400" />
          Curated Cultural Walking Trails
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {walkingItineraries.map((trail, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Walking Trail
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-cyan-400" /> {trail.duration}
                    </span>
                    <span>•</span>
                    <span>{trail.distance}</span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-white mb-2">{trail.title}</h3>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  {trail.description}
                </p>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 mb-4">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Waypoints along route:
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {trail.stops.map((stop, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-xs bg-slate-900 border border-slate-700/60 px-2.5 py-1 rounded-lg text-slate-200"
                      >
                        {sIdx + 1}. {stop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Pedestrian-friendly paths</span>
                <span className="text-cyan-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Trail
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story Discovery Modal */}
      {selectedStory && (
        <Modal
          isOpen={!!selectedStory}
          onClose={() => setSelectedStory(null)}
          title={`Discover the Story: ${selectedStory.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {selectedStory.image_url && (
              <img
                src={selectedStory.image_url}
                alt={selectedStory.name}
                className="w-full h-56 object-cover rounded-xl"
              />
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-950 border border-violet-800 text-violet-300">
                {selectedStory.era_period}
              </span>
              <span className="text-xs text-slate-400">
                {selectedStory.architectural_style}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-violet-400" />
                Verified Historical Narrative
              </h4>
              <p>{selectedStory.verified_story}</p>
            </div>

            {selectedStory.visiting_info && (
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 leading-relaxed">
                <div className="font-semibold text-cyan-300 mb-1">Visiting & Ticket Information:</div>
                <p>{selectedStory.visiting_info}</p>
              </div>
            )}

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
              <span>Attribution: {selectedStory.source_attribution}</span>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStory.lat},${selectedStory.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Navigate</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
