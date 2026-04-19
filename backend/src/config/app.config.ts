import { registerAs } from '@nestjs/config';

/**
 * Central application configuration.
 * All values come from environment variables with safe defaults.
 */
export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  /** Maximum walking distance (meters) accepted in a route plan */
  maxWalkingDistanceMeters: process.env.MAX_WALKING_DISTANCE_METERS
    ? Number(process.env.MAX_WALKING_DISTANCE_METERS)
    : 1500,
}));
