import { NextRequest, NextResponse } from "next/server";
import { requireSecret } from "@/config/env";

/**
 * Zitadel V2 Login redirects here after external IDP authentication.
 * 
 * Flow:
 * 1. Browser redirected to authUrl -> Zitadel -> External provider
 * 2. External provider redirects to Zitadel's /idps/callback (internal)
 * 3. Zitadel processes auth, sets session cookie in browser, redirects to {customLoginUIUrl}/idps/callback
 * 4. This handler receives the callback with idpIntentId + token
 * 5. We redirect to Zitadel OIDC authorize with prompt=none
 * 6. Zitadel sees the session cookie, issues authorization code
 * 7. NextAuth callback exchanges code for JWT session
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idpIntentId = searchParams.get("idpIntentId");
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  // Missing params — redirect to sign-in
  if (!idpIntentId || !token) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  // If user exists (was found or auto-created by Zitadel),
  // redirect through OIDC authorize with prompt=none
  // Zitadel will detect the session cookie and issue a code for NextAuth
  if (userId) {
    const issuerUrl = process.env.ZITADEL_ISSUER || "https://auth.puchi.io.vn";
    const clientId = requireSecret("ZITADEL_CLIENT_ID");
    const redirectUri = `${process.env.AUTH_URL || "http://localhost:3000"}/api/auth/callback/zitadel`;

    const authorizeUrl = new URL(`${issuerUrl}/oauth/v2/authorize`);
    authorizeUrl.searchParams.set("client_id", clientId);
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("scope", "openid email profile");
    authorizeUrl.searchParams.set("prompt", "none");

    return NextResponse.redirect(authorizeUrl);
  }

  // No userId — user not found/created in Zitadel (isAutoCreation likely false)
  // Store IDP intent info and redirect to sign-up
  const signUpUrl = new URL("/auth/sign-up", request.url);
  signUpUrl.searchParams.set("idpIntentId", idpIntentId);
  signUpUrl.searchParams.set("idpToken", token);
  return NextResponse.redirect(signUpUrl);
}
