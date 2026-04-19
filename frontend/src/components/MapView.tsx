import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers } from 'lucide-react';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import type { RouteOption } from '../data/mockData';

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

// Component to handle auto-fitting bounds based on current route or user location
function MapBoundsFit({ path, userLocation }: { path?: [number, number][], userLocation?: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (path && path.length > 0) {
      // If we have a route, fit bounds to the route including user location if available
      const allPoints = [...path];
      if (userLocation) allPoints.push(userLocation);
      
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17, animate: true, duration: 0.5 });
    } else if (userLocation) {
      // If only user location is known, center and zoom in
      map.flyTo(userLocation, 16, { animate: true, duration: 1 });
    }
  }, [path, userLocation, map]);
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
}

export default function MapView({ 
  selectedRoute, 
  userLocation, 
  originLabel,
  height = '100%',
  interactive = true,
  showControls = true,
}: MapViewProps) {
  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street');
  // Default center if no user location and no route
  const adamaCenter: [number, number] = [8.5400, 39.2700];
  
  const centerCoord = userLocation || (selectedRoute && selectedRoute.path[0]) || adamaCenter;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ height }}>
      {showControls && (
        <div className="absolute top-3 right-3 z-[400]">
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
        zoom={15}
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
        {!userLocation && !selectedRoute && (
          <Marker position={adamaCenter}>
            <Popup>
              <div className="text-gray-800 text-sm">
                <span className="font-semibold">Adama City</span>
                <p className="text-xs text-gray-500">Welcome to Smart Transport!</p>
              </div>
            </Popup>
          </Marker>
        )}

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
        
        <MapBoundsFit path={selectedRoute?.path} userLocation={userLocation} />
        <MapResizer />
      </MapContainer>
    </div>
  );
}
