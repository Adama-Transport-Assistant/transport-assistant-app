import { useState, useEffect } from 'react';
import type { ShapePoint } from '../types/Route';
import { parseCsv } from '../utils/parseCsv';

interface UseShapesResult {
  /** Map from shape_id → sorted array of [lat, lon] */
  shapesMap: Map<string, [number, number][]>;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches and parses GTFS shapes from /data/shapes.txt.
 * Builds a Map<shape_id, [lat,lon][]> with points pre-sorted by sequence.
 *
 * shapes.txt is ~9MB so this can take a moment; we parse it once and
 * store in a Map for O(1) lookup by shape_id.
 */
export function useShapes(): UseShapesResult {
  const [shapesMap, setShapesMap] = useState<Map<string, [number, number][]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchShapes() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/data/shapes.txt', { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch shapes.txt (HTTP ${res.status})`);

        const text = await res.text();
        if (text.trimStart().startsWith('<!')) {
          throw new Error('shapes.txt returned HTML — restart the dev server.');
        }

        // Performance: manual parsing instead of generic parseCsv for 250k+ rows
        const lines = text.trim().split(/\r?\n/);
        const header = lines[0].split(',').map((h) => h.trim());
        const idIdx = header.indexOf('shape_id');
        const latIdx = header.indexOf('shape_pt_lat');
        const lonIdx = header.indexOf('shape_pt_lon');
        const seqIdx = header.indexOf('shape_pt_sequence');

        if (idIdx === -1 || latIdx === -1 || lonIdx === -1 || seqIdx === -1) {
          throw new Error('shapes.txt has unexpected columns: ' + header.join(','));
        }

        // Collect raw points grouped by shape_id
        const raw = new Map<string, ShapePoint[]>();

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          if (cols.length <= Math.max(idIdx, latIdx, lonIdx, seqIdx)) continue;

          const shapeId = cols[idIdx].trim();
          const lat = parseFloat(cols[latIdx]);
          const lon = parseFloat(cols[lonIdx]);
          const seq = parseInt(cols[seqIdx], 10);

          if (!shapeId || isNaN(lat) || isNaN(lon) || isNaN(seq)) continue;

          if (!raw.has(shapeId)) raw.set(shapeId, []);
          raw.get(shapeId)!.push({
            shape_id: shapeId,
            shape_pt_lat: lat,
            shape_pt_lon: lon,
            shape_pt_sequence: seq,
          });
        }

        // Sort each shape by sequence, then convert to [lat, lon][]
        const result = new Map<string, [number, number][]>();
        for (const [id, pts] of raw) {
          pts.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence);
          result.set(id, pts.map((p) => [p.shape_pt_lat, p.shape_pt_lon]));
        }

        setShapesMap(result);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('useShapes:', msg);
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchShapes();
    return () => controller.abort();
  }, []);

  return { shapesMap, loading, error };
}
