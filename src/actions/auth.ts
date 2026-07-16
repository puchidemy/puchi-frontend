"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const AUTH_API_URL = process.env.AUTH_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function logoutAction() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/");
    return;
  }

  // Call auth-service to revoke the session
  try {
    await fetch(`${AUTH_API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    // Proceed with redirect even if server request fails
  }

  redirect("/");
}
