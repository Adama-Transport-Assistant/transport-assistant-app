import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  otpBaseUrl: process.env.OTP_BASE_URL ?? 'http://localhost:8080/otp',
  gtfsUrl:
    process.env.GTFS_URL ??
    'https://raw.githubusercontent.com/AddisMap/AddisMapTransit-gtfs/main/et-addisababa.zip',
  gtfsDownloadPath: process.env.GTFS_DOWNLOAD_PATH ?? '/tmp/gtfs.zip',
  maxWalkingDistanceMeters: process.env.MAX_WALKING_DISTANCE_METERS
    ? Number(process.env.MAX_WALKING_DISTANCE_METERS)
    : 1500,
}));
