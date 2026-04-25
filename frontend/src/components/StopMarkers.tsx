import { CircleMarker, Popup } from 'react-leaflet';
import type { Stop } from '../types/Stop';

interface StopMarkersProps {
  stops: Stop[];
}

/**
 * Renders all bus stops as lightweight CircleMarkers on the Leaflet map.
 * Uses CircleMarker (SVG-based) instead of Marker (DOM-based) for
 * performance with 2000+ stops.
 */
export default function StopMarkers({ stops }: StopMarkersProps) {
  return (
    <>
      {stops.map((stop) => (
        <CircleMarker
          key={stop.stop_id}
          center={[stop.stop_lat, stop.stop_lon]}
          radius={5}
          pathOptions={{
            color: '#ffffff',
            weight: 1.5,
            fillColor: '#16a34a',
            fillOpacity: 0.85,
          }}
        >
          <Popup>
            <div className="text-gray-800 text-sm min-w-[140px]">
              <span className="font-semibold">🚏 {stop.stop_name}</span>
              <p className="text-[10px] text-gray-400 mt-1">
                {stop.stop_lat.toFixed(5)}, {stop.stop_lon.toFixed(5)}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
