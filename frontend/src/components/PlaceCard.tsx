import React from 'react';
import { Place } from '../types';
import { Star, MapPin, Clock, Accessibility, Users, Plus, Check, Eye } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  onViewOnMap?: (place: Place) => void;
  onAddToItinerary?: (place: Place) => void;
  isAddedToItinerary?: boolean;
  onToggleCompare?: (place: Place) => void;
  isComparing?: boolean;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onViewOnMap,
  onAddToItinerary,
  isAddedToItinerary = false,
  onToggleCompare,
  isComparing = false,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col group">
      {/* Image Banner */}
      <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
        {place.image_url ? (
          <img
            src={place.image_url}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
            No image available
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 px-2.5 py-1 rounded-full text-xs font-semibold text-cyan-300">
          {place.category}
        </div>

        {/* Price Tier */}
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-400">
          {place.avg_cost_inr === 0 ? 'Free' : `₹${place.avg_cost_inr || 'N/A'}`}
        </div>

        {/* Rating Floating Tag */}
        {place.rating && (
          <div className="absolute bottom-2 left-3 flex items-center gap-1 bg-slate-950/90 border border-amber-500/40 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-300">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{place.rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400 font-normal">
              ({place.reviews_count > 1000 ? `${(place.reviews_count / 1000).toFixed(1)}k` : place.reviews_count})
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-base text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
            {place.name}
          </h4>
          {place.subcategory && (
            <div className="text-xs text-slate-400 mb-2 font-medium">{place.subcategory}</div>
          )}

          <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
            {place.description || 'Verified landmark in Pune.'}
          </p>

          {/* Details & Badges */}
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 mb-3">
            {place.opening_hours && (
              <span className="flex items-center gap-1 bg-slate-800/60 px-2 py-1 rounded-md border border-slate-700/40">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span className="truncate max-w-[140px]">{place.opening_hours}</span>
              </span>
            )}
            {place.accessibility_wheelchair && (
              <span className="flex items-center gap-1 bg-slate-800/60 px-2 py-1 rounded-md border border-slate-700/40 text-emerald-300">
                <Accessibility className="w-3 h-3 text-emerald-400" />
                Wheelchair Accessible
              </span>
            )}
            {place.is_family_friendly && (
              <span className="flex items-center gap-1 bg-slate-800/60 px-2 py-1 rounded-md border border-slate-700/40">
                <Users className="w-3 h-3 text-violet-400" />
                Family Friendly
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-3">
            <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
            <span className="truncate">{place.address}</span>
          </div>
        </div>

        {/* Source & Actions */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-[10px] text-slate-500 italic truncate max-w-[110px]" title={place.source_name}>
            Src: {place.source_name.split('/')[0]}
          </span>

          <div className="flex items-center gap-1.5">
            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(place)}
                className={`px-2 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  isComparing
                    ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                }`}
                title="Add to comparison"
              >
                {isComparing ? 'Comparing' : 'Compare'}
              </button>
            )}

            {onViewOnMap && (
              <button
                type="button"
                onClick={() => onViewOnMap(place)}
                className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition cursor-pointer"
                title="View on Map"
                aria-label="View on Map"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}

            {onAddToItinerary && (
              <button
                type="button"
                onClick={() => onAddToItinerary(place)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isAddedToItinerary
                    ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold'
                }`}
              >
                {isAddedToItinerary ? (
                  <>
                    <Check className="w-3 h-3" /> Added
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" /> Itinerary
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
