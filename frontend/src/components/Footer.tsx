import React from 'react';
import { Shield, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Vision */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-extrabold text-lg text-white">
                CityPulse <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-xs bg-cyan-950 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded-full font-medium">
                v1.0.0
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-4">
              “Explore Smarter. Travel Safer. Experience More.”
              An AI-powered urban decision-support platform transforming real-world municipal records, citizen voice notes, and spatial data into verified insights.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Evidence-based • Transparent Weights • Privacy Protected</span>
            </div>
          </div>

          {/* Data Transparency & Sources */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Data & Sources
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• OpenStreetMap contributors</li>
              <li>• Archaeological Survey of India (ASI)</li>
              <li>• Pune Municipal Corporation (PMC) Open Data</li>
              <li>• Pune Traffic Police Advisory Bulletins</li>
              <li>• Verified Community Submissions</li>
            </ul>
          </div>

          {/* Hackathon Mentorship Notice */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Hackathon Demo
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Sample city: Pune, Maharashtra, India. All seeded demonstration records are clearly marked. Lack of reported incidents does not imply guaranteed route safety.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded Deterministic RAG Engine</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>&copy; 2026 CityPulse AI. Built for urban safety and smart exploration.</div>
          <div className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Smart Cities Hackathon
          </div>
        </div>
      </div>
    </footer>
  );
};
