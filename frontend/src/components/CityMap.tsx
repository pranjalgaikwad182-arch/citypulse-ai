import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Place, CitizenReport } from '../types';
import { Navigation, MapPin, AlertCircle, Compass, Star } from 'lucide-react';

interface CityMapProps {
  places?: Place[];
  reports?: CitizenReport[];
  selectedPlace?: Place | null;
  onSelectPlace?: (place: Place) => void;
  routePolyline?: [number, number][];
  routeColor?: string;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

// Map center controller
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Create custom category marker icon using Leaflet DivIcon
const createCustomMarker = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        border: 2px solid #ffffff;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-size: 11px;
          font-weight: bold;
        ">${label}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Food':
      return '#f97316'; // orange
    case 'Heritage':
      return '#8b5cf6'; // violet
    case 'Park':
      return '#10b981'; // emerald
    case 'Shopping':
      return '#ec4899'; // pink
    case 'Hospital':
      return '#ef4444'; // red
    case 'Public Transport':
      return '#0284c7'; // sky
    case 'Tourist Attraction':
      return '#06b6d4'; // cyan
    case 'Hotel':
      return '#eab308'; // yellow
    default:
      return '#3b82f6'; // blue
  }
};

const getIncidentColor = (severity: string) => {
  return severity === 'High' ? '#ef4444' : severity === 'Medium' ? '#f59e0b' : '#3b82f6';
};

export const CityMap: React.FC<CityMapProps> = ({
  places = [],
  reports = [],
  selectedPlace,
  onSelectPlace,
  routePolyline,
  routeColor = '#06b6d4',
  center = [18.5204, 73.8567], // Default Pune central
  zoom = 13,
  height = '500px',
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (selectedPlace) {
      setMapCenter([selectedPlace.lat, selectedPlace.lng]);
    } else {
      setMapCenter(center);
    }
  }, [selectedPlace, center]);

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(loc);
          setMapCenter(loc);
        },
        (err) => {
          console.warn('Geolocation denied, keeping default Pune center', err);
        }
      );
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950" style={{ height }}>
      {/* Map Control Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={handleLocateMe}
          className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-400 rounded-xl border border-slate-700 shadow-lg backdrop-blur-md transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          title="Center on my location"
        >
          <Compass className="w-4 h-4" />
          <span className="hidden sm:inline">My Location</span>
        </button>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <ChangeView center={mapCenter} zoom={zoom} />

        {/* High contrast dark OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Route Polyline if present */}
        {routePolyline && routePolyline.length > 0 && (
          <Polyline
            positions={routePolyline}
            color={routeColor}
            weight={5}
            opacity={0.85}
            dashArray="1, 8"
          />
        )}

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={createCustomMarker('#06b6d4', 'ME')}
          >
            <Popup>
              <div className="text-xs">
                <div className="font-bold text-cyan-400">Your Current Location</div>
                <div className="text-slate-300">Within Pune Geospatial Boundary</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Places Markers */}
        {places.map((place) => {
          const color = getCategoryColor(place.category);
          const icon = createCustomMarker(color, place.name.slice(0, 1));

          return (
            <Marker
              key={`place-${place.id}`}
              position={[place.lat, place.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectPlace && onSelectPlace(place),
              }}
            >
              <Popup>
                <div className="text-slate-100 max-w-xs">
                  {place.image_url && (
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                  )}
                  <div className="font-bold text-sm text-white mb-0.5">{place.name}</div>
                  <div className="text-xs text-cyan-400 font-medium mb-1.5 flex items-center gap-1">
                    <span>{place.category}</span>
                    {place.rating && (
                      <span className="flex items-center text-amber-400 ml-2">
                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                        {place.rating}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 mb-2">{place.description}</p>
                  <div className="text-[11px] text-slate-400 mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{place.address}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/80 text-xs">
                    <span className="font-semibold text-emerald-400">
                      {place.avg_cost_inr === 0 ? 'Free Entry' : `Avg ₹${place.avg_cost_inr}`}
                    </span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-0.5"
                    >
                      <Navigation className="w-3 h-3" /> Directions
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Safety Incident Markers */}
        {reports.map((report) => {
          const color = getIncidentColor(report.severity);
          const icon = createCustomMarker(color, '!');

          return (
            <Marker
              key={`report-${report.id}`}
              position={[report.lat, report.lng]}
              icon={icon}
            >
              <Popup>
                <div className="text-slate-100 max-w-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span className="font-bold text-xs text-rose-400">{report.category}</span>
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {report.status}
                    </span>
                  </div>
                  <div className="font-medium text-xs text-white mb-1">{report.title}</div>
                  <p className="text-xs text-slate-300 mb-2">{report.description}</p>
                  <div className="text-[10px] text-slate-400 mb-1">
                    Reported at: {report.address}
                  </div>
                  <div className="text-[10px] text-amber-300/80 italic">
                    Safety caution: Check conditions before traveling near this zone.
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
