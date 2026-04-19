import { Controller } from '@nestjs/common';
import { StopsService } from './stops.service';

@Controller('api/stops')
export class StopsController {
  constructor(private readonly stopsService: StopsService) {}
}
