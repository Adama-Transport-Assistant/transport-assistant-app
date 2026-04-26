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
  route_id: string;
  shape_id: string;
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
