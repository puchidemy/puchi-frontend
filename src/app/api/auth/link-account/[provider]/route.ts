// src/app/api/auth/link-account/[provider]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ensureSupertokensInit } from "@/config/supertokens-server";
import { getSession } from "supertokens-node/recipe/session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  ensureSupertokensInit();
  const { provider } = await params;

  try {
    // Get Supertokens OAuth URL for this provider
    const { getAuthorisationURL } = await import("supertokens-node/recipe/thirdparty");
    const url = await getAuthorisationURL({
      thirdPartyId: provider,
      redirectURIOnProviderDashboard: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback/${provider}?mode=link`,
    });

    return NextResponse.redirect(url);
  } catch (err) {
    console.error("Failed to generate link URL:", err);
    return NextResponse.json(
      { error: "Failed to initiate account linking" },
      { status: 500 }
    );
  }
}
