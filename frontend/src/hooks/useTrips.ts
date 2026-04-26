import { useState, useEffect } from 'react';
import type { Trip } from '../types/Route';
import { parseCsv } from '../utils/parseCsv';

interface UseTripsResult {
  trips: Trip[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches and parses GTFS trips from /data/trips.txt.
 * Only extracts route_id and shape_id.
 */
export function useTrips(): UseTripsResult {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTrips() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/data/trips.txt', { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch trips.txt (HTTP ${res.status})`);

        const text = await res.text();
        if (text.trimStart().startsWith('<!')) {
          throw new Error('trips.txt returned HTML — restart the dev server.');
        }

        const rows = parseCsv(text);
        const parsed: Trip[] = rows
          .filter((r) => r.route_id && r.shape_id)
          .map((r) => ({
            route_id: r.route_id,
            shape_id: r.shape_id,
          }));

        setTrips(parsed);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('useTrips:', msg);
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
    return () => controller.abort();
  }, []);

  return { trips, loading, error };
}
