import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Loader2, Bus } from 'lucide-react';
import type { Route } from '../types/Route';

interface RouteSelectorProps {
  routes: Route[];
  loading: boolean;
  error: string | null;
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
}

export default function RouteSelector({
  routes,
  loading,
  error,
  selectedRouteId,
  onSelectRoute,
}: RouteSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedRoute = routes.find((r) => r.route_id === selectedRouteId);

  const filtered = routes.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.route_short_name.toLowerCase().includes(q) ||
      r.route_long_name.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-3 border border-gray-100">
        <Loader2 size={14} className="animate-spin text-primary" />
        Loading routes...
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
        {error}
      </p>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch('');
        }}
        className="w-full flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-800 text-base md:text-sm rounded-xl px-3 py-3.5 md:py-3 hover:border-primary/50 transition-all duration-200 cursor-pointer"
      >
        <Bus size={16} className="text-primary shrink-0" />
        <span className="flex-1 text-left truncate">
          {selectedRoute
            ? `${selectedRoute.route_short_name} — ${selectedRoute.route_long_name}`
            : 'Select a route...'}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Selected route indicator */}
      {selectedRoute && (
        <div className="mt-2 flex items-center gap-2 text-xs text-primary bg-primary/5 rounded-lg px-3 py-2 border border-primary/10">
          <Bus size={12} />
          <span className="font-medium">{selectedRoute.route_short_name}</span>
          <span className="text-gray-500 truncate">{selectedRoute.route_long_name}</span>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search input inside dropdown */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg pl-8 pr-3 py-2 placeholder-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                placeholder="Search routes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Route list */}
          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((route) => (
                <li key={route.route_id}>
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-start gap-2 ${
                      route.route_id === selectedRouteId
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      onSelectRoute(route.route_id);
                      setIsOpen(false);
                    }}
                  >
                    <span className="shrink-0 font-semibold text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5 mt-0.5">
                      {route.route_short_name}
                    </span>
                    <span className="truncate">{route.route_long_name}</span>
                  </button>
                </li>
              ))
            ) : (
              <li className="p-3 text-sm text-gray-400 text-center">No routes found</li>
            )}
          </ul>

          {/* Count */}
          <div className="px-3 py-1.5 text-[10px] text-gray-400 border-t border-gray-100 bg-gray-50">
            {filtered.length} of {routes.length} routes
          </div>
        </div>
      )}
    </div>
  );
}
