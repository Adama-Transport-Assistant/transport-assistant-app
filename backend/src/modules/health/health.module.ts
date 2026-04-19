import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { HealthController } from './health.controller';

/**
 * HealthModule exposes lightweight liveness & readiness endpoints.
 * Depends on PrismaModule (global) to run a DB connectivity check.
 */
@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
})
export class HealthModule {}
