import { useState } from 'react';
import HomeScreen from '../components/screens/HomeScreen';
import RouteOptionsScreen from '../components/screens/RouteOptionsScreen';
import NavigationScreen from '../components/screens/NavigationScreen';
import { mockRoutes, type RouteOption } from '../data/mockData';

type Screen = 'HOME' | 'OPTIONS' | 'NAVIGATION';

export default function TransportApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = () => {
    setIsSearching(true);
    setSearchError(null);
    setRoutes([]);
    setSelectedRouteId(null);

    setTimeout(() => {
      const matchedRoutes = mockRoutes.filter(r =>
        r.destination.toLowerCase() === destination.toLowerCase() &&
        (origin === '' || r.origin.toLowerCase().includes(origin.toLowerCase()) || origin.toLowerCase().includes(r.origin.toLowerCase()))
      );

      if (matchedRoutes.length > 0) {
        setRoutes(matchedRoutes);
        setSelectedRouteId(matchedRoutes[0].id);
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
        <HomeScreen />
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
          userLocation={null}
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
          userLocation={null}
          origin={origin}
        />
      )}
    </div>
  );
}
