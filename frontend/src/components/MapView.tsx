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

// Component to handle auto-fitting bounds based on current route
function MapBoundsFit({ path }: { path: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (path.length > 0) {
      const bounds = L.latLngBounds(path);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [path, map]);
  return null;
}

interface MapViewProps {
  selectedRoute?: RouteOption | null;
}

export default function MapView({ selectedRoute }: MapViewProps) {
  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street');
  const adamaCenter: [number, number] = [8.5400, 39.2700];

  return (
    <div className="h-full w-full relative flex-1 z-10 rounded-xl overflow-hidden">
      {/* Map Mode Toggle */}
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
        center={adamaCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        {mapMode === 'street' ? (
          <TileLayer
            key="street"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            key="satellite"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {/* Current Origin Marker */}
        {selectedRoute && selectedRoute.path.length > 0 && (
          <Marker position={selectedRoute.path[0]}>
            <Popup>
              <div className="text-gray-800">
                <span className="font-bold">Origin: {selectedRoute.origin}</span>
              </div>
            </Popup>
          </Marker>
        )}

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

        {/* Default Marker if no route is selected */}
        {!selectedRoute && (
          <Marker position={adamaCenter}>
            <Popup>
              <div className="text-gray-800">
                <span className="font-bold">Adama Center</span>
                <p>Welcome to Adama Smart Transport!</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        {selectedRoute && (
          <>
            <Polyline 
              positions={selectedRoute.path} 
              color="#22c55e" 
              weight={5} 
              opacity={0.8} 
            />
            <MapBoundsFit path={selectedRoute.path} />
          </>
        )}
      </MapContainer>
    </div>
  );
}

