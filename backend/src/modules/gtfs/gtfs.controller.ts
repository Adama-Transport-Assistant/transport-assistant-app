import { Controller, Get, Post } from '@nestjs/common';

import { GtfsService } from './gtfs.service';

@Controller('gtfs')
export class GtfsController {
  constructor(private readonly gtfsService: GtfsService) {}

  @Post('import')
  async importLatest() {
    return this.gtfsService.importLatestGtfs();
  }

  @Get('summary')
  async summary() {
    return this.gtfsService.getSummary();
  }
}
