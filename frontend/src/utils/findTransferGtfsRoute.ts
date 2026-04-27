import type { StopTime, Trip } from '../types/Route';
import type { Stop } from '../types/Stop';
import type { SelectedGtfsRoute } from './findDirectGtfsRoute';

export type TransferRouteMatch = {
  transferStopId: string;
  route1: SelectedGtfsRoute;
  route2: SelectedGtfsRoute;
};

interface FindTransferGtfsRouteParams {
  originStopId: string;
  destinationStopId: string;
  originStopName?: string;
  destinationStopName?: string;
  stopTimes: StopTime[];
  trips: Trip[];
  stops?: Stop[];
  shapesMap?: Map<string, [number, number][]>;
}

type TripStopSeqIndex = Map<string, Map<string, number[]>>;

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

    if (stopNorm === selectedNorm) {
      ids.add(stop.stop_id);
      continue;
    }

    if (
      stopNorm.startsWith(`${selectedNorm} `) ||
      selectedNorm.startsWith(`${stopNorm} `)
    ) {
      ids.add(stop.stop_id);
    }
  }

  return ids;
}

function buildTripStopSeqIndex(stopTimes: StopTime[]): TripStopSeqIndex {
  const index: TripStopSeqIndex = new Map();

  for (const stopTime of stopTimes) {
    if (!index.has(stopTime.trip_id)) {
      index.set(stopTime.trip_id, new Map());
    }

    const stopSeqMap = index.get(stopTime.trip_id)!;
    if (!stopSeqMap.has(stopTime.stop_id)) {
      stopSeqMap.set(stopTime.stop_id, []);
    }
    stopSeqMap.get(stopTime.stop_id)!.push(stopTime.stop_sequence);
  }

  return index;
}

function getTripSequencesForStopSet(
  tripStopSeqMap: Map<string, number[]> | undefined,
  stopIds: ReadonlySet<string>
): number[] {
  if (!tripStopSeqMap) return [];

  const all: number[] = [];
  for (const stopId of stopIds) {
    const seqs = tripStopSeqMap.get(stopId);
    if (!seqs || seqs.length === 0) continue;
    all.push(...seqs);
  }
  return all;
}

function minForwardGap(fromSeqs: number[], toSeqs: number[]): number {
  let best = Number.POSITIVE_INFINITY;
  for (const fromSeq of fromSeqs) {
    for (const toSeq of toSeqs) {
      const gap = toSeq - fromSeq;
      if (gap > 0 && gap < best) best = gap;
    }
  }
  return best;
}

function minAnyGap(fromSeqs: number[], toSeqs: number[]): number {
  let best = Number.POSITIVE_INFINITY;
  for (const fromSeq of fromSeqs) {
    for (const toSeq of toSeqs) {
      const gap = Math.abs(toSeq - fromSeq);
      if (gap < best) best = gap;
    }
  }
  return best;
}

function pickBestSegmentTrip(
  trips: Trip[],
  routeIds: ReadonlySet<string>,
  fromStopIds: ReadonlySet<string>,
  toStopIds: ReadonlySet<string>,
  tripStopSeqIndex: TripStopSeqIndex,
  shapesMap?: Map<string, [number, number][]>
): SelectedGtfsRoute | null {
  const routeOrderById = new Map<string, number>();
  let routeOrder = 0;
  for (const trip of trips) {
    if (!routeIds.has(trip.route_id)) continue;
    if (routeOrderById.has(trip.route_id)) continue;
    routeOrderById.set(trip.route_id, routeOrder++);
  }

  type Candidate = {
    trip: Trip;
    hasForward: boolean;
    forwardGap: number;
    anyGap: number;
    routeOrder: number;
  };

  const candidates: Candidate[] = [];

  for (const trip of trips) {
    if (!routeIds.has(trip.route_id)) continue;
    if (!hasShape(trip, shapesMap)) continue;

    const tripStopSeqMap = tripStopSeqIndex.get(trip.trip_id);
    const fromSeqs = getTripSequencesForStopSet(tripStopSeqMap, fromStopIds);
    const toSeqs = getTripSequencesForStopSet(tripStopSeqMap, toStopIds);
    if (fromSeqs.length === 0 || toSeqs.length === 0) continue;

    const forwardGap = minForwardGap(fromSeqs, toSeqs);
    const anyGap = minAnyGap(fromSeqs, toSeqs);

    candidates.push({
      trip,
      hasForward: Number.isFinite(forwardGap),
      forwardGap,
      anyGap,
      routeOrder: routeOrderById.get(trip.route_id) ?? Number.POSITIVE_INFINITY,
    });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    if (a.hasForward !== b.hasForward) return a.hasForward ? -1 : 1;
    if (a.hasForward && b.hasForward && a.forwardGap !== b.forwardGap) {
      return a.forwardGap - b.forwardGap;
    }
    if (a.anyGap !== b.anyGap) return a.anyGap - b.anyGap;
    if (a.routeOrder !== b.routeOrder) return a.routeOrder - b.routeOrder;
    return a.trip.trip_id.localeCompare(b.trip.trip_id);
  });

  const selectedTrip = candidates[0].trip;
  return {
    trip_id: selectedTrip.trip_id,
    route_id: selectedTrip.route_id,
    shape_id: selectedTrip.shape_id,
  };
}

export function findTransferGtfsRoute({
  originStopId,
  destinationStopId,
  originStopName,
  destinationStopName,
  stopTimes,
  trips,
  stops,
  shapesMap,
}: FindTransferGtfsRouteParams): TransferRouteMatch | null {
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

  const originTripIds = new Set<string>();
  const destinationTripIds = new Set<string>();
  const originRouteIds = new Set<string>();
  const destinationRouteIds = new Set<string>();

  for (const stopTime of stopTimes) {
    if (originCandidateStopIds.has(stopTime.stop_id)) {
      originTripIds.add(stopTime.trip_id);
      const trip = tripsById.get(stopTime.trip_id);
      if (trip) originRouteIds.add(trip.route_id);
    }

    if (destinationCandidateStopIds.has(stopTime.stop_id)) {
      destinationTripIds.add(stopTime.trip_id);
      const trip = tripsById.get(stopTime.trip_id);
      if (trip) destinationRouteIds.add(trip.route_id);
    }
  }

  if (originRouteIds.size === 0 || destinationRouteIds.size === 0) return null;

  const originReachableStopIds = new Set<string>();
  const destinationReachableStopIds = new Set<string>();

  for (const stopTime of stopTimes) {
    const trip = tripsById.get(stopTime.trip_id);
    if (!trip) continue;

    if (originRouteIds.has(trip.route_id)) {
      originReachableStopIds.add(stopTime.stop_id);
    }
    if (destinationRouteIds.has(trip.route_id)) {
      destinationReachableStopIds.add(stopTime.stop_id);
    }
  }

  const tripStopSeqIndex = buildTripStopSeqIndex(stopTimes);

  for (const transferStopId of originReachableStopIds) {
    if (!destinationReachableStopIds.has(transferStopId)) continue;

    if (
      originCandidateStopIds.has(transferStopId) ||
      destinationCandidateStopIds.has(transferStopId)
    ) {
      continue;
    }

    const transferStopSet = new Set<string>([transferStopId]);

    const route1 = pickBestSegmentTrip(
      trips,
      originRouteIds,
      originCandidateStopIds,
      transferStopSet,
      tripStopSeqIndex,
      shapesMap
    );

    if (!route1) continue;

    const route2 = pickBestSegmentTrip(
      trips,
      destinationRouteIds,
      transferStopSet,
      destinationCandidateStopIds,
      tripStopSeqIndex,
      shapesMap
    );

    if (!route2) continue;

    return {
      transferStopId,
      route1,
      route2,
    };
  }

  return null;
}
