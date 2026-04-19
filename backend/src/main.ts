import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    // Built-in CORS — restrict origins in production via env var
    cors: {
      origin: process.env.CORS_ORIGIN ?? '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
  });

  const logger = new Logger('Bootstrap');

  // ── Global route prefix ─────────────────────────────────────────────────
  // All routes become /api/<controller>
  app.setGlobalPrefix('api');

  // ── Global validation pipe ──────────────────────────────────────────────
  // Strips unknown fields, auto-transforms primitives, throws on bad input
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global exception filter ─────────────────────────────────────────────
  // Converts all errors into a consistent JSON envelope
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);

  logger.log(`Adama Transport Backend running on http://localhost:${port}/api`);
  logger.log(`Health check -> http://localhost:${port}/api/health`);
  logger.log(`Plan a route -> POST http://localhost:${port}/api/routes/plan?preference=fastest`);
}

void bootstrap();
