import { Body, Controller, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';

import { PlanRouteDto } from './dto/plan-route.dto';
import { RoutePreferenceQueryDto } from './dto/route-preference-query.dto';
import { RoutingService } from './routing.service';

/**
 * RoutingController
 *
 * Mounted at /api/routes (appended to the global prefix /api in main.ts)
 * Full URL: POST /api/routes/plan
 *
 * Accepts origin + destination coordinates and an optional preference flag,
 * returns 3–4 ordered route options for Adama city.
 */
@Controller('routes')
export class RoutingController {
  constructor(private readonly routingService: RoutingService) {}

  /**
   * POST /api/routes/plan?preference=fastest|cheapest|least-walking
   *
   * Body: PlanRouteDto
   * Returns ranked route itineraries based on the requested preference.
   */
  @Post('plan')
  @HttpCode(HttpStatus.OK)
  plan(@Body() body: PlanRouteDto, @Query() query: RoutePreferenceQueryDto) {
    return this.routingService.planRoute({
      ...body,
      preference: query.preference ?? body.preference,
    });
  }
}
