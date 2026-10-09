import React, { useState, useMemo } from 'react';
import { Place } from '../types';
import { PlaceCard } from '../components/PlaceCard';
import { Modal } from '../components/Modal';
import { CityMap } from '../components/CityMap';
import {
  Compass,
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Accessibility,
  Users,
  Navigation,
  Layers,
  Map as MapIcon,
  Grid
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExplorePageProps {
  places: Place[];
  onAddToItinerary: (place: Place) => void;
  itineraryPlaceIds: number[];
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  places,
  onAddToItinerary,
  itineraryPlaceIds,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<number>(3000);
  const [minRating, setMinRating] = useState<number>(0);
  const [wheelchairOnly, setWheelchairOnly] = useState<boolean>(false);
  const [familyOnly, setFamilyOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);

  const navigate = useNavigate();

  const categories = [
    'All',
    'Food',
    'Heritage',
    'Park',
    'Shopping',
    'Tourist Attraction',
    'Hotel',
    'Hospital',
    'Public Transport',
  ];

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (p.avg_cost_inr !== undefined && p.avg_cost_inr !== null && p.avg_cost_inr > maxBudget) return false;
      if (minRating > 0 && (p.rating === undefined || p.rating === null || p.rating < minRating)) return false;
      if (wheelchairOnly && !p.accessibility_wheelchair) return false;
      if (familyOnly && !p.is_family_friendly) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = p.name.toLowerCase().includes(q);
        const inDesc = p.description?.toLowerCase().includes(q) || false;
        const inAddr = p.address.toLowerCase().includes(q);
        const inSub = p.subcategory?.toLowerCase().includes(q) || false;
        if (!inName && !inDesc && !inAddr && !inSub) return false;
      }
      return true;
    });
  }, [places, selectedCategory, maxBudget, minRating, wheelchairOnly, familyOnly, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Exploration & Hospitality Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Explore Pune's Cultural & Culinary Landscape
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Filter through restaurants, heritage structures, serene parks, traditional bazaars, and hotels.
            All ratings and prices sourced from verified public surveys and municipal registries.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              viewMode === 'map'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map Split</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        {/* Search & Category Pills */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, cuisine, street (e.g. FC Road, Dosa, Wada)..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-600 text-slate-950 font-bold shadow-md shadow-cyan-600/20'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
          {/* Budget Filter */}
          <div>
            <div className="flex justify-between mb-1.5 font-medium">
              <span>Max Budget:</span>
              <span className="text-emerald-400 font-bold">₹{maxBudget}</span>
            </div>
            <input
              type="range"
              min="0"
              max="3000"
              step="50"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>Free (₹0)</span>
              <span>₹1500</span>
              <span>₹3000+</span>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block mb-1.5 font-medium">Minimum Rating:</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="0">All Ratings</option>
              <option value="4.0">★ 4.0 & above</option>
              <option value="4.3">★ 4.3 & above</option>
              <option value="4.5">★ 4.5 & above (Top Rated)</option>
            </select>
          </div>

          {/* Accessibility Checkbox */}
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="wheelchair"
              checked={wheelchairOnly}
              onChange={(e) => setWheelchairOnly(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="wheelchair" className="text-xs cursor-pointer select-none">
              Wheelchair Accessible Only
            </label>
          </div>

          {/* Family Friendly Checkbox */}
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="family"
              checked={familyOnly}
              onChange={(e) => setFamilyOnly(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="family" className="text-xs cursor-pointer select-none">
              Family Friendly Suitability
            </label>
          </div>
        </div>
      </div>

      {/* Results Count & Reset */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-cyan-400">{filteredPlaces.length}</strong> verified places in Pune
        </span>
        {(searchQuery || selectedCategory !== 'All' || minRating > 0 || wheelchairOnly || familyOnly || maxBudget < 3000) && (
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setMaxBudget(3000);
              setMinRating(0);
              setWheelchairOnly(false);
              setFamilyOnly(false);
            }}
            className="text-cyan-400 hover:underline"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Grid or Map View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onViewOnMap={(p) => setDetailPlace(p)}
              onAddToItinerary={onAddToItinerary}
              isAddedToItinerary={itineraryPlaceIds.includes(place.id)}
              onToggleCompare={(p) => navigate(`/compare?add=${p.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CityMap
              places={filteredPlaces}
              selectedPlace={detailPlace}
              onSelectPlace={(p) => setDetailPlace(p)}
              height="600px"
            />
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {filteredPlaces.map((place) => (
              <div
                key={place.id}
                onClick={() => setDetailPlace(place)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
                  detailPlace?.id === place.id
                    ? 'bg-slate-800 border-cyan-500'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {place.image_url ? (
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-slate-800 rounded-lg shrink-0 flex items-center justify-center text-[10px] text-slate-500">
                    No img
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-white truncate">{place.name}</div>
                  <div className="text-[11px] text-cyan-400 font-medium">{place.category}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{place.address}</div>
                  <div className="flex items-center justify-between text-[11px] mt-1 font-semibold">
                    <span className="text-emerald-400">
                      {place.avg_cost_inr === 0 ? 'Free' : `₹${place.avg_cost_inr}`}
                    </span>
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {place.rating || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Place Detail Modal */}
      {detailPlace && (
        <Modal
          isOpen={!!detailPlace}
          onClose={() => setDetailPlace(null)}
          title={detailPlace.name}
        >
          <div className="space-y-4">
            {detailPlace.image_url && (
              <img
                src={detailPlace.image_url}
                alt={detailPlace.name}
                className="w-full h-56 object-cover rounded-xl"
              />
            )}

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
                  {detailPlace.category}
                </span>
                <span className="text-xs text-slate-400 ml-2">{detailPlace.subcategory}</span>
              </div>
              <div className="text-sm font-bold text-emerald-400">
                {detailPlace.avg_cost_inr === 0 ? 'Free Entry' : `Avg Cost: ₹${detailPlace.avg_cost_inr}`}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {detailPlace.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">Rating:</span>
                <span className="font-semibold text-amber-300 flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {detailPlace.rating || 'N/A'} ({detailPlace.reviews_count} reviews)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Opening Hours:</span>
                <span className="font-semibold text-slate-200 block mt-0.5">
                  {detailPlace.opening_hours || 'Check on site'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Wheelchair Access:</span>
                <span className={`font-semibold mt-0.5 block ${detailPlace.accessibility_wheelchair ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {detailPlace.accessibility_wheelchair ? 'Yes (Ramps available)' : 'Limited / Steps'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Data Source:</span>
                <span className="font-semibold text-slate-400 block mt-0.5 truncate" title={detailPlace.source_name}>
                  {detailPlace.source_name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
              <span>{detailPlace.address}</span>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${detailPlace.lat},${detailPlace.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open Navigation</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/compare?add=${detailPlace.id}`)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-violet-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Compare</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddToItinerary(detailPlace);
                    setDetailPlace(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition cursor-pointer"
                >
                  {itineraryPlaceIds.includes(detailPlace.id) ? 'Already in Itinerary' : 'Add to Itinerary'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
