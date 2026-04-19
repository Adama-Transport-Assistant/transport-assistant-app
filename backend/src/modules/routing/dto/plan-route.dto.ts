import { Type } from 'class-transformer';
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';

/**
 * Preference options that influence route ranking.
 * - fastest       → sort by totalTime (default)
 * - cheapest      → sort by totalCost (ETB)
 * - least-walking → sort by walkingDistance (meters)
 */
export enum RoutingPreference {
  FASTEST = 'fastest',
  CHEAPEST = 'cheapest',
  LEAST_WALKING = 'least-walking',
}

/**
 * Request body for POST /api/v1/routes/plan
 *
 * Example:
 * {
 *   "fromLat": 8.5400,
 *   "fromLon": 39.2700,
 *   "toLat":   8.5500,
 *   "toLon":   39.2800,
 *   "preference": "fastest"
 * }
 */
export class PlanRouteDto {
  /** Origin latitude */
  @IsNumber()
  @IsLatitude()
  @Type(() => Number)
  fromLat!: number;

  /** Origin longitude */
  @IsNumber()
  @IsLongitude()
  @Type(() => Number)
  fromLon!: number;

  /** Destination latitude */
  @IsNumber()
  @IsLatitude()
  @Type(() => Number)
  toLat!: number;

  /** Destination longitude */
  @IsNumber()
  @IsLongitude()
  @Type(() => Number)
  toLon!: number;

  /** Optional ISO 8601 departure datetime */
  @IsOptional()
  @IsDateString()
  dateTime?: string;

  /** How to rank returned itineraries — defaults to "fastest" */
  @IsOptional()
  @IsEnum(RoutingPreference)
  preference?: RoutingPreference;
}
