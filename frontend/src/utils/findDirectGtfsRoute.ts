import type { StopTime, Trip } from '../types/Route';

export type SelectedGtfsRoute = {
  route_id: string;
  shape_id: string;
};

interface FindDirectGtfsRouteParams {
  originStopId: string;
  destinationStopId: string;
  stopTimes: StopTime[];
  trips: Trip[];
  shapesMap?: Map<string, [number, number][]>;
}

type TripStopSequenceWindow = {
  originMinSeq: number | null;
  destinationMaxSeq: number | null;
};

/**
 * Finds a direct GTFS route (trip) that serves both origin and destination
 * with the origin appearing before the destination.
 *
 * Matching flow:
 * 1) Find trip_ids containing both stop_ids in stop_times.
 * 2) Keep only trips where origin stop_sequence < destination stop_sequence.
 * 3) Resolve route_id + shape_id from trips.
 * 4) Optionally require shape points to exist in shapesMap.
 */
export function findDirectGtfsRoute({
  originStopId,
  destinationStopId,
  stopTimes,
  trips,
  shapesMap,
}: FindDirectGtfsRouteParams): SelectedGtfsRoute | null {
  if (!originStopId || !destinationStopId) return null;

  const tripStopWindow = new Map<string, TripStopSequenceWindow>();

  for (const stopTime of stopTimes) {
    if (stopTime.stop_id !== originStopId && stopTime.stop_id !== destinationStopId) {
      continue;
    }

    const current = tripStopWindow.get(stopTime.trip_id) ?? {
      originMinSeq: null,
      destinationMaxSeq: null,
    };

    if (stopTime.stop_id === originStopId) {
      current.originMinSeq =
        current.originMinSeq === null
          ? stopTime.stop_sequence
          : Math.min(current.originMinSeq, stopTime.stop_sequence);
    }

    if (stopTime.stop_id === destinationStopId) {
      current.destinationMaxSeq =
        current.destinationMaxSeq === null
          ? stopTime.stop_sequence
          : Math.max(current.destinationMaxSeq, stopTime.stop_sequence);
    }

    tripStopWindow.set(stopTime.trip_id, current);
  }

  const tripsById = new Map<string, Trip>();
  for (const trip of trips) {
    tripsById.set(trip.trip_id, trip);
  }

  for (const [tripId, window] of tripStopWindow) {
    if (window.originMinSeq === null || window.destinationMaxSeq === null) continue;
    if (window.originMinSeq >= window.destinationMaxSeq) continue;

    const trip = tripsById.get(tripId);
    if (!trip) continue;

    if (shapesMap && !shapesMap.has(trip.shape_id)) continue;

    return {
      route_id: trip.route_id,
      shape_id: trip.shape_id,
    };
  }

  return null;
}
