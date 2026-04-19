import { useState } from 'react';
import HomeScreen from '../components/screens/HomeScreen';
import RouteOptionsScreen from '../components/screens/RouteOptionsScreen';
import NavigationScreen from '../components/screens/NavigationScreen';
import { mockRoutes, type RouteOption } from '../data/mockData';

type Screen = 'HOME' | 'OPTIONS' | 'NAVIGATION';

export default function TransportApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
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
    <div className="app-shell h-screen overflow-hidden">
      {currentScreen === 'HOME' && (
        <HomeScreen
          origin={origin}
          setOrigin={handleSetOrigin}
          destination={destination}
          setDestination={setDestination}
          onSearch={handleSearch}
          isSearching={isSearching}
          searchError={searchError}
          userLocation={userLocation}
          onScreenChange={(screen) => setCurrentScreen(screen)}
          routes={routes}
        />
      )}

      {currentScreen === 'OPTIONS' && (
        <RouteOptionsScreen
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={setSelectedRouteId}
          onBack={() => setCurrentScreen('HOME')}
          onNavigate={() => {
            if (selectedRouteId) setCurrentScreen('NAVIGATION');
          }}
          userLocation={userLocation}
          origin={origin}
        />
      )}

      {currentScreen === 'NAVIGATION' && selectedRoute && (
        <NavigationScreen
          route={selectedRoute}
          onBack={() => setCurrentScreen('OPTIONS')}
          onEndTrip={() => {
            setCurrentScreen('HOME');
            setRoutes([]);
            setSelectedRouteId(null);
            setDestination('');
          }}
          userLocation={userLocation}
          origin={origin}
        />
      )}
    </div>
  );
}
