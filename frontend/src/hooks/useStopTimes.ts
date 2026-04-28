import { useEffect, useState } from 'react';
import type { StopTime } from '../types/Route';
import { parseCsv } from '../utils/parseCsv';

interface UseStopTimesResult {
    stopTimes: StopTime[];
    loading: boolean;
    error: string | null;
}

/**
 * Fetches and parses GTFS stop_times from /data/stop_times.txt.
 */
export function useStopTimes(): UseStopTimesResult {
    const [stopTimes, setStopTimes] = useState<StopTime[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchStopTimes() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch('/data/stop_times.txt', { signal: controller.signal });
                if (!res.ok) throw new Error(`Failed to fetch stop_times.txt (HTTP ${res.status})`);

                const text = await res.text();
                if (text.trimStart().startsWith('<!')) {
                    throw new Error('stop_times.txt returned HTML — restart the dev server.');
                }

                const rows = parseCsv(text);
                const parsed: StopTime[] = rows
                    .filter((r) => r.trip_id && r.stop_id && r.stop_sequence && r.arrival_time && r.departure_time)
                    .map((r) => ({
                        trip_id: r.trip_id,
                        stop_id: r.stop_id,
                        stop_sequence: parseInt(r.stop_sequence, 10),
                        arrival_time: r.arrival_time,
                        departure_time: r.departure_time,
                    }))
                    .filter((r) => Number.isFinite(r.stop_sequence));

                setStopTimes(parsed);
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                const msg = err instanceof Error ? err.message : 'Unknown error';
                console.error('useStopTimes:', msg);
                setError(msg);
            } finally {
                setLoading(false);
            }
        }

        fetchStopTimes();
        return () => controller.abort();
    }, []);

    return { stopTimes, loading, error };
}
