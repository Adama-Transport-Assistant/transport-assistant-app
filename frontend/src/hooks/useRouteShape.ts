import { useMemo } from 'react';
import type { Trip } from '../types/Route';

/**
 * Given a route_id, trips list, and shapes map, resolves the polyline
 * coordinates for that route.
 *
 * Logic:
 *   route_id → find matching trip → get shape_id → lookup in shapesMap
 */
export function useRouteShape(
  routeId: string | null,
  trips: Trip[],
  shapesMap: Map<string, [number, number][]>
): [number, number][] | null {
  return useMemo(() => {
    if (!routeId || trips.length === 0 || shapesMap.size === 0) return null;

    // Find the first trip with this route_id
    const trip = trips.find((t) => t.route_id === routeId);
    if (!trip) return null;

    // Get shape points for this trip's shape_id
    const points = shapesMap.get(trip.shape_id);
    return points ?? null;
  }, [routeId, trips, shapesMap]);
}
