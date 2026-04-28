import { useMemo, useState } from 'react';
import { Home, Heart, Loader2, Search, WifiOff, Brain } from 'lucide-react';
import MapView from '../MapView';
import RouteSelector from '../RouteSelector';
import StopAutocomplete from '../StopAutocomplete';
import { useStops } from '../../hooks/useStops';
import { useRoutes } from '../../hooks/useRoutes';
import { useTrips } from '../../hooks/useTrips';
import { useShapes } from '../../hooks/useShapes';
import { useStopTimes } from '../../hooks/useStopTimes';
import type { Stop } from '../../types/Stop';
import type { JourneyStep } from '../../types/Journey';
import {
  findDirectGtfsRoute,
  type SelectedGtfsRoute,
} from '../../utils/findDirectGtfsRoute';
import { findTransferGtfsRoute } from '../../utils/findTransferGtfsRoute';
import adamahero from '../../assets/adama-hero.png';

type TransferRouteState = {
  transferStop: string;
  transferStopId: string;
  route1: SelectedGtfsRoute;
  route2: SelectedGtfsRoute;
  route1Name: string;
  route2Name: string;
} | null;

interface RouteMetrics {
  durationMins: number;
  totalStops: number;
  transfers: number;
}

interface RouteSuggestion {
  type: 'direct' | 'transfer';
  routeName: string;
  reason: string;
  advantages: string[];
}

const stepIcon: Record<JourneyStep['type'], string> = {
  walk: '🚶',
  board: '🚌',
  transfer: '🔁',
  alight: '🚏',
  arrive: '📍',
};

export default function HomeScreen() {
  const { stops, loading: stopsLoading, error: stopsError } = useStops();
  const { routes: gtfsRoutes, loading: routesLoading, error: routesError } = useRoutes();
  const { trips, loading: tripsLoading } = useTrips();
  const { shapesMap, loading: shapesLoading } = useShapes();
  const { stopTimes, loading: stopTimesLoading, error: stopTimesError } = useStopTimes();

  const [selectedRoute, setSelectedRoute] = useState<SelectedGtfsRoute | null>(null);
  const [transferRoute, setTransferRoute] = useState<TransferRouteState>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showStops, setShowStops] = useState(false);
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([]);
  const [routeSuggestion, setRouteSuggestion] = useState<RouteSuggestion | null>(null);

  const [originStop, setOriginStop] = useState<Stop | null>(null);
  const [destinationStop, setDestinationStop] = useState<Stop | null>(null);

  const selectedRouteId = selectedRoute?.route_id ?? null;

  const routeShapeByRouteId = useMemo(() => {
    const map = new Map<string, SelectedGtfsRoute>();
    for (const trip of trips) {
      if (!map.has(trip.route_id)) {
        map.set(trip.route_id, {
          trip_id: trip.trip_id,
          route_id: trip.route_id,
          shape_id: trip.shape_id,
        });
      }
    }
    return map;
  }, [trips]);

  const gtfsRoutePath = useMemo(() => {
    if (!selectedRoute) return null;
    return shapesMap.get(selectedRoute.shape_id) ?? null;
  }, [selectedRoute, shapesMap]);

  const transferRoute1Path = useMemo(() => {
    if (!transferRoute) return null;
    return shapesMap.get(transferRoute.route1.shape_id) ?? null;
  }, [transferRoute, shapesMap]);

  const transferRoute2Path = useMemo(() => {
    if (!transferRoute) return null;
    return shapesMap.get(transferRoute.route2.shape_id) ?? null;
  }, [transferRoute, shapesMap]);

  const transferStop = useMemo(() => {
    if (!transferRoute) return null;
    return stops.find((stop) => stop.stop_id === transferRoute.transferStopId) ?? null;
  }, [transferRoute, stops]);

  const routeStopIds = useMemo(() => {
    if (!showStops) return new Set<string>();

    const ids = new Set<string>();
    if (selectedRoute) {
      for (const stopTime of stopTimes) {
        if (stopTime.trip_id === selectedRoute.trip_id) {
          ids.add(stopTime.stop_id);
        }
      }
    }

    if (transferRoute) {
      for (const stopTime of stopTimes) {
        if (
          stopTime.trip_id === transferRoute.route1.trip_id ||
          stopTime.trip_id === transferRoute.route2.trip_id
        ) {
          ids.add(stopTime.stop_id);
        }
      }
    }

    return ids;
  }, [showStops, selectedRoute, transferRoute, stopTimes]);

  const visibleStops = useMemo(() => {
    if (!showStops || routeStopIds.size === 0) return [];
    return stops.filter((stop) => routeStopIds.has(stop.stop_id));
  }, [showStops, routeStopIds, stops]);

  const selectedRouteInfo = gtfsRoutes.find((route) => route.route_id === selectedRouteId);
  const gtfsRouteLabel = selectedRouteInfo
    ? `${selectedRouteInfo.route_short_name} - ${selectedRouteInfo.route_long_name}`
    : undefined;

  const isRouteDataLoading = tripsLoading || shapesLoading;
  const isFindRouteDataLoading = stopTimesLoading || tripsLoading || shapesLoading;
  const isFindRouteDisabled = !originStop || !destinationStop || isFindRouteDataLoading;

  const resetRouteState = () => {
    setSelectedRoute(null);
    setTransferRoute(null);
    setShowStops(false);
    setJourneySteps([]);
    setRouteSuggestion(null);
  };

  const calculateRouteMetrics = (route: SelectedGtfsRoute): RouteMetrics => {
    const tripStopTimes = stopTimes.filter(st => st.trip_id === route.trip_id);
    if (tripStopTimes.length === 0) return { durationMins: 0, totalStops: 0, transfers: 0 };

    const sorted = tripStopTimes.sort((a, b) => a.stop_sequence - b.stop_sequence);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    if (!first?.departure_time || !last?.arrival_time) {
      return { durationMins: 0, totalStops: sorted.length, transfers: 0 };
    }

    // Convert HH:MM:SS to minutes
    const depParts = first.departure_time.split(':');
    const arrParts = last.arrival_time.split(':');
    if (depParts.length !== 3 || arrParts.length !== 3) {
      return { durationMins: 0, totalStops: sorted.length, transfers: 0 };
    }

    const [h1, m1, s1] = depParts.map(Number);
    const [h2, m2, s2] = arrParts.map(Number);
    const durationMins = (h2 * 60 + m2 + s2 / 60) - (h1 * 60 + m1 + s1 / 60);

    return {
      durationMins: Math.max(1, Math.round(durationMins)),
      totalStops: sorted.length,
      transfers: 0,
    };
  };

  const calculateTransferMetrics = (route1: SelectedGtfsRoute, route2: SelectedGtfsRoute): RouteMetrics => {
    const metrics1 = calculateRouteMetrics(route1);
    const metrics2 = calculateRouteMetrics(route2);
    return {
      durationMins: metrics1.durationMins + metrics2.durationMins,
      totalStops: metrics1.totalStops + metrics2.totalStops,
      transfers: 1,
    };
  };

  const routeNameById = (routeId: string): string => {
    const route = gtfsRoutes.find((item) => item.route_id === routeId);
    return route ? `${route.route_short_name} - ${route.route_long_name}` : routeId;
  };

  const buildDirectJourneySteps = (routeName: string): JourneyStep[] => {
    if (!originStop || !destinationStop) return [];
    return [
      { type: 'walk', label: `Walk to ${originStop.stop_name} stop` },
      { type: 'board', label: `Take ${routeName}` },
      { type: 'alight', label: `Ride until ${destinationStop.stop_name} and get off` },
      { type: 'arrive', label: `Arrive at ${destinationStop.stop_name}` },
    ];
  };

  const buildTransferJourneySteps = (route1Name: string, route2Name: string, transferName: string): JourneyStep[] => {
    if (!originStop || !destinationStop) return [];
    return [
      { type: 'walk', label: `Walk to ${originStop.stop_name} stop` },
      { type: 'board', label: `Take ${route1Name}` },
      { type: 'alight', label: `Get off at ${transferName}` },
      { type: 'transfer', label: `Transfer at ${transferName}` },
      { type: 'board', label: `Take ${route2Name}` },
      { type: 'alight', label: `Ride to ${destinationStop.stop_name}` },
      { type: 'arrive', label: `Arrive at ${destinationStop.stop_name}` },
    ];
  };

  const handleOriginChange = (stop: Stop | null) => {
    setOriginStop(stop);
    resetRouteState();
    setSearchError(null);
  };

  const handleDestinationChange = (stop: Stop | null) => {
    setDestinationStop(stop);
    resetRouteState();
    setSearchError(null);
  };

  const handleSelectRoute = (routeId: string) => {
    const manualRoute = routeShapeByRouteId.get(routeId) ?? null;
    setSelectedRoute(manualRoute);
    setTransferRoute(null);
    setShowStops(false);
    setJourneySteps([]);
    setRouteSuggestion(null);
    setSearchError(null);
  };

  const handleFindRoute = () => {
    if (!originStop || !destinationStop) return;

    const directMatch = findDirectGtfsRoute({
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

    let directMetrics: RouteMetrics | null = null;
    if (directMatch) {
      directMetrics = calculateRouteMetrics(directMatch);
    }

    const transferMatch = findTransferGtfsRoute({
      originStopId: originStop.stop_id,
      destinationStopId: destinationStop.stop_id,
      originStopName: originStop.stop_name,
      destinationStopName: destinationStop.stop_name,
      stopTimes,
      trips,
      stops,
      shapesMap,
    });

    let transferMetrics: RouteMetrics | null = null;
    if (transferMatch) {
      transferMetrics = calculateTransferMetrics(transferMatch.route1, transferMatch.route2);
    }

    // Decision logic
    let suggestion: RouteSuggestion | null = null;
    if (directMatch && transferMatch) {
      // Both available, compare
      if (directMetrics!.transfers < transferMetrics!.transfers) {
        // Prefer direct
        suggestion = {
          type: 'direct',
          routeName: routeNameById(directMatch.route_id),
          reason: 'Direct route — faster and no transfers.',
          advantages: [
            `Faster by ~${transferMetrics!.durationMins - directMetrics!.durationMins} mins`,
            'No transfers needed',
            'Simpler journey',
          ],
        };
      } else if (directMetrics!.durationMins < transferMetrics!.durationMins) {
        suggestion = {
          type: 'direct',
          routeName: routeNameById(directMatch.route_id),
          reason: 'Direct route — faster despite transfers.',
          advantages: [
            `Faster by ~${transferMetrics!.durationMins - directMetrics!.durationMins} mins`,
            'Fewer stops',
            'Direct connection',
          ],
        };
      } else {
        suggestion = {
          type: 'transfer',
          routeName: `${routeNameById(transferMatch.route1.route_id)} → ${routeNameById(transferMatch.route2.route_id)}`,
          reason: 'Transfer route — comparable time with fewer stops.',
          advantages: [
            'Fewer stops overall',
            'Alternative option',
            'May have better traffic conditions',
          ],
        };
      }
    } else if (directMatch) {
      suggestion = {
        type: 'direct',
        routeName: routeNameById(directMatch.route_id),
        reason: 'Direct route — only option available.',
        advantages: [
          'No transfers',
          'Straightforward journey',
          'Reliable connection',
        ],
      };
    } else if (transferMatch) {
      suggestion = {
        type: 'transfer',
        routeName: `${routeNameById(transferMatch.route1.route_id)} → ${routeNameById(transferMatch.route2.route_id)}`,
        reason: 'Transfer route — only option available.',
        advantages: [
          'Reaches destination',
          'With one transfer',
          'Alternative route',
        ],
      };
    }

    if (directMatch) {
      const directRouteName = routeNameById(directMatch.route_id);
      setSelectedRoute(directMatch);
      setTransferRoute(null);
      setShowStops(true);
      setJourneySteps(buildDirectJourneySteps(directRouteName));
      setRouteSuggestion(suggestion);
      setSearchError(null);
      return;
    }

    if (!transferMatch) {
      resetRouteState();
      setSearchError('No route found');
      return;
    }

    const transferStopName =
      stops.find((stop) => stop.stop_id === transferMatch.transferStopId)?.stop_name ??
      transferMatch.transferStopId;
    const route1Name = routeNameById(transferMatch.route1.route_id);
    const route2Name = routeNameById(transferMatch.route2.route_id);

    setSelectedRoute(null);
    setTransferRoute({
      transferStop: transferStopName,
      transferStopId: transferMatch.transferStopId,
      route1: transferMatch.route1,
      route2: transferMatch.route2,
      route1Name,
      route2Name,
    });
    setShowStops(true);
    setJourneySteps(buildTransferJourneySteps(route1Name, route2Name, transferStopName));
    setRouteSuggestion(suggestion);
    setSearchError(null);
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-50 screen-enter">
      <div className="flex flex-col h-full overflow-y-auto md:w-105 lg:w-120 md:shrink-0 md:border-r md:border-gray-200 md:bg-white">
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

        <div className="px-4 md:px-5 -mt-14 md:-mt-10 relative z-10">
          <div className="floating-card space-y-3.5">
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
              className="w-full text-white bg-primary hover:bg-primary-light font-medium rounded-xl text-base md:text-sm px-5 py-3.5 text-center flex justify-center items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFindRouteDataLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Search size={18} />
              )}
              Find Route
            </button>

            {routeSuggestion && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={18} className="text-blue-600" />
                  <p className="text-sm font-semibold text-blue-800">Smart Suggestion</p>
                </div>
                <div className="text-sm text-blue-700 mb-2">
                  <span className="font-medium">✅ Recommended: {routeSuggestion.routeName}</span>
                  <br />
                  <span className="text-xs">{routeSuggestion.reason}</span>
                </div>
                <ul className="text-xs text-blue-600 space-y-1">
                  {routeSuggestion.advantages.map((adv, idx) => (
                    <li key={idx} className="flex items-center gap-1">
                      <span>✔</span>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {journeySteps.length > 0 && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-3">
                <p className="text-sm font-semibold text-primary mb-2">Your Trip</p>
                <ul className="max-h-56 md:max-h-64 overflow-y-auto pr-1 space-y-1.5">
                  {journeySteps.map((step, index) => (
                    <li key={`${step.type}-${index}`} className="flex items-start gap-2.5 py-1">
                      <span className="text-base leading-none mt-0.5">{stepIcon[step.type]}</span>
                      <span className="text-sm text-gray-700 leading-snug wrap-break-word">{step.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {searchError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                {searchError}
              </p>
            )}

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

            {isRouteDataLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 size={12} className="animate-spin" />
                Loading route shapes...
              </div>
            )}

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
          </div>
        </div>

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

        <div className="px-4 mt-4 pb-4 md:hidden">
          <div className="rounded-2xl overflow-hidden shadow-md h-[65vh] min-h-[60vh] max-h-[70vh]">
            <MapView
              selectedRoute={null}
              height="100%"
              interactive={true}
              showControls={false}
              stops={visibleStops}
              gtfsRoutePath={gtfsRoutePath}
              transferRoute1Path={transferRoute1Path}
              transferRoute2Path={transferRoute2Path}
              gtfsRouteLabel={gtfsRouteLabel}
              originStop={originStop}
              destinationStop={destinationStop}
              transferStop={transferStop}
            />
          </div>
        </div>

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

      <div className="hidden md:block flex-1 h-full">
        <MapView
          selectedRoute={null}
          height="100%"
          interactive={true}
          showControls={true}
          stops={visibleStops}
          gtfsRoutePath={gtfsRoutePath}
          transferRoute1Path={transferRoute1Path}
          transferRoute2Path={transferRoute2Path}
          gtfsRouteLabel={gtfsRouteLabel}
          originStop={originStop}
          destinationStop={destinationStop}
          transferStop={transferStop}
        />
      </div>
    </div>
  );
}
