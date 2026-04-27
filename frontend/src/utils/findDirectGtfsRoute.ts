import type { Route, StopTime, Trip } from '../types/Route';
import type { Stop } from '../types/Stop';

export type SelectedGtfsRoute = {
  route_id: string;
  shape_id: string;
};

interface FindDirectGtfsRouteParams {
  originStopId: string;
  destinationStopId: string;
  originStopName?: string;
  destinationStopName?: string;
  stopTimes: StopTime[];
  trips: Trip[];
  routes?: Route[];
  stops?: Stop[];
  shapesMap?: Map<string, [number, number][]>;
}

function hasShape(
  trip: Trip,
  shapesMap?: Map<string, [number, number][]>
): boolean {
  if (!shapesMap) return true;
  return shapesMap.has(trip.shape_id);
}

function addSeq(map: Map<string, number[]>, tripId: string, stopSequence: number): void {
  const current = map.get(tripId);
  if (current) {
    current.push(stopSequence);
    return;
  }
  map.set(tripId, [stopSequence]);
}

function minSequenceGap(originSeqs: number[], destinationSeqs: number[]): number {
  let bestGap = Number.POSITIVE_INFINITY;
  for (const originSeq of originSeqs) {
    for (const destinationSeq of destinationSeqs) {
      const gap = Math.abs(destinationSeq - originSeq);
      if (gap < bestGap) bestGap = gap;
    }
  }
  return bestGap;
}

/**
 * Finds a direct GTFS route using relaxed route-level matching.
 *
 * Matching flow:
 * 1) Find trips that include origin stop.
 * 2) Find trips that include destination stop.
 * 3) Map those trip_ids to route_ids and intersect route sets.
 * 4) Pick any trip from a common route and return its shape_id.
 *
 * Optional preference:
 * - If a candidate trip contains both stops, prefer the one where the two
 *   stop sequences are closer together.
 */
export function findDirectGtfsRoute(params: FindDirectGtfsRouteParams): SelectedGtfsRoute | null {
  const { originStopId, destinationStopId, stopTimes, trips, shapesMap } = params;
  if (!originStopId || !destinationStopId) return null;

  const tripsById = new Map<string, Trip>();
  for (const trip of trips) {
    tripsById.set(trip.trip_id, trip);
  }

  const originTripSeqs = new Map<string, number[]>();
  const destinationTripSeqs = new Map<string, number[]>();

  for (const stopTime of stopTimes) {
    if (stopTime.stop_id === originStopId) {
      addSeq(originTripSeqs, stopTime.trip_id, stopTime.stop_sequence);
    }
    if (stopTime.stop_id === destinationStopId) {
      addSeq(destinationTripSeqs, stopTime.trip_id, stopTime.stop_sequence);
    }
  }

  const originRouteIds = new Set<string>();
  for (const tripId of originTripSeqs.keys()) {
    const trip = tripsById.get(tripId);
    if (trip) originRouteIds.add(trip.route_id);
  }

  const destinationRouteIds = new Set<string>();
  for (const tripId of destinationTripSeqs.keys()) {
    const trip = tripsById.get(tripId);
    if (trip) destinationRouteIds.add(trip.route_id);
  }

  const commonRouteIds = new Set<string>();
  for (const routeId of originRouteIds) {
    if (destinationRouteIds.has(routeId)) commonRouteIds.add(routeId);
  }
  if (commonRouteIds.size === 0) return null;

  const orderedCommonRouteIds: string[] = [];
  const seenRouteIds = new Set<string>();
  for (const trip of trips) {
    if (!commonRouteIds.has(trip.route_id)) continue;
    if (seenRouteIds.has(trip.route_id)) continue;
    seenRouteIds.add(trip.route_id);
    orderedCommonRouteIds.push(trip.route_id);
  }

  for (const routeId of orderedCommonRouteIds) {
    let fallbackTrip: Trip | null = null;
    let bestTrip: Trip | null = null;
    let bestGap = Number.POSITIVE_INFINITY;

    for (const trip of trips) {
      if (trip.route_id !== routeId) continue;
      if (!hasShape(trip, shapesMap)) continue;

      if (!fallbackTrip) fallbackTrip = trip;

      const originSeqs = originTripSeqs.get(trip.trip_id);
      const destinationSeqs = destinationTripSeqs.get(trip.trip_id);
      if (!originSeqs || !destinationSeqs) continue;

      const gap = minSequenceGap(originSeqs, destinationSeqs);
      if (gap < bestGap) {
        bestGap = gap;
        bestTrip = trip;
      }
    }

    const selectedTrip = bestTrip ?? fallbackTrip;
    if (!selectedTrip) continue;

    return {
      route_id: selectedTrip.route_id,
      shape_id: selectedTrip.shape_id,
    };
  }

  return null;
}
