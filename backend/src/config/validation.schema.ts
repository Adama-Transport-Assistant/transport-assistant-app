import * as Joi from 'joi';

/**
 * Joi validation schema for environment variables.
 * The app will refuse to start if required variables are missing or invalid.
 */
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  PORT: Joi.number().port().default(4000),

  DATABASE_URL: Joi.string().uri().required(),

  MAX_WALKING_DISTANCE_METERS: Joi.number().positive().default(1500),
});
