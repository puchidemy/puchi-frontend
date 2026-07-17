import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

/** Limen / Go API paths — skip next-intl. FE pages under /auth/* must NOT match. */
function isApiProxyPath(pathname: string): boolean {
  if (pathname === "/v1" || pathname.startsWith("/v1/")) return true;
  if (pathname === "/notification" || pathname.startsWith("/notification/")) {
    return true;
  }
  if (pathname === "/media" || pathname.startsWith("/media/")) return true;

  if (pathname === "/auth/me" || pathname === "/auth/signout") return true;
  const limenPrefixes = [
    "/auth/oauth/",
    "/auth/signin/",
    "/auth/signup/",
    "/auth/passwords/",
    "/auth/social/",
    "/auth/internal/",
  ];
  return limenPrefixes.some((p) => pathname.startsWith(p));
}

export async function proxy(req: NextRequest) {
  const url = new URL(req.url);

  if (url.pathname.startsWith("/_next") || isApiProxyPath(url.pathname)) {
    return NextResponse.next();
  }

  // Guest mode: protected routes are allowed for all users.
  // The UI will show sign-in prompts for guest users when they try to save progress.
  // The session_active cookie check is removed to enable guest access.
  // This redirect is now only used as a fallback — most auth gating is client-side.

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Skip next-intl only for /v1 and other non-page API prefixes.
    // /auth/* FE pages (continue, sign-in, …) must run intl → /en/auth/…
    "/((?!_next|api(?:/|$)|v1(?:/|$)|notification(?:/|$)|media(?:/|$)|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|webm|mp4|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt|xml|riv)).*)",
  ],
};
