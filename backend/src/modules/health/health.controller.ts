import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const otpBaseUrl = this.configService.get<string>('app.otpBaseUrl', {
      infer: true,
    }) as string;

    return this.health.check([
      () => this.http.pingCheck('otp', `${otpBaseUrl}/actuator/health`),
    ]);
  }

  @Get('live')
  liveness() {
    return {
      status: 'ok',
      service: 'transport-assistant-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
