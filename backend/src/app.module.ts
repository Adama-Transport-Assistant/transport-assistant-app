import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { appConfig } from './config/app.config';
import { validationSchema } from './config/validation.schema';
import { GtfsModule } from './modules/gtfs/gtfs.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RoutingModule } from './modules/routing/routing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig],
      validationSchema,
    }),
    PrismaModule,
    HealthModule,
    GtfsModule,
    RoutingModule,
  ],
})
export class AppModule {}
