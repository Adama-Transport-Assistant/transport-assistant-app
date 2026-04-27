/**
 * GTFS Route parsed from routes.txt
 */
export type Route = {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
};

/**
 * GTFS Trip parsed from trips.txt
 * We only extract what we need: route_id → shape_id mapping
 */
export type Trip = {
  trip_id: string;
  route_id: string;
  shape_id: string;
};

/**
 * Minimal stop_times record used for direct trip matching
 */
export type StopTime = {
  trip_id: string;
  stop_id: string;
  stop_sequence: number;
};

/**
 * A single coordinate in a GTFS shape, parsed from shapes.txt
 */
export type ShapePoint = {
  shape_id: string;
  shape_pt_lat: number;
  shape_pt_lon: number;
  shape_pt_sequence: number;
};
