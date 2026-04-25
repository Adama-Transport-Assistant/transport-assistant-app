/**
 * Represents a single GTFS bus stop parsed from stops.txt
 */
export type Stop = {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
};
