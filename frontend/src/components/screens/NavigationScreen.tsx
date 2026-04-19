import { ArrowLeft, Clock, Banknote, Download, ChevronLeft, XCircle, Footprints, LogIn, LogOut, WifiOff } from 'lucide-react';
import type { RouteOption } from '../../data/mockData';
import MapView from '../MapView';

function getStepIcon(type: string) {
  switch (type) {
    case 'walk':
      return <Footprints size={16} className="text-blue-600" />;
    case 'board':
      return <LogIn size={16} className="text-green-600" />;
    case 'alight':
      return <LogOut size={16} className="text-red-500" />;
    default:
      return <Footprints size={16} className="text-gray-500" />;
  }
}

interface NavigationScreenProps {
  route: RouteOption;
  onBack: () => void;
  onEndTrip: () => void;
  userLocation: [number, number] | null;
  origin: string;
}

export default function NavigationScreen({
  route,
  onBack,
  onEndTrip,
  userLocation,
  origin,
}: NavigationScreenProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50 screen-enter">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-bold">En Route to {route.destination}</h1>
            <p className="text-green-200 text-xs">Route: {route.routeName}</p>
          </div>
        </div>
        {/* Next instruction highlight */}
        {route.steps.length > 0 && (
          <div className="mt-2 bg-white/15 rounded-xl px-3 py-2">
            <p className="text-xs text-green-100">Next:</p>
            <p className="text-sm font-medium">{route.steps[0].instruction}</p>
          </div>
        )}
      </div>

      {/* Map (main focus) */}
      <div className="flex-1 min-h-0">
        <MapView
          selectedRoute={route}
          userLocation={userLocation}
          originLabel={origin}
          height="100%"
          interactive={true}
          showControls={true}
        />
      </div>

      {/* Instruction Panel (bottom sheet) */}
      <div className="shrink-0 bg-white rounded-t-3xl -mt-4 relative z-10 border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Steps */}
        <div className="px-5 pb-3 max-h-[200px] overflow-y-auto">
          {route.steps.map((step, index) => (
            <div key={index} className="instruction-step">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">{index + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {getStepIcon(step.type)}
                  <span className="text-sm font-medium text-gray-800">{step.instruction}</span>
                </div>
                {step.duration && (
                  <span className="text-xs text-gray-400 ml-6">({step.duration})</span>
                )}
              </div>
            </div>
          ))}

          {/* ETA and Cost */}
          <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-secondary" />
              <span className="text-sm font-semibold text-gray-800">ETA: {route.durationMins} mins</span>
            </div>
            <div className="flex items-center gap-2">
              <Banknote size={16} className="text-primary" />
              <span className="text-sm font-semibold text-gray-800">Cost: {route.fareETB} ETB</span>
            </div>
          </div>
        </div>

        {/* Offline Mode Banner */}
        <div className="px-5 pb-3">
          <div className="offline-banner">
            <WifiOff size={14} />
            <span>Offline Mode: Navigation available without internet.</span>
          </div>
        </div>

        {/* Download Map Button */}
        <div className="px-5 pb-3">
          <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-[0.98]">
            <Download size={16} />
            Download Map
          </button>
        </div>

        {/* Back and End Trip */}
        <div className="flex gap-3 px-5 pb-4">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <button
            onClick={onEndTrip}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            <XCircle size={16} />
            End Trip
          </button>
        </div>
      </div>
    </div>
  );
}
