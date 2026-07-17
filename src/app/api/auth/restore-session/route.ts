import { cookies } from "next/headers";

/**
 * GET /api/auth/restore-session
 *
 * Reads the HttpOnly access_token cookie and returns it.
 * Called by AuthProvider on page load to restore the in-memory token
 * that was lost during full page navigation / reload.
 *
 * Response:
 *   200: { access_token: string }
 *   200: { access_token: null } — no session cookie
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value ?? null;

  return Response.json({ access_token: token });
}
