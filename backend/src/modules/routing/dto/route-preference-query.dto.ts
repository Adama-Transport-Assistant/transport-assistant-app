import { IsEnum, IsOptional } from 'class-validator';

import { RoutingPreference } from './plan-route.dto';

/**
 * Optional query parameters for route planning endpoint.
 * Example: /api/routes/plan?preference=cheapest
 */
export class RoutePreferenceQueryDto {
  @IsOptional()
  @IsEnum(RoutingPreference)
  preference?: RoutingPreference;
}
