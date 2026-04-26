import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers } from 'lucide-react';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import type { RouteOption } from '../data/mockData';
import type { Stop } from '../types/Stop';
import StopMarkers from './StopMarkers';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Green origin marker
const OriginIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;background:#16a34a;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Red destination marker
const DestinationIcon = L.divIcon({
  html: `<div style="width:20px;height:20px;background:#dc2626;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Validate that a coordinate pair has real numbers
function isValidLatLng(coords: [number, number]): boolean {
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    typeof coords[0] === 'number' &&
    typeof coords[1] === 'number' &&
    !isNaN(coords[0]) &&
    !isNaN(coords[1]) &&
    isFinite(coords[0]) &&
    isFinite(coords[1])
  );
}

// Component to handle auto-fitting bounds based on current route or user location
function MapBoundsFit({ path, userLocation, hasStops }: { path?: [number, number][], userLocation?: [number, number] | null, hasStops?: boolean }) {
  const map = useMap();
  useEffect(() => {
    // Guard: skip if the map's container has zero size (hidden via CSS)
    const size = map.getSize();
    if (!size || size.x === 0 || size.y === 0) return;

    try {
      if (path && path.length > 0) {
        const validPoints = path.filter(isValidLatLng);
        if (userLocation && isValidLatLng(userLocation)) validPoints.push(userLocation);
        if (validPoints.length === 0) return;

        const bounds = L.latLngBounds(validPoints);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17, animate: false });
        }
      } else if (userLocation && isValidLatLng(userLocation) && !hasStops) {
        // Only auto-pan to user location when stops are NOT displayed,
        // otherwise the map jumps away from the stops coverage area.
        map.setView(userLocation, 16, { animate: false });
      }
    } catch (e) {
      // Silently ignore Leaflet projection errors (e.g. during resize transitions)
      console.warn('MapBoundsFit: skipped view change', e);
    }
  }, [path, userLocation, hasStops, map]);
  return null;
}

// Invalidate map size after container visibility changes
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

interface MapViewProps {
  selectedRoute?: RouteOption | null;
  userLocation?: [number, number] | null;
  originLabel?: string;
  height?: string;
  interactive?: boolean;
  showControls?: boolean;
  stops?: Stop[];
  stopsLoading?: boolean;
}

export default function MapView({
  selectedRoute,
  userLocation,
  originLabel,
  height = '100%',
  interactive = true,
  showControls = true,
  stops = [],
}: MapViewProps) {
  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street');
  // Default center: Addis Ababa (GTFS data covers this city)
  const defaultCenter: [number, number] = [9.03, 38.74];

  const centerCoord = userLocation || (selectedRoute && selectedRoute.path[0]) || defaultCenter;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ height }}>
      {showControls && (
        <div className="absolute top-3 right-3 z-400">
          <button
            onClick={() => setMapMode(prev => prev === 'street' ? 'satellite' : 'street')}
            className="bg-white text-gray-700 p-2 rounded-xl shadow-md flex items-center gap-1.5 hover:bg-gray-50 transition-all duration-200 font-medium text-xs border border-gray-200"
          >
            <Layers size={14} />
            {mapMode === 'street' ? 'Satellite' : 'Street'}
          </button>
        </div>
      )}

      <MapContainer
        center={centerCoord}
        zoom={13}
        maxZoom={19}
        scrollWheelZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        zoomControl={interactive}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        {mapMode === 'street' ? (
          <TileLayer
            key="street"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        ) : (
          <TileLayer
            key="satellite"
            attribution='Tiles &copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        )}

        {/* Dynamic Exact Origin Marker: Prioritize Real GPS */}
        {userLocation ? (
          <Marker position={userLocation} icon={OriginIcon}>
            <Popup>
              <div className="text-gray-800 text-sm">
                <span className="font-semibold">📍 Your Location</span>
                {originLabel && <p className="text-xs text-gray-500 mt-0.5">{originLabel}</p>}
              </div>
            </Popup>
          </Marker>
        ) : selectedRoute && selectedRoute.path.length > 0 ? (
          <Marker position={selectedRoute.path[0]} icon={OriginIcon}>
            <Popup>
              <div className="text-gray-800 text-sm">
                <span className="font-semibold">📍 {selectedRoute.origin}</span>
              </div>
            </Popup>
          </Marker>
        ) : null}

        {/* Current Destination Marker */}
        {selectedRoute && selectedRoute.path.length > 1 && (
          <Marker position={selectedRoute.path[selectedRoute.path.length - 1]} icon={DestinationIcon}>
            <Popup>
              <div className="text-gray-800 text-sm">
                <span className="font-semibold">🏁 {selectedRoute.destination}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Default Marker if NOTHING is known */}
        {!userLocation && !selectedRoute && stops.length === 0 && (
          <Marker position={defaultCenter}>
            <Popup>
              <div className="text-gray-800 text-sm">
                <span className="font-semibold">Addis Ababa</span>
                <p className="text-xs text-gray-500">Welcome to Smart Transport!</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* GTFS Bus Stop Markers */}
        {stops.length > 0 && <StopMarkers stops={stops} />}

        {/* Route Polyline connecting Origin strictly to Destination */}
        {selectedRoute && (
          <Polyline
            positions={userLocation ? [userLocation, ...selectedRoute.path] : selectedRoute.path}
            color="#2563eb"
            weight={5}
            opacity={0.85}
            dashArray="0"
            lineCap="round"
            lineJoin="round"
          />
        )}

        <MapBoundsFit path={selectedRoute?.path} userLocation={userLocation} hasStops={stops.length > 0} />
        <MapResizer />
      </MapContainer>
    </div>
  );
}
