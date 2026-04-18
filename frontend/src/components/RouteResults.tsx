
import type { RouteOption } from '../data/mockData';
import { Clock, Bus, Car } from 'lucide-react';

interface RouteResultsProps {
  routes: RouteOption[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
}

export default function RouteResults({ routes, selectedRouteId, onSelectRoute }: RouteResultsProps) {
  if (routes.length === 0) return null;

  return (
    <div className="mt-6 flex flex-col gap-3">
      <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
        Available Routes
      </h3>
      {routes.map((route) => {
        const isSelected = selectedRouteId === route.id;
        
        return (
          <div 
            key={route.id} 
            onClick={() => onSelectRoute(route.id)}
            className={`transition-colors rounded-xl p-4 cursor-pointer border ${isSelected ? 'bg-gray-800 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {route.type === 'minibus' ? (
                  <div className="p-2 bg-blue-900/30 text-blue-400 rounded-lg">
                    <Bus size={18} />
                  </div>
                ) : (
                  <div className="p-2 bg-yellow-900/30 text-yellow-400 rounded-lg">
                    <Car size={18} />
                  </div>
                )}
                <span className="font-medium text-gray-200 capitalize">{route.type}</span>
              </div>
              <span className="text-green-400 font-bold">{route.fareETB} ETB</span>
            </div>
            
            <div className="flex gap-4 text-sm text-gray-400 mt-3">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>~{route.durationMins} mins</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
}

