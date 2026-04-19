import { ArrowLeft, Clock, Bus, Car, Eye, CheckCircle } from 'lucide-react';
import type { RouteOption } from '../../data/mockData';
import MapView from '../MapView';

// Bajaj icon SVG component
function BajajIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
      <path d="M5 18H3V11l4-7h6l3 4h4v6" />
      <path d="M9 18h6" />
      <path d="M19 14V9" />
    </svg>
  );
}

function getTransportIcon(type: string) {
  switch (type) {
    case 'minibus':
      return (
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <Bus size={20} />
        </div>
      );
    case 'taxi':
      return (
        <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-xl">
          <Car size={20} />
        </div>
      );
    case 'bajaj':
      return (
        <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
          <BajajIcon size={20} />
        </div>
      );
    default:
      return (
        <div className="p-2.5 bg-gray-50 text-gray-600 rounded-xl">
          <Bus size={20} />
        </div>
      );
  }
}

function getTrafficBadge(traffic: string) {
  switch (traffic) {
    case 'low':
      return (
        <span className="traffic-low text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Low Traffic
        </span>
      );
    case 'moderate':
      return (
        <span className="traffic-moderate text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
          Moderate Traffic
        </span>
      );
    case 'high':
      return (
        <span className="traffic-high text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          High Traffic
        </span>
      );
    default:
      return null;
  }
}

interface RouteOptionsScreenProps {
  routes: RouteOption[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  onBack: () => void;
  onNavigate: () => void;
  userLocation: [number, number] | null;
  origin: string;
}

export default function RouteOptionsScreen({
  routes,
  selectedRouteId,
  onSelectRoute,
  onBack,
  onNavigate,
  userLocation,
  origin,
}: RouteOptionsScreenProps) {
  const selectedRoute = routes.find(r => r.id === selectedRouteId) || null;

  return (
    <div className="flex flex-col h-full bg-gray-50 screen-enter">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Route Options</h1>
      </div>

      {/* Map Preview */}
      <div className="shrink-0 px-4 pt-3">
        <MapView
          selectedRoute={selectedRoute}
          userLocation={userLocation}
          originLabel={origin}
          height="180px"
          interactive={true}
          showControls={true}
        />
      </div>

      {/* Route Cards */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {routes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No routes found. Try a different destination.</p>
          </div>
        ) : (
          routes.map((route, index) => {
            const isSelected = selectedRouteId === route.id;
            return (
              <div
                key={route.id}
                onClick={() => onSelectRoute(route.id)}
                className={`route-card ${isSelected ? 'selected' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Transport Icon */}
                  {getTransportIcon(route.type)}

                  {/* Route Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Route {index + 1}
                        <span className="text-gray-500 font-normal"> - {route.routeName}</span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        {route.durationMins} min
                      </span>
                      <span className="text-xs font-semibold text-gray-800">{route.fareETB} ETB</span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {getTrafficBadge(route.traffic)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRoute(route.id);
                        }}
                        className="flex items-center gap-1 text-xs font-medium text-secondary border border-secondary/30 px-2.5 py-1 rounded-lg hover:bg-secondary/5 transition-colors cursor-pointer"
                      >
                        <Eye size={12} />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Select Route Button */}
      <div className="shrink-0 px-4 py-3 bg-white border-t border-gray-200">
        <button
          onClick={onNavigate}
          disabled={!selectedRouteId}
          className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
        >
          <CheckCircle size={18} />
          Select Route
        </button>
      </div>
    </div>
  );
}
