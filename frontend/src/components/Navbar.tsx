import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  Shield,
  Layers,
  Sparkles,
  FileText,
  Landmark,
  CalendarCheck,
  MessageSquare,
  BarChart3,
  Lock,
  Menu,
  X,
  CloudSun,
  Activity
} from 'lucide-react';
import { WeatherData } from '../types';

interface NavbarProps {
  weather?: WeatherData | null;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  isAdminLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  weather,
  selectedCity,
  onSelectCity,
  isAdminLoggedIn = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Activity },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Heritage', path: '/heritage', icon: Landmark },
    { name: 'Safety & Routes', path: '/safety', icon: Shield },
    { name: 'Compare', path: '/compare', icon: Layers },
    { name: 'AI Companion', path: '/ai', icon: Sparkles, highlight: true },
    { name: 'Citizen Reports', path: '/reports', icon: FileText },
    { name: 'Itinerary', path: '/itinerary', icon: CalendarCheck },
    { name: 'Community', path: '/community', icon: MessageSquare },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Admin', path: '/admin', icon: Lock },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      {/* Top Banner: Hackathon Demo Mode Status */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-indigo-950/80 to-purple-950/80 border-b border-cyan-800/30 px-4 py-1 text-center text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-300 font-medium mx-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>HACKATHON DEMO MODE ACTIVE:</span>
          <span className="text-slate-300">Live verified datasets for {selectedCity}, Maharashtra. Zero external paid API locks required.</span>
        </div>
        {isAdminLoggedIn && (
          <span className="hidden sm:inline-block text-[11px] bg-emerald-900/60 text-emerald-300 border border-emerald-600/50 px-2 py-0.5 rounded-full font-semibold">
            Admin Mode Active
          </span>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1">
                  CityPulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">AI</span>
                </span>
                <span className="block text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                  Smart Urban Intelligence
                </span>
              </div>
            </Link>

            {/* City Selector Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <select
                value={selectedCity}
                onChange={(e) => onSelectCity(e.target.value)}
                className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer"
                aria-label="Select city"
              >
                <option value="Pune" className="bg-slate-900 text-white">Pune, Maharashtra</option>
                <option value="Mumbai" className="bg-slate-900 text-white" disabled>Mumbai (Coming soon)</option>
                <option value="Bengaluru" className="bg-slate-900 text-white" disabled>Bengaluru (Coming soon)</option>
              </select>
            </div>
          </div>

          {/* Desktop Weather Widget */}
          {weather && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
              <CloudSun className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">{Math.round(weather.temp_celsius)}°C</span>
              <span className="text-slate-400">{weather.condition}</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/40">
                {weather.is_demo ? 'Demo Met' : 'Live Met'}
              </span>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              if (item.highlight) {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                      isActive
                        ? 'bg-violet-600/30 border-violet-500 text-violet-300 shadow-lg shadow-violet-600/20'
                        : 'bg-violet-950/40 border-violet-800/50 text-violet-300 hover:bg-violet-900/40'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-spin-slow" />
                    <span>{item.name}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-1">
          {weather && (
            <div className="mb-3 p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">{weather.city}</span>
              <span className="font-bold text-white">{weather.temp_celsius}°C, {weather.condition}</span>
            </div>
          )}

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.highlight ? 'text-violet-400' : ''}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
