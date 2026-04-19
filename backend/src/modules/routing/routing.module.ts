import { Module } from '@nestjs/common';

import { RoutingController } from './routing.controller';
import { RoutingService } from './routing.service';

/**
 * RoutingModule — core feature module.
 * Provides route planning logic via mock data (no external services needed for MVP).
 */
@Module({
  controllers: [RoutingController],
  providers: [RoutingService],
  exports: [RoutingService],
})
export class RoutingModule {}
