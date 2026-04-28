import { CircleMarker, Popup } from 'react-leaflet';
import type { Stop } from '../types/Stop';

interface StopMarkersProps {
  stops: Stop[];
  originId?: string | null;
  destinationId?: string | null;
  transferId?: string | null;
}

/**
 * Renders bus stops as CircleMarkers and highlights origin/transfer/destination.
 */
export default function StopMarkers({ stops, originId, destinationId, transferId }: StopMarkersProps) {
  return (
    <>
      {stops.map((stop) => {
        const isOrigin = originId && stop.stop_id === originId;
        const isDestination = destinationId && stop.stop_id === destinationId;
        const isTransfer = transferId && stop.stop_id === transferId;

        const radius = isOrigin || isDestination || isTransfer ? 7 : 4;
        let fillColor = '#16a34a';
        if (isOrigin) fillColor = '#16a34a';
        if (isDestination) fillColor = '#dc2626';
        if (isTransfer) fillColor = '#f59e0b';

        const fillOpacity = isOrigin || isDestination || isTransfer ? 0.95 : 0.5;

        return (
          <CircleMarker
            key={stop.stop_id}
            center={[stop.stop_lat, stop.stop_lon]}
            radius={radius}
            pathOptions={{
              color: '#ffffff',
              weight: 1,
              fillColor,
              fillOpacity,
            }}
          >
            <Popup>
              <div className="text-gray-800 text-sm min-w-35">
                <span className="font-semibold">{isOrigin ? '🟢 ' : isTransfer ? '🟠 ' : isDestination ? '🔴 ' : '🚏 '} {stop.stop_name}</span>
                <p className="text-[10px] text-gray-400 mt-1">
                  {stop.stop_lat.toFixed(5)}, {stop.stop_lon.toFixed(5)}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
