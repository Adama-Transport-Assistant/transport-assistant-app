import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Wraps PrismaClient as a NestJS injectable service.
 * Handles connection lifecycle with the module system.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to database…');
    await this.$connect();
    this.logger.log('Database connected.');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
