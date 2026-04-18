import React from 'react';
import { Search, Loader2 } from 'lucide-react';
import type { RouteOption } from '../data/mockData';
import RouteResults from './RouteResults';
import LocationInput from './LocationInput';
import RouteDropdown from './RouteDropdown';

interface SearchUIProps {
  origin: string;
  setOrigin: (val: string, coords?: [number, number]) => void;
  destination: string;
  setDestination: (val: string) => void;
  routes: RouteOption[];
  onSearch: () => void;
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  isSearching: boolean;
  searchError: string | null;
}

export default function SearchUI({
  origin,
  setOrigin,
  destination,
  setDestination,
  routes,
  onSearch,
  selectedRouteId,
  onSelectRoute,
  isSearching,
  searchError
}: SearchUIProps) {

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const isFormValid = origin.trim() !== '' && destination.trim() !== '';

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <LocationInput value={origin} onChange={setOrigin} />
          <RouteDropdown value={destination} onChange={setDestination} />

          {searchError && (
            <p className="text-sm text-red-500 bg-red-900/20 p-2 rounded-lg border border-red-900">
              {searchError}
            </p>
          )}

          <button
            type="submit"
            disabled={!isFormValid || isSearching}
            className="w-full text-white bg-green-600 hover:bg-green-500 focus:ring-4 focus:outline-none focus:ring-green-900 font-medium rounded-lg text-sm px-5 py-3 text-center flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            Find Directions
          </button>
        </form>
      </div>

      <RouteResults 
        routes={routes} 
        selectedRouteId={selectedRouteId} 
        onSelectRoute={onSelectRoute}
      />
    </div>
  );
}


