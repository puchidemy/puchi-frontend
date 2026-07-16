import { z } from 'zod';

const envSchema = z.object({
  // Public envs (available at build time)
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:8000'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Runtime-only configs (may not be available during build)
  ZITADEL_CLIENT_ID: z.string().optional(),
  ZITADEL_ISSUER: z.string().url().default('https://auth.puchi.io.vn'),
  ZITADEL_INTERNAL_URL: z.string().url().default('http://zitadel.puchi-auth.svc.cluster.local:8080'),
  ZITADEL_SERVICE_TOKEN: z.string().optional(),
  AUTH_URL: z.string().url().default('http://localhost:3000'),
  API_INTERNAL_URL: z.string().url().default('http://localhost:8000'),
});

const isServer = typeof window === 'undefined';

/** Validated env — some values may be undefined during build */
export const env = isServer ? envSchema.parse(process.env) : ({} as z.infer<typeof envSchema>);
export type Env = z.infer<typeof envSchema>;

/** Validates and returns a required env var, throws if missing at runtime */
export function requireSecret(key: 'ZITADEL_CLIENT_ID' | 'ZITADEL_SERVICE_TOKEN'): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}
