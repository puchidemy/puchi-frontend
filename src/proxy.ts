import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { ensureSupertokensInit } from "@/config/supertokens-server";
import { getSession } from "supertokens-node/recipe/session";
import { routing } from "@/i18n/routing";
import { localizedProtectedRoute } from "./constants/paths";

ensureSupertokensInit();

const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);

  if (
    url.pathname.startsWith("/api/auth") ||
    url.pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  const isProtected = localizedProtectedRoute.some((route) => {
    const pattern = route.replace("/:locale", "");
    return url.pathname.includes(pattern);
  });

  if (isProtected) {
    try {
      const session = await getSession(req, new NextResponse());
      if (!session) {
        const signInUrl = new URL("/auth/sign-in", req.url);
        return NextResponse.redirect(signInUrl);
      }
    } catch {
      const signInUrl = new URL("/auth/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|webm|mp4|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt|xml|riv)).*)",
    "/(api|trpc)(.*)",
  ],
};
