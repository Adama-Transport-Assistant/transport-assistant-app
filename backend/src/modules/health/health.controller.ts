import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Health check endpoints.
 * GET /api/health       — full check (DB connectivity)
 * GET /api/health/live  — simple liveness probe (no deps)
 */
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    // Lightweight DB probe — verifies Prisma can talk to Postgres
    let dbStatus: 'ok' | 'error' = 'ok';
    let dbMessage: string | undefined;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (err: unknown) {
      dbStatus = 'error';
      dbMessage = err instanceof Error ? err.message : 'Unknown DB error';
    }

    const overall = dbStatus === 'ok' ? 'ok' : 'degraded';

    return {
      status: overall,
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: dbStatus, ...(dbMessage ? { message: dbMessage } : {}) },
      },
    };
  }

  @Get('live')
  liveness() {
    return {
      status: 'ok',
      service: 'adama-transport-assistant-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
