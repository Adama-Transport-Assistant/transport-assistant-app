import { Controller, Get } from '@nestjs/common';

@Controller('stops')
export class StopsController {
  @Get()
  getStopsInfo() {
    return {
      message: 'Stops module is ready. Stop listing endpoints will be added in the next iteration.',
    };
  }
}
