import { z } from 'zod';

const envSchema = z.object({
  // Public envs (available at build time)
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:8000'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Auth API URL — points to the auth-service directly
  // Dev: http://localhost:8080, Prod: https://api.puchi.io.vn
  AUTH_API_URL: z.string().url().default('http://localhost:8080'),

  // Runtime-only configs
  AUTH_URL: z.string().url().default('http://localhost:3000'),
  API_INTERNAL_URL: z.string().url().default('http://localhost:8000'),
});

const isServer = typeof window === 'undefined';

/** Validated env — some values may be undefined during build */
export const env = isServer ? envSchema.parse(process.env) : ({} as z.infer<typeof envSchema>);
export type Env = z.infer<typeof envSchema>;

/** Validates and returns a required env var, throws if missing at runtime */
export function requireSecret(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}
