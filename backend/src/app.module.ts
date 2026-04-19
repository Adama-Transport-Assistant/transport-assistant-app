import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { appConfig } from './config/app.config';
import { validationSchema } from './config/validation.schema';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RoutingModule } from './modules/routing/routing.module';
import { StopsModule } from './modules/stops/stops.module';

/**
 * Root application module.
 * Composes all feature modules and wires global config + validation.
 */
@Module({
  imports: [
    // ── Configuration (global) ───────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig],
      validationSchema,
    }),

    // ── Core modules ──────────────────────────────────────────────────────
    PrismaModule,

    // ── Feature modules ───────────────────────────────────────────────────
    HealthModule,
    RoutingModule,
    StopsModule,
  ],
})
export class AppModule {}
