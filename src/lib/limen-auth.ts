"client-only";

import { createAuthClient } from "limen-auth/react";
import {
  bearerPlugin,
  credentialPasswordPlugin,
  oauthClientPlugin,
} from "limen-auth/plugins";

// Local: same origin as FE (Next rewrite → auth). Prod: api gateway.
const baseURL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

type UserFields = {
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

const plugins = [
  credentialPasswordPlugin(),
  oauthClientPlugin(),
  bearerPlugin(),
] as const;

export const authClient = createAuthClient<typeof plugins, UserFields>({
  baseURL,
  basePath: "/auth",
  plugins,
  parseSession: (raw) => {
    const body = raw as { user?: Record<string, unknown>; token?: string };
    const u = (body.user ?? raw) as Record<string, unknown>;
    const token =
      typeof body.token === "string" && body.token.trim() !== ""
        ? body.token.trim()
        : undefined;
    return {
      user: {
        id: String(u.id ?? ""),
        email: String(u.email ?? ""),
        emailVerifiedAt:
          (u.email_verified_at as string | null | undefined) ??
          (u.emailVerifiedAt as string | null | undefined) ??
          null,
        username: (u.username as string | null | undefined) ?? null,
        firstName:
          (u.first_name as string | null | undefined) ??
          (u.firstName as string | null | undefined) ??
          null,
        lastName:
          (u.last_name as string | null | undefined) ??
          (u.lastName as string | null | undefined) ??
          null,
      },
      // Exposed so AuthProvider can sync Bearer for Go APIs (cookie is HttpOnly).
      ...(token ? { token } : {}),
    };
  },
});

export { baseURL as API_URL };
