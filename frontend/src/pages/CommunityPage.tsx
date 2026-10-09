import React, { useState, useEffect } from 'react';
import { CommunityPost } from '../types';
import { api } from '../services/api';
import {
  MessageSquare,
  Share2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Tag,
  Clock,
  MapPin,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    api
      .getCommunity()
      .then((data) => setPosts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Traffic', 'Cultural Event', 'Civic Grievance'];

  const filteredPosts = posts.filter((p) => {
    if (filterCategory !== 'All' && p.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-indigo-900/40 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-semibold mb-3">
          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          <span>Social Media & Citizen Intelligence Feeds</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Community Pulse & Civic Broadcasts
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Aggregating civic bulletins, Reddit community tips, traffic police updates, and forum alerts.
          All external items are analyzed for location and category, with explicit source attribution and verification indicators.
        </p>
      </div>

      {/* Demo Data Disclaimer Banner */}
      <div className="p-4 bg-cyan-950/30 border border-cyan-800/50 rounded-2xl flex items-center justify-between text-xs text-cyan-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>
            <strong>DEMO DATA NOTICE:</strong> Sample civic feeds for judging demonstration are clearly tagged.
            Social posts are treated as unverified observations unless officially broadcasted.
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              filterCategory === cat
                ? 'bg-cyan-600 text-slate-950 font-bold shadow-md shadow-cyan-600/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts Stream */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-900 rounded-2xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isOfficial = post.verification_status.includes('Official');

            return (
              <div
                key={post.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{post.author}</span>
                    <span className="text-[10px] text-slate-500">•</span>
                    <span className="text-xs text-cyan-400 font-medium">{post.source_name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.is_demo && (
                      <span className="text-[10px] bg-cyan-950 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded-md font-mono">
                        DEMO FEED
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                        isOfficial
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {post.verification_status}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {post.content}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] text-cyan-400">
                      <Tag className="w-3 h-3" /> {post.category}
                    </span>
                    {post.location_name && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin className="w-3 h-3" /> {post.location_name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(post.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {post.original_link && (
                      <a
                        href={post.original_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>Original link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
