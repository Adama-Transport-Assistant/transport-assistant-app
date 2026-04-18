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

// Component to handle auto-fitting bounds based on current route or user location
function MapBoundsFit({ path, userLocation }: { path?: [number, number][], userLocation?: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (path && path.length > 0) {
      // If we have a route, fit bounds to the route including user location if available
      const allPoints = [...path];
      if (userLocation) allPoints.push(userLocation);
      
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
    } else if (userLocation) {
      // If only user location is known, center and zoom in
      map.setView(userLocation, 16);
    }
  }, [path, userLocation, map]);
  return null;
}

interface MapViewProps {
  selectedRoute?: RouteOption | null;
  userLocation?: [number, number] | null;
  originLabel?: string;
}

export default function MapView({ selectedRoute, userLocation, originLabel }: MapViewProps) {
  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street');
  // Default center if no user location and no route
  const adamaCenter: [number, number] = [8.5400, 39.2700];
  
  const centerCoord = userLocation || (selectedRoute && selectedRoute.path[0]) || adamaCenter;

  return (
    <div className="h-full w-full relative flex-1 z-10 rounded-xl overflow-hidden">
      <div className="absolute top-4 right-4 z-[400]">
        <button
          onClick={() => setMapMode(prev => prev === 'street' ? 'satellite' : 'street')}
          className="bg-white text-gray-800 p-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-100 transition-colors font-medium text-sm"
        >
          <Layers size={18} />
          {mapMode === 'street' ? 'Satellite View' : 'Street View'}
        </button>
      </div>

      <MapContainer
        center={centerCoord}
        zoom={16}
        maxZoom={20}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        {mapMode === 'street' ? (
          <TileLayer
            key="street"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            maxZoom={20}
          />
        ) : (
          <TileLayer
            key="satellite"
            attribution='Tiles &copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={20}
          />
        )}

        {/* Dynamic Exact Origin Marker: Prioritize Real GPS */}
        {userLocation ? (
          <Marker position={userLocation}>
            <Popup>
              <div className="text-gray-800">
                <span className="font-bold">Your Location</span>
                <p className="text-xs">{originLabel}</p>
              </div>
            </Popup>
          </Marker>
        ) : selectedRoute && selectedRoute.path.length > 0 ? (
          <Marker position={selectedRoute.path[0]}>
            <Popup>
              <div className="text-gray-800">
                <span className="font-bold">Origin: {selectedRoute.origin}</span>
              </div>
            </Popup>
          </Marker>
        ) : null}

        {/* Current Destination Marker */}
        {selectedRoute && selectedRoute.path.length > 1 && (
          <Marker position={selectedRoute.path[selectedRoute.path.length - 1]}>
            <Popup>
              <div className="text-gray-800">
                <span className="font-bold">Destination: {selectedRoute.destination}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Default Marker if NOTHING is known */}
        {!userLocation && !selectedRoute && (
          <Marker position={adamaCenter}>
            <Popup>
              <div className="text-gray-800">
                <span className="font-bold">Adama Center</span>
                <p>Welcome to Adama Smart Transport!</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline connecting Origin strictly to Destination */}
        {selectedRoute && (
          <Polyline 
            positions={userLocation ? [userLocation, ...selectedRoute.path] : selectedRoute.path} 
            color="#22c55e" 
            weight={5} 
            opacity={0.8} 
          />
        )}
        
        <MapBoundsFit path={selectedRoute?.path} userLocation={userLocation} />
      </MapContainer>
    </div>
  );
}

