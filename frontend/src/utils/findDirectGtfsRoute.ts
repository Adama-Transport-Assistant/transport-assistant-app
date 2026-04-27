import type { Route, StopTime, Trip } from '../types/Route';
import type { Stop } from '../types/Stop';

export type SelectedGtfsRoute = {
  trip_id: string;
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

function normalizeStopName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildCandidateStopIds(
  selectedStopId: string,
  selectedStopName: string | undefined,
  stops: Stop[] | undefined
): Set<string> {
  const ids = new Set<string>([selectedStopId]);
  if (!selectedStopName || !stops || stops.length === 0) return ids;

  const selectedNorm = normalizeStopName(selectedStopName);
  if (!selectedNorm) return ids;

  for (const stop of stops) {
    const stopNorm = normalizeStopName(stop.stop_name);
    if (!stopNorm) continue;

    // Exact normalized name match (handles duplicate stop_ids with same name)
    if (stopNorm === selectedNorm) {
      ids.add(stop.stop_id);
      continue;
    }

    // Close-name variant match (e.g. "Ayer Tena" vs "Ayer Tena Gerar Repi")
    if (
      stopNorm.startsWith(`${selectedNorm} `) ||
      selectedNorm.startsWith(`${stopNorm} `)
    ) {
      ids.add(stop.stop_id);
    }
  }

  return ids;
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

function minForwardSequenceGap(originSeqs: number[], destinationSeqs: number[]): number {
  let bestGap = Number.POSITIVE_INFINITY;
  for (const originSeq of originSeqs) {
    for (const destinationSeq of destinationSeqs) {
      const gap = destinationSeq - originSeq;
      if (gap > 0 && gap < bestGap) bestGap = gap;
    }
  }
  return bestGap;
}

type TripCandidate = {
  trip: Trip;
  routeOrder: number;
  hasBothStopsInTrip: boolean;
  hasForwardOrder: boolean;
  forwardGap: number;
  anyGap: number;
};

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
  const {
    originStopId,
    destinationStopId,
    originStopName,
    destinationStopName,
    stopTimes,
    trips,
    stops,
    shapesMap,
  } = params;
  if (!originStopId || !destinationStopId) return null;

  const originCandidateStopIds = buildCandidateStopIds(originStopId, originStopName, stops);
  const destinationCandidateStopIds = buildCandidateStopIds(
    destinationStopId,
    destinationStopName,
    stops
  );

  const tripsById = new Map<string, Trip>();
  for (const trip of trips) {
    tripsById.set(trip.trip_id, trip);
  }

  const originTripSeqs = new Map<string, number[]>();
  const destinationTripSeqs = new Map<string, number[]>();

  for (const stopTime of stopTimes) {
    if (originCandidateStopIds.has(stopTime.stop_id)) {
      addSeq(originTripSeqs, stopTime.trip_id, stopTime.stop_sequence);
    }
    if (destinationCandidateStopIds.has(stopTime.stop_id)) {
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

  const routeOrderById = new Map<string, number>();
  let routeCounter = 0;
  for (const trip of trips) {
    if (!commonRouteIds.has(trip.route_id)) continue;
    if (routeOrderById.has(trip.route_id)) continue;
    routeOrderById.set(trip.route_id, routeCounter++);
  }

  const candidates: TripCandidate[] = [];
  for (const trip of trips) {
    if (!commonRouteIds.has(trip.route_id)) continue;
    if (!hasShape(trip, shapesMap)) continue;

    const originSeqs = originTripSeqs.get(trip.trip_id);
    const destinationSeqs = destinationTripSeqs.get(trip.trip_id);
    const hasBothStopsInTrip = Boolean(originSeqs && destinationSeqs);
    const forwardGap = hasBothStopsInTrip ? minForwardSequenceGap(originSeqs!, destinationSeqs!) : Number.POSITIVE_INFINITY;
    const anyGap = hasBothStopsInTrip ? minSequenceGap(originSeqs!, destinationSeqs!) : Number.POSITIVE_INFINITY;
    const hasForwardOrder = Number.isFinite(forwardGap);
    const routeOrder = routeOrderById.get(trip.route_id) ?? Number.POSITIVE_INFINITY;

    candidates.push({
      trip,
      routeOrder,
      hasBothStopsInTrip,
      hasForwardOrder,
      forwardGap,
      anyGap,
    });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    // Priority 1: same-trip forward direction (origin before destination)
    if (a.hasForwardOrder !== b.hasForwardOrder) return a.hasForwardOrder ? -1 : 1;

    // Priority 2: if both are forward, prefer closer sequence distance
    if (a.hasForwardOrder && b.hasForwardOrder && a.forwardGap !== b.forwardGap) {
      return a.forwardGap - b.forwardGap;
    }

    // Priority 3: any same-trip hit beats route-only fallback
    if (a.hasBothStopsInTrip !== b.hasBothStopsInTrip) return a.hasBothStopsInTrip ? -1 : 1;

    // Priority 4: among same-trip reverse/unknown direction, pick closest
    if (a.hasBothStopsInTrip && b.hasBothStopsInTrip && a.anyGap !== b.anyGap) {
      return a.anyGap - b.anyGap;
    }

    // Priority 5: stable route ordering from feed
    if (a.routeOrder !== b.routeOrder) return a.routeOrder - b.routeOrder;

    // Priority 6: stable trip ordering
    return a.trip.trip_id.localeCompare(b.trip.trip_id);
  });

  const selectedTrip = candidates[0].trip;
  return {
    trip_id: selectedTrip.trip_id,
    route_id: selectedTrip.route_id,
    shape_id: selectedTrip.shape_id,
  };
}
