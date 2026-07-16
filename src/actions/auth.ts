"use server";

import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const appUrl = process.env.AUTH_URL || "https://puchi.io.vn";
  const req = new Request(appUrl, { headers: await headers() });
  const session = await getSession(req);

  // Redirect tới Auth.js signout -> clear cookies -> callback tới Zitadel end_session
  if (session?.idToken) {
    const zitadelUrl = new URL("https://auth.puchi.io.vn/oidc/v1/end_session");
    zitadelUrl.searchParams.set("id_token_hint", session.idToken);
    zitadelUrl.searchParams.set("post_logout_redirect_uri", appUrl);
    redirect(`/api/auth/signout?callbackUrl=${encodeURIComponent(zitadelUrl.toString())}`);
  }

  redirect("/api/auth/signout");
}
