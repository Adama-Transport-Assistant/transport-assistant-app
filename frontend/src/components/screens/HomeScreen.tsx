import { useMemo, useState } from 'react';
import { Loader2, Home, Heart, Search, WifiOff } from 'lucide-react';
import MapView from '../MapView';
import RouteSelector from '../RouteSelector';
import StopAutocomplete from '../StopAutocomplete';
import { useStops } from '../../hooks/useStops';
import { useRoutes } from '../../hooks/useRoutes';
import { useTrips } from '../../hooks/useTrips';
import { useShapes } from '../../hooks/useShapes';
import { useStopTimes } from '../../hooks/useStopTimes';
import type { Stop } from '../../types/Stop';
import {
  findDirectGtfsRoute,
  type SelectedGtfsRoute,
} from '../../utils/findDirectGtfsRoute';
import adamahero from '../../assets/adama-hero.png';

export default function HomeScreen() {
  // GTFS data hooks
  const { stops, loading: stopsLoading, error: stopsError } = useStops();
  const { routes: gtfsRoutes, loading: routesLoading, error: routesError } = useRoutes();
  const { trips, loading: tripsLoading } = useTrips();
  const { shapesMap, loading: shapesLoading } = useShapes();
  const { stopTimes, loading: stopTimesLoading, error: stopTimesError } = useStopTimes();

  // Route selection state (required in Step 5)
  const [selectedRoute, setSelectedRoute] = useState<SelectedGtfsRoute | null>(null);
  const [directRouteError, setDirectRouteError] = useState<string | null>(null);

  // User origin/destination stop selection
  const [originStop, setOriginStop] = useState<Stop | null>(null);
  const [destinationStop, setDestinationStop] = useState<Stop | null>(null);

  const selectedRouteId = selectedRoute?.route_id ?? null;

  // Keep route dropdown working by mapping route_id -> first trip's shape_id
  const routeShapeByRouteId = useMemo(() => {
    const map = new Map<string, SelectedGtfsRoute>();
    for (const trip of trips) {
      if (!map.has(trip.route_id)) {
        map.set(trip.route_id, { route_id: trip.route_id, shape_id: trip.shape_id });
      }
    }
    return map;
  }, [trips]);

  // Resolve selected shape to full route path (already sequence-sorted in useShapes)
  const gtfsRoutePath = useMemo(() => {
    if (!selectedRoute) return null;
    return shapesMap.get(selectedRoute.shape_id) ?? null;
  }, [selectedRoute, shapesMap]);

  // Find selected route metadata for display
  const selectedRouteInfo = gtfsRoutes.find((r) => r.route_id === selectedRouteId);
  const gtfsRouteLabel = selectedRouteInfo
    ? `${selectedRouteInfo.route_short_name} - ${selectedRouteInfo.route_long_name}`
    : undefined;

  // Overall data loading state
  const isRouteDataLoading = tripsLoading || shapesLoading;
  const isFindRouteDataLoading = stopTimesLoading || tripsLoading || shapesLoading;
  const isFindRouteDisabled = !originStop || !destinationStop || isFindRouteDataLoading;

  const handleOriginChange = (stop: Stop | null) => {
    setOriginStop(stop);
    setSelectedRoute(null);
    setDirectRouteError(null);
  };

  const handleDestinationChange = (stop: Stop | null) => {
    setDestinationStop(stop);
    setSelectedRoute(null);
    setDirectRouteError(null);
  };

  const handleSelectRoute = (routeId: string) => {
    const manualRoute = routeShapeByRouteId.get(routeId) ?? null;
    setSelectedRoute(manualRoute);
    setDirectRouteError(null);
  };

  const handleFindRoute = () => {
    if (!originStop || !destinationStop) return;

    const matchedRoute = findDirectGtfsRoute({
      originStopId: originStop.stop_id,
      destinationStopId: destinationStop.stop_id,
      originStopName: originStop.stop_name,
      destinationStopName: destinationStop.stop_name,
      stopTimes,
      trips,
      routes: gtfsRoutes,
      stops,
      shapesMap,
    });

    if (!matchedRoute) {
      setSelectedRoute(null);
      setDirectRouteError('No direct route found');
      return;
    }

    setSelectedRoute(matchedRoute);
    setDirectRouteError(null);
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-50 screen-enter">
      {/* Left column / main content */}
      <div className="flex flex-col h-full md:w-105 lg:w-120 md:shrink-0 md:border-r md:border-gray-200 md:bg-white md:overflow-y-auto">
        {/* Hero Section */}
        <div
          className="relative text-white px-5 pt-10 pb-20 md:pt-8 md:pb-16 md:m-4 md:rounded-2xl shrink-0 overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${adamahero})` }}
        >
          <div className="absolute inset-0 md:rounded-2xl bg-linear-to-br from-black/65 via-emerald-900/55 to-black/45"></div>
          <div className="relative">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">Navigate Ethiopian Cities</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-8 h-px bg-white/40"></div>
              <p className="text-emerald-100 text-sm font-medium">Like a Local</p>
              <div className="w-8 h-px bg-white/40"></div>
            </div>
          </div>
        </div>

        {/* Floating Card: Origin / Destination + Route Selector */}
        <div className="px-4 md:px-5 -mt-14 md:-mt-10 relative z-10">
          <div className="floating-card space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Where are you going?</p>

            <StopAutocomplete
              stops={stops}
              placeholder="Enter starting location"
              value={originStop}
              onChange={handleOriginChange}
              iconColor="text-green-600"
            />

            <StopAutocomplete
              stops={stops}
              placeholder="Enter destination"
              value={destinationStop}
              onChange={handleDestinationChange}
              iconColor="text-red-500"
            />

            <button
              type="button"
              onClick={handleFindRoute}
              disabled={isFindRouteDisabled}
              className="w-full text-white bg-primary hover:bg-primary-light font-medium rounded-xl text-sm px-4 py-3 text-center flex justify-center items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFindRouteDataLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              Find Route
            </button>

            {directRouteError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                {directRouteError}
              </p>
            )}

            {selectedRouteInfo && (
              <p className="text-xs text-primary bg-primary/5 px-3 py-2 rounded-lg border border-primary/15">
                Active route: {selectedRouteInfo.route_short_name} - {selectedRouteInfo.route_long_name}
              </p>
            )}

            {/* Divider */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Or select a bus route</p>
            </div>

            <RouteSelector
              routes={gtfsRoutes}
              loading={routesLoading}
              error={routesError}
              selectedRouteId={selectedRouteId}
              onSelectRoute={handleSelectRoute}
            />

            {/* Data loading indicator */}
            {isRouteDataLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 size={12} className="animate-spin" />
                Loading route shapes...
              </div>
            )}

            {/* stop_times loading/error indicator for Find Route */}
            {stopTimesLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 size={12} className="animate-spin" />
                Loading trip stop sequences...
              </div>
            )}
            {stopTimesError && (
              <p className="text-xs text-red-600 bg-red-50 px-2.5 py-2 rounded-lg border border-red-200">
                {stopTimesError}
              </p>
            )}

            {/* Selected route path feedback */}
            {selectedRoute && !isRouteDataLoading && gtfsRoutePath && (
              <p className="text-xs text-gray-400">
                Route drawn with {gtfsRoutePath.length.toLocaleString()} shape points
              </p>
            )}
            {selectedRoute && !isRouteDataLoading && !gtfsRoutePath && (
              <p className="text-xs text-orange-500">No shape data found for this route</p>
            )}
          </div>
        </div>

        {/* Stops Loading / Error Indicator */}
        {stopsLoading && (
          <div className="px-5 mt-3">
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
              <Loader2 size={14} className="animate-spin text-primary" />
              Loading stops...
            </div>
          </div>
        )}
        {stopsError && (
          <div className="px-5 mt-3">
            <p className="text-sm text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
              {stopsError}
            </p>
          </div>
        )}
        {!stopsLoading && !stopsError && stops.length > 0 && (
          <div className="px-5 mt-3">
            <p className="text-xs text-gray-400">{stops.length.toLocaleString()} bus stops loaded</p>
          </div>
        )}

        {/* Map Preview - mobile only */}
        <div className="px-4 mt-4 flex-1 min-h-0 pb-2 md:hidden">
          <div className="rounded-2xl overflow-hidden shadow-md h-full min-h-50">
            <MapView
              selectedRoute={null}
              height="100%"
              interactive={true}
              showControls={false}
              stops={stops}
              gtfsRoutePath={gtfsRoutePath}
              gtfsRouteLabel={gtfsRouteLabel}
              originStop={originStop}
              destinationStop={destinationStop}
            />
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-nav shrink-0 md:mt-auto md:border-t md:border-gray-200">
          <button className="bottom-nav-item active">
            <Home size={20} />
            <span>Home</span>
          </button>
          <button className="bottom-nav-item">
            <Heart size={20} />
            <span>Saved</span>
          </button>
          <button className="bottom-nav-item">
            <WifiOff size={20} />
            <span>Offline</span>
          </button>
        </div>
      </div>

      {/* Right column: map (desktop only) */}
      <div className="hidden md:block flex-1 h-full">
        <MapView
          selectedRoute={null}
          height="100%"
          interactive={true}
          showControls={true}
          stops={stops}
          gtfsRoutePath={gtfsRoutePath}
          gtfsRouteLabel={gtfsRouteLabel}
          originStop={originStop}
          destinationStop={destinationStop}
        />
      </div>
    </div>
  );
}
