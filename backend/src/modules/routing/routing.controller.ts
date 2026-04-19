import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { PlanRouteDto } from './dto/plan-route.dto';
import { RoutingService } from './routing.service';

/**
 * RoutingController
 *
 * Mounted at /api/routes (appended to the global prefix /api/v1 in main.ts)
 * Full URL: POST /api/v1/routes/plan
 *
 * Accepts origin + destination coordinates and an optional preference flag,
 * returns 3–4 ordered route options for Adama city.
 */
@Controller('routes')
export class RoutingController {
  constructor(private readonly routingService: RoutingService) {}

  /**
   * POST /api/v1/routes/plan
   *
   * Body: PlanRouteDto
   * Returns ranked route itineraries based on the requested preference.
   */
  @Post('plan')
  @HttpCode(HttpStatus.OK)
  plan(@Body() body: PlanRouteDto) {
    return this.routingService.planRoute(body);
  }
}
