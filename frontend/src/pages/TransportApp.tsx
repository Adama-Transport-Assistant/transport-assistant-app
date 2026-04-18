import { useState } from 'react';
import MapView from '../components/MapView';
import Footer from '../components/Footer';
import SearchUI from '../components/SearchUI';
import { mockRoutes, type RouteOption } from '../data/mockData';

interface TransportAppProps {
  onBack: () => void;
}

export default function TransportApp({ onBack }: TransportAppProps) {
  const [origin, setOrigin] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSetOrigin = (val: string, coords?: [number, number]) => {
    setOrigin(val);
    if (coords) setUserLocation(coords);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setSearchError(null);
    setRoutes([]);
    setSelectedRouteId(null);

    setTimeout(() => {
      // Find matching routes. User might be at a reverse geocoded place, so we loosely match.
      const matchedRoutes = mockRoutes.filter(r =>
        r.destination.toLowerCase() === destination.toLowerCase() &&
        (userLocation !== null || origin === 'Your Location' || r.origin.toLowerCase().includes(origin.toLowerCase()) || origin.toLowerCase().includes(r.origin.toLowerCase()))
      );

      if (matchedRoutes.length > 0) {
        setRoutes(matchedRoutes);
        setSelectedRouteId(matchedRoutes[0].id); // Auto-select first route
      } else {
        setSearchError('Route not found between these locations.');
      }
      setIsSearching(false);
    }, 600);
  };

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || null;

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 flex-col md:flex-row overflow-hidden w-full max-w-full">
      {/* Sidebar for Search and Routes */}
      <aside className="w-full md:w-96 bg-gray-900 shadow-2xl z-10 flex flex-col relative h-[50vh] md:h-full border-r border-green-900/30">
        <div className="p-4 border-b border-gray-800 shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-green-500 flex items-center gap-2">
              Smart Transport
            </h1>
            <p className="text-sm text-gray-400">Adama, Ethiopia</p>
          </div>
          <button
            onClick={onBack}
            className="text-xs text-gray-400 hover:text-white px-3 py-1 cursor-pointer border border-gray-700 rounded bg-gray-800 transition-colors"
          >
            Back
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <SearchUI
            origin={origin}
            setOrigin={handleSetOrigin}
            destination={destination}
            setDestination={setDestination}
            routes={routes}
            onSearch={handleSearch}
            selectedRouteId={selectedRouteId}
            onSelectRoute={setSelectedRouteId}
            isSearching={isSearching}
            searchError={searchError}
          />
        </div>
      </aside>

      {/* Main Map Area */}
      <div className='flex-1 relative p-4 rounded-xl md:rounded-none md:p-0 flex flex-col'>
        <main className="flex-1 relative bg-gray-900 h-full w-full">
          <MapView selectedRoute={selectedRoute} userLocation={userLocation} originLabel={origin} />
        </main>
        <Footer />
      </div>
    </div>
  );
}

