import { Logger } from '@nestjs/common';

const REQUIRED = ['JWT_SECRET', 'DATABASE_HOST', 'DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_NAME'] as const;

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const missing = REQUIRED.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const secret = String(config.JWT_SECRET);
  if (config.NODE_ENV === 'production' && secret.length < 32) {
    new Logger('Config').warn('JWT_SECRET is shorter than 32 characters; use a long random value in production.');
  }

  return config;
}
