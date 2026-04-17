import { Controller, Get, Query } from '@nestjs/common';

import { PlanRouteDto } from './dto/plan-route.dto';
import { RoutingService } from './routing.service';

@Controller('routing')
export class RoutingController {
  constructor(private readonly routingService: RoutingService) {}

  @Get('plan')
  async plan(@Query() query: PlanRouteDto) {
    return this.routingService.planRoute(query);
  }
}
