"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const AUTH_API_URL = process.env.AUTH_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function logoutAction() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  // Call auth-service to revoke the session (best-effort)
  if (accessToken) {
    try {
      await fetch(`${AUTH_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch {
      // Proceed with redirect even if server request fails
    }
  }

  // Clear SSR cookies on the puchi.io.vn domain
  const isProduction = process.env.NODE_ENV === "production";
  cookieStore.set("access_token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  cookieStore.set("session_active", "", {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  redirect("/");
}
