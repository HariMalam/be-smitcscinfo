import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASS: z.string(),
  ENABLE_CRONS: z.string(),
  SUPER_ADMIN_EMAIL: z.string(),
  SUPER_ADMIN_PASSWORD: z.string(),
  SUPER_ADMIN_NAME: z.string(),
  RUN_MIGRATIONS: z.string(),
  RUN_SEEDERS: z.string(),
});
