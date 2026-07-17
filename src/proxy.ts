import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { localizedProtectedRoute } from "./constants/paths";

const intlMiddleware = createMiddleware(routing);

export async function proxy(req: NextRequest) {
  const url = new URL(req.url);

  if (url.pathname.startsWith("/_next")) {
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
    "/((?!_next|api|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|webm|mp4|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt|xml|riv)).*)",
  ],
};
