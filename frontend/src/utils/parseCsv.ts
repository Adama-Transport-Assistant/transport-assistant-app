/**
 * Generic CSV parser: takes raw CSV text and returns an array of objects
 * keyed by header column names.
 *
 * Handles Windows (\r\n) and Unix (\n) line endings.
 * Skips empty lines.
 */
export function parseCsv(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(',');
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (cols[j] ?? '').trim();
    }
    rows.push(row);
  }

  return rows;
}
