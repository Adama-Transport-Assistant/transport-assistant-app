import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(4000),
  DATABASE_URL: Joi.string().uri().required(),
  OTP_BASE_URL: Joi.string().uri().required(),
  GTFS_URL: Joi.string().uri().required(),
  GTFS_DOWNLOAD_PATH: Joi.string().required(),
  MAX_WALKING_DISTANCE_METERS: Joi.number().positive().default(1500),
});
