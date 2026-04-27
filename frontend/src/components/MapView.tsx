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
import { getStartAndEndPoints } from '../utils/getStartAndEndPoints';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Green origin marker (large, prominent — clearly distinct from stop markers)
const OriginIcon = L.divIcon({
  html: `<div style="width:24px;height:24px;background:#16a34a;border:3px solid white;border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;"><span style="color:white;font-size:12px;font-weight:bold;">A</span></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Red destination marker (large, prominent — clearly distinct from stop markers)
const DestinationIcon = L.divIcon({
  html: `<div style="width:24px;height:24px;background:#dc2626;border:3px solid white;border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;"><span style="color:white;font-size:12px;font-weight:bold;">B</span></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
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

// Component to handle auto-fitting bounds based on route, user stops, or user location
function MapBoundsFit({ path, userLocation, hasStops, originCoords, destCoords }: {
  path?: [number, number][],
  userLocation?: [number, number] | null,
  hasStops?: boolean,
  originCoords?: [number, number] | null,
  destCoords?: [number, number] | null,
}) {
  const map = useMap();
  useEffect(() => {
    const size = map.getSize();
    if (!size || size.x === 0 || size.y === 0) return;

    try {
      if (path && path.length > 0) {
        // Fit to route polyline
        const validPoints = path.filter(isValidLatLng);
        if (validPoints.length === 0) return;
        const bounds = L.latLngBounds(validPoints);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17, animate: false });
        }
      } else if (originCoords && destCoords && isValidLatLng(originCoords) && isValidLatLng(destCoords)) {
        // Fit to user-selected origin + destination
        const bounds = L.latLngBounds([originCoords, destCoords]);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [80, 80], maxZoom: 16, animate: true });
        }
      } else if (originCoords && isValidLatLng(originCoords)) {
        // Pan to just origin
        map.setView(originCoords, 15, { animate: true });
      } else if (destCoords && isValidLatLng(destCoords)) {
        // Pan to just destination
        map.setView(destCoords, 15, { animate: true });
      } else if (userLocation && isValidLatLng(userLocation) && !hasStops) {
        map.setView(userLocation, 16, { animate: false });
      }
    } catch (e) {
      console.warn('MapBoundsFit: skipped view change', e);
    }
  }, [path, userLocation, hasStops, originCoords, destCoords, map]);
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
  /** GTFS route shape polyline [lat, lon][] — from useRouteShape */
  gtfsRoutePath?: [number, number][] | null;
  /** Label for the selected GTFS route */
  gtfsRouteLabel?: string;
  /** User-selected origin stop */
  originStop?: Stop | null;
  /** User-selected destination stop */
  destinationStop?: Stop | null;
}

export default function MapView({
  selectedRoute,
  userLocation,
  originLabel,
  height = '100%',
  interactive = true,
  showControls = true,
  stops = [],
  gtfsRoutePath = null,
  gtfsRouteLabel,
  originStop = null,
  destinationStop = null,
}: MapViewProps) {
  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street');
  // Default center: Addis Ababa (GTFS data covers this city)
  const defaultCenter: [number, number] = [9.03, 38.74];

  // Determine active polyline path (GTFS route takes priority)
  const activePath = gtfsRoutePath ?? selectedRoute?.path ?? null;
  const originCoords: [number, number] | null = originStop ? [originStop.stop_lat, originStop.stop_lon] : null;
  const destCoords: [number, number] | null = destinationStop ? [destinationStop.stop_lat, destinationStop.stop_lon] : null;
  const centerCoord = (activePath && activePath.length > 0 ? activePath[0] : null) || originCoords || defaultCenter;

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

        {/* GTFS Route Polyline (from shapes.txt) */}
        {gtfsRoutePath && gtfsRoutePath.length > 1 && (
          <Polyline
            positions={gtfsRoutePath}
            color="#2563eb"
            weight={5}
            opacity={0.9}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* GTFS Route Start & End Markers */}
        {(() => {
          const endpoints = getStartAndEndPoints(gtfsRoutePath);
          if (!endpoints) return null;
          return (
            <>
              <Marker position={endpoints.start} icon={OriginIcon} zIndexOffset={1000}>
                <Popup>
                  <div className="text-gray-800 text-sm min-w-[140px]">
                    <span className="font-semibold text-green-700">🟢 Route Start</span>
                    {gtfsRouteLabel && <p className="text-xs text-gray-500 mt-1">{gtfsRouteLabel}</p>}
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {endpoints.start[0].toFixed(5)}, {endpoints.start[1].toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </Marker>
              <Marker position={endpoints.end} icon={DestinationIcon} zIndexOffset={1000}>
                <Popup>
                  <div className="text-gray-800 text-sm min-w-[140px]">
                    <span className="font-semibold text-red-700">🔴 Route End</span>
                    {gtfsRouteLabel && <p className="text-xs text-gray-500 mt-1">{gtfsRouteLabel}</p>}
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {endpoints.end[0].toFixed(5)}, {endpoints.end[1].toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </>
          );
        })()}

        {/* Legacy mock route polyline */}
        {selectedRoute && !gtfsRoutePath && (
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

        {/* User-selected Origin Marker */}
        {originStop && (
          <Marker position={[originStop.stop_lat, originStop.stop_lon]} icon={OriginIcon} zIndexOffset={1100}>
            <Popup>
              <div className="text-gray-800 text-sm min-w-[140px]">
                <span className="font-semibold text-green-700">📍 Origin</span>
                <p className="text-xs text-gray-600 mt-0.5">{originStop.stop_name}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* User-selected Destination Marker */}
        {destinationStop && (
          <Marker position={[destinationStop.stop_lat, destinationStop.stop_lon]} icon={DestinationIcon} zIndexOffset={1100}>
            <Popup>
              <div className="text-gray-800 text-sm min-w-[140px]">
                <span className="font-semibold text-red-700">🏁 Destination</span>
                <p className="text-xs text-gray-600 mt-0.5">{destinationStop.stop_name}</p>
              </div>
            </Popup>
          </Marker>
        )}

        <MapBoundsFit
          path={activePath ?? undefined}
          userLocation={userLocation}
          hasStops={stops.length > 0}
          originCoords={originCoords}
          destCoords={destCoords}
        />
        <MapResizer />
      </MapContainer>
    </div>
  );
}
