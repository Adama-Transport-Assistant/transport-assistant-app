import { useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
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
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const OriginIcon = L.divIcon({
  html: `<div style="width:24px;height:24px;background:#16a34a;border:3px solid white;border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;"><span style="color:white;font-size:12px;font-weight:bold;">A</span></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const DestinationIcon = L.divIcon({
  html: `<div style="width:24px;height:24px;background:#dc2626;border:3px solid white;border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;"><span style="color:white;font-size:12px;font-weight:bold;">B</span></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const TransferIcon = L.divIcon({
  html: `<div style="width:24px;height:24px;background:#f59e0b;border:3px solid white;border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;"><span style="color:white;font-size:12px;font-weight:bold;">X</span></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function isValidLatLng(coords: [number, number]): boolean {
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    typeof coords[0] === 'number' &&
    typeof coords[1] === 'number' &&
    Number.isFinite(coords[0]) &&
    Number.isFinite(coords[1])
  );
}

function MapBoundsFit({
  path,
  userLocation,
  hasStops,
  originCoords,
  destCoords,
}: {
  path?: [number, number][];
  userLocation?: [number, number] | null;
  hasStops?: boolean;
  originCoords?: [number, number] | null;
  destCoords?: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    const size = map.getSize();
    if (!size || size.x === 0 || size.y === 0) return;

    try {
      if (path && path.length > 0) {
        const validPoints = path.filter(isValidLatLng);
        if (originCoords && isValidLatLng(originCoords)) validPoints.push(originCoords);
        if (destCoords && isValidLatLng(destCoords)) validPoints.push(destCoords);
        if (validPoints.length === 0) return;

        const bounds = L.latLngBounds(validPoints);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17, animate: false });
        }
        return;
      }

      if (originCoords && destCoords && isValidLatLng(originCoords) && isValidLatLng(destCoords)) {
        const bounds = L.latLngBounds([originCoords, destCoords]);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [80, 80], maxZoom: 16, animate: true });
        }
        return;
      }

      if (originCoords && isValidLatLng(originCoords)) {
        map.setView(originCoords, 15, { animate: true });
        return;
      }

      if (destCoords && isValidLatLng(destCoords)) {
        map.setView(destCoords, 15, { animate: true });
        return;
      }

      if (userLocation && isValidLatLng(userLocation) && !hasStops) {
        map.setView(userLocation, 16, { animate: false });
      }
    } catch (e) {
      console.warn('MapBoundsFit: skipped view change', e);
    }
  }, [path, userLocation, hasStops, originCoords, destCoords, map]);

  return null;
}

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
  gtfsRoutePath?: [number, number][] | null;
  transferRoute1Path?: [number, number][] | null;
  transferRoute2Path?: [number, number][] | null;
  gtfsRouteLabel?: string;
  originStop?: Stop | null;
  destinationStop?: Stop | null;
  transferStop?: Stop | null;
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
  transferRoute1Path = null,
  transferRoute2Path = null,
  gtfsRouteLabel,
  originStop = null,
  destinationStop = null,
  transferStop = null,
}: MapViewProps) {
  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street');
  const defaultCenter: [number, number] = [9.03, 38.74];

  const transferPath =
    transferRoute1Path && transferRoute2Path
      ? [...transferRoute1Path, ...transferRoute2Path]
      : transferRoute1Path ?? transferRoute2Path ?? null;
  const hasTransferPath = Boolean(transferPath && transferPath.length > 1);

  const activePath = transferPath ?? gtfsRoutePath ?? selectedRoute?.path ?? null;
  const originCoords: [number, number] | null = originStop
    ? [originStop.stop_lat, originStop.stop_lon]
    : null;
  const destCoords: [number, number] | null = destinationStop
    ? [destinationStop.stop_lat, destinationStop.stop_lon]
    : null;
  const centerCoord =
    (activePath && activePath.length > 0 ? activePath[0] : null) || originCoords || defaultCenter;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ height }}>
      {showControls && (
        <div className="absolute top-3 right-3 z-400">
          <button
            onClick={() => setMapMode((prev) => (prev === 'street' ? 'satellite' : 'street'))}
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
            attribution="Tiles &copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={20}
          />
        )}

        {userLocation ? (
          <Marker position={userLocation} icon={OriginIcon}>
            <Popup>
              <div className="text-gray-800 text-sm">
                <span className="font-semibold">Your Location</span>
                {originLabel && <p className="text-xs text-gray-500 mt-0.5">{originLabel}</p>}
              </div>
            </Popup>
          </Marker>
        ) : selectedRoute && selectedRoute.path.length > 0 ? (
          <Marker position={selectedRoute.path[0]} icon={OriginIcon}>
            <Popup>
              <div className="text-gray-800 text-sm">
                <span className="font-semibold">{selectedRoute.origin}</span>
              </div>
            </Popup>
          </Marker>
        ) : null}

        {selectedRoute && selectedRoute.path.length > 1 && (
          <Marker position={selectedRoute.path[selectedRoute.path.length - 1]} icon={DestinationIcon}>
            <Popup>
              <div className="text-gray-800 text-sm">
                <span className="font-semibold">{selectedRoute.destination}</span>
              </div>
            </Popup>
          </Marker>
        )}

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

        {stops.length > 0 && <StopMarkers stops={stops} />}

        {transferRoute1Path && transferRoute1Path.length > 1 && (
          <Polyline
            positions={transferRoute1Path}
            color="#2563eb"
            weight={5}
            opacity={0.9}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {transferRoute2Path && transferRoute2Path.length > 1 && (
          <Polyline
            positions={transferRoute2Path}
            color="#7c3aed"
            weight={5}
            opacity={0.9}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {!hasTransferPath && gtfsRoutePath && gtfsRoutePath.length > 1 && (
          <Polyline
            positions={gtfsRoutePath}
            color="#2563eb"
            weight={5}
            opacity={0.9}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {!hasTransferPath && !originStop && !destinationStop && (() => {
          const endpoints = getStartAndEndPoints(gtfsRoutePath);
          if (!endpoints) return null;
          return (
            <>
              <Marker position={endpoints.start} icon={OriginIcon} zIndexOffset={1000}>
                <Popup>
                  <div className="text-gray-800 text-sm min-w-35">
                    <span className="font-semibold text-green-700">Route Start</span>
                    {gtfsRouteLabel && <p className="text-xs text-gray-500 mt-1">{gtfsRouteLabel}</p>}
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {endpoints.start[0].toFixed(5)}, {endpoints.start[1].toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </Marker>
              <Marker position={endpoints.end} icon={DestinationIcon} zIndexOffset={1000}>
                <Popup>
                  <div className="text-gray-800 text-sm min-w-35">
                    <span className="font-semibold text-red-700">Route End</span>
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

        {selectedRoute && !gtfsRoutePath && !hasTransferPath && (
          <Polyline
            positions={userLocation ? [userLocation, ...selectedRoute.path] : selectedRoute.path}
            color="#2563eb"
            weight={5}
            opacity={0.85}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {originStop && (
          <Marker position={[originStop.stop_lat, originStop.stop_lon]} icon={OriginIcon} zIndexOffset={1100}>
            <Popup>
              <div className="text-gray-800 text-sm min-w-35">
                <span className="font-semibold text-green-700">Origin</span>
                <p className="text-xs text-gray-600 mt-0.5">{originStop.stop_name}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {destinationStop && (
          <Marker
            position={[destinationStop.stop_lat, destinationStop.stop_lon]}
            icon={DestinationIcon}
            zIndexOffset={1100}
          >
            <Popup>
              <div className="text-gray-800 text-sm min-w-35">
                <span className="font-semibold text-red-700">Destination</span>
                <p className="text-xs text-gray-600 mt-0.5">{destinationStop.stop_name}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {transferStop && (
          <Marker position={[transferStop.stop_lat, transferStop.stop_lon]} icon={TransferIcon} zIndexOffset={1150}>
            <Popup>
              <div className="text-gray-800 text-sm min-w-35">
                <span className="font-semibold text-amber-700">Transfer</span>
                <p className="text-xs text-gray-600 mt-0.5">{transferStop.stop_name}</p>
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
