"use server";

import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const appUrl = process.env.AUTH_URL || "https://puchi.io.vn";
  const req = new Request(appUrl, { headers: await headers() });
  const session = await getSession(req);

  if (!session) {
    redirect("/");
    return;
  }

  // Redirect to Auth.js signout — clears the JWT cookie
  // No Zitadel end_session redirect chain needed
  redirect("/api/auth/signout");
}
