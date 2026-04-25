import { useState, useEffect } from 'react';
import type { Stop } from '../types/Stop';
import { parseStops } from '../utils/parseStops';

interface UseStopsResult {
  stops: Stop[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches and parses GTFS stops from /data/stops.txt
 * Returns { stops, loading, error }
 */
export function useStops(): UseStopsResult {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStops() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/data/stops.txt', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch stops.txt (HTTP ${response.status})`);
        }

        const csvText = await response.text();
        const parsed = parseStops(csvText);

        if (parsed.length === 0) {
          throw new Error('No valid stops found in stops.txt');
        }

        setStops(parsed);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Unknown error loading stops';
        console.error('useStops:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchStops();

    return () => controller.abort();
  }, []);

  return { stops, loading, error };
}
