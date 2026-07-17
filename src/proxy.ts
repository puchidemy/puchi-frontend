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

  const isProtected = localizedProtectedRoute.some((route) => {
    const pattern = route.replace("/:locale", "");
    return url.pathname.includes(pattern);
  });

  if (isProtected) {
    // Check the session_active indicator cookie set by the Route Handler.
    // This is on the same domain (puchi.io.vn), unlike the refresh_token cookie
    // which lives on api.puchi.io.vn (set by auth-service).
    const sessionActive = req.cookies.get("session_active");
    if (!sessionActive) {
      const signInUrl = new URL("/auth/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/((?!_next|api|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|webm|mp4|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt|xml|riv)).*)",
  ],
};
