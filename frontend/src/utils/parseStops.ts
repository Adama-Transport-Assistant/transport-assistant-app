import type { Stop } from '../types/Stop';

/**
 * Parses a GTFS stops.txt CSV string into an array of Stop objects.
 *
 * Expected CSV headers:
 *   stop_id, parent_station, stop_lon, stop_name, stop_lat, location_type
 *
 * - Skips the header row
 * - Skips rows with invalid/missing lat/lng
 * - Handles Windows (\r\n) and Unix (\n) line endings
 */
export function parseStops(csvText: string): Stop[] {
  const lines = csvText.trim().split(/\r?\n/);

  if (lines.length < 2) return []; // Header only or empty

  const header = lines[0].split(',').map((h) => h.trim());

  // Find column indices dynamically so we don't break if column order changes
  const idIdx = header.indexOf('stop_id');
  const nameIdx = header.indexOf('stop_name');
  const latIdx = header.indexOf('stop_lat');
  const lonIdx = header.indexOf('stop_lon');

  // Validate that all required columns exist
  if (idIdx === -1 || nameIdx === -1 || latIdx === -1 || lonIdx === -1) {
    console.error('parseStops: Missing required columns in stops.txt header:', header);
    return [];
  }

  const stops: Stop[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');

    // Skip malformed rows
    if (cols.length <= Math.max(idIdx, nameIdx, latIdx, lonIdx)) continue;

    const lat = parseFloat(cols[latIdx]);
    const lon = parseFloat(cols[lonIdx]);

    // Skip rows with invalid coordinates
    if (isNaN(lat) || isNaN(lon) || !isFinite(lat) || !isFinite(lon)) continue;

    stops.push({
      stop_id: cols[idIdx].trim(),
      stop_name: cols[nameIdx].trim(),
      stop_lat: lat,
      stop_lon: lon,
    });
  }

  return stops;
}
