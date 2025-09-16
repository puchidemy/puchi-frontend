import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { routing } from "./i18n/routing";
import { localizedProtectedRoute } from "./constants/paths";

const intlMiddleware = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher(localizedProtectedRoute);

export default clerkMiddleware(
  async (auth, req) => {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    if (isProtectedRoute(req)) {
      req.headers.set("x-app-route", "true");
      await auth.protect();
      return NextResponse.next({ headers: req.headers });
    }

    return intlMiddleware(req);
  },
  { debug: process.env.NODE_ENV === "development" }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|webm|mp4|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt|xml|riv)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
