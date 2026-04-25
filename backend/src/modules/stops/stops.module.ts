import { Module } from '@nestjs/common';
import { StopsService } from './stops.service';
import { StopsController } from './stops.controller';

@Module({
  controllers: [StopsController],
  providers: [StopsService],
})
export class StopsModule {}
