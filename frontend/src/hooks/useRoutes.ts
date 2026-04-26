import { useState, useEffect } from 'react';
import type { Route } from '../types/Route';
import { parseCsv } from '../utils/parseCsv';

interface UseRoutesResult {
  routes: Route[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches and parses GTFS routes from /data/routes.txt
 */
export function useRoutes(): UseRoutesResult {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchRoutes() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/data/routes.txt', { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch routes.txt (HTTP ${res.status})`);

        const text = await res.text();
        if (text.trimStart().startsWith('<!')) {
          throw new Error('routes.txt returned HTML — restart the dev server.');
        }

        const rows = parseCsv(text);
        const parsed: Route[] = rows
          .filter((r) => r.route_id && r.route_short_name)
          .map((r) => ({
            route_id: r.route_id,
            route_short_name: r.route_short_name,
            route_long_name: r.route_long_name ?? '',
          }));

        setRoutes(parsed);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('useRoutes:', msg);
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchRoutes();
    return () => controller.abort();
  }, []);

  return { routes, loading, error };
}
