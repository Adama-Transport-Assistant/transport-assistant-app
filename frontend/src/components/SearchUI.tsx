import React, { useState } from 'react';
import { MapPin, Navigation2, Search } from 'lucide-react';
import { mockRoutes } from '../data/mockRoutes';
import type { RouteOption } from '../data/mockRoutes';
import RouteDetails from './RouteDetails';

export default function SearchUI() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [searchResults, setSearchResults] = useState<RouteOption[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;
    // Connect to mock data
    setSearchResults(mockRoutes);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          {/* Origin Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <MapPin size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block pl-10 p-2.5 placeholder-gray-500 outline-none transition-colors"
              placeholder="Starting point (e.g., Posta Bet)"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              required
            />
          </div>

          {/* Destination Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Navigation2 size={18} className="text-green-500" />
            </div>
            <input
              type="text"
              className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block pl-10 p-2.5 placeholder-gray-500 outline-none transition-colors"
              placeholder="Where to? (e.g., Menahariya)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full text-white bg-green-600 hover:bg-green-500 focus:ring-4 focus:outline-none focus:ring-green-900 font-medium rounded-lg text-sm px-5 py-3 text-center flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-green-600/20"
          >
            <Search size={18} />
            Find Directions
          </button>
        </form>
      </div>

      {searchResults.length > 0 && <RouteDetails routes={searchResults} />}
    </div>
  );
}
