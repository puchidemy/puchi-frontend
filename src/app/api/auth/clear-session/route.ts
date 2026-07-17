import { cookies } from "next/headers";

const COOKIE_ACCESS_TOKEN = "access_token";
const COOKIE_SESSION_ACTIVE = "session_active";

/**
 * POST /api/auth/clear-session
 *
 * Clears the access_token and session_active cookies.
 * Called after logout to clean up SSR and proxy state.
 */
export async function POST() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_ACCESS_TOKEN, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  cookieStore.set(COOKIE_SESSION_ACTIVE, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return Response.json({ success: true });
}
