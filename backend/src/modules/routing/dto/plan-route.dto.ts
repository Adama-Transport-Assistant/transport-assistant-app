import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum RoutingPreference {
  FASTEST = 'fastest',
  CHEAPEST = 'cheapest',
  LEAST_WALKING = 'least_walking',
}

export class PlanRouteDto {
  @IsLatitude()
  fromLat!: number;

  @IsLongitude()
  fromLon!: number;

  @IsLatitude()
  toLat!: number;

  @IsLongitude()
  toLon!: number;

  @IsOptional()
  @IsDateString()
  dateTime?: string;

  @IsOptional()
  @IsEnum(RoutingPreference)
  preference?: RoutingPreference;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @Min(1)
  @Max(6)
  numItineraries?: number;

  @IsOptional()
  @IsString()
  locale?: string;
}
