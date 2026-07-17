import { z } from 'zod';

const envSchema = z.object({
  // Public envs (available at build time)
  // Local: http://localhost:3000 (Next rewrites → core/learn/media)
  // Prod: https://api.puchi.io.vn
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  // Local: same origin as FE (Next rewrites → auth :8080). Prod: api gateway.
  NEXT_PUBLIC_AUTH_API_URL: z.string().url().default('http://localhost:3000'),

  // Server-side alias (layouts); prefer NEXT_PUBLIC_AUTH_API_URL
  AUTH_API_URL: z.string().url().default('http://localhost:3000'),

  // Runtime-only configs
  AUTH_URL: z.string().url().default('http://localhost:3000'),
  API_INTERNAL_URL: z.string().url().default('http://localhost:3000'),
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
