import { cookies } from "next/headers";

const COOKIE_ACCESS_TOKEN = "access_token";
const COOKIE_SESSION_ACTIVE = "session_active";

/**
 * POST /api/auth/set-session
 *
 * Receives an access_token from the client (in-memory) and sets two cookies
 * on the puchi.io.vn domain so Server Components, Server Actions, and the
 * Proxy middleware can participate in the auth flow.
 *
 * Body: { access_token: string }
 *
 * Cookies set:
 * 1. "access_token" (HttpOnly, Secure, SameSite=Lax) — for SSR auth
 * 2. "session_active" (non-HttpOnly, Secure, SameSite=Lax) — for proxy redirect
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();

  try {
    const body = await request.json();
    const { access_token } = body;

    if (!access_token || typeof access_token !== "string") {
      return Response.json(
        { error: "access_token is required" },
        { status: 400 },
      );
    }

    const isProduction = process.env.NODE_ENV === "production";

    // HttpOnly cookie for Server Components / Server Actions
    cookieStore.set(COOKIE_ACCESS_TOKEN, access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15, // 15 minutes — matches access_token TTL
    });

    // Non-HttpOnly cookie for proxy middleware
    cookieStore.set(COOKIE_SESSION_ACTIVE, "1", {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15, // 15 minutes
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "invalid request body" }, { status: 400 });
  }
}
