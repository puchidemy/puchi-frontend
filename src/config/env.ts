import { z } from 'zod';

const envSchema = z.object({
  ZITADEL_CLIENT_ID: z.string().min(1),
  ZITADEL_ISSUER: z.string().url().default('https://auth.puchi.io.vn'),
  ZITADEL_INTERNAL_URL: z.string().url().default('http://zitadel.puchi-auth.svc.cluster.local:8080'),
  ZITADEL_SERVICE_TOKEN: z.string().min(1),
  AUTH_URL: z.string().url().default('http://localhost:3000'),
  API_INTERNAL_URL: z.string().url().default('http://localhost:8000'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:8000'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

const isServer = typeof window === 'undefined';
export const env = isServer ? envSchema.parse(process.env) : ({} as z.infer<typeof envSchema>);
export type Env = z.infer<typeof envSchema>;
