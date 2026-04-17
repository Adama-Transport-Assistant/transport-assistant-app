import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { GtfsController } from './gtfs.controller';
import { GtfsService } from './gtfs.service';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [GtfsController],
  providers: [GtfsService],
  exports: [GtfsService],
})
export class GtfsModule {}
