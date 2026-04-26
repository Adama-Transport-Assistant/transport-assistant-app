/**
 * Extracts the start and end points from a polyline path.
 * Returns null if the path is empty or invalid.
 */
export function getStartAndEndPoints(
  path: [number, number][] | null | undefined
): { start: [number, number]; end: [number, number] } | null {
  if (!path || path.length === 0) return null;

  return {
    start: path[0],
    end: path[path.length - 1],
  };
}
