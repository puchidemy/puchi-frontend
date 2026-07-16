// src/app/api/auth/link-account/[provider]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ensureSupertokensInit } from "@/config/supertokens-server";
import { getSession } from "supertokens-node/recipe/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  ensureSupertokensInit();
  const { provider } = await params;

  try {
    // Verify user is authenticated
    await getSession(request, NextResponse.next());

    const { getAuthorisationURL } = await import("supertokens-node/recipe/thirdparty");
    const url = await getAuthorisationURL({
      thirdPartyId: provider,
      redirectURIOnProviderDashboard: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback/${provider}?mode=link`,
    });

    return NextResponse.redirect(url);
  } catch (err) {
    console.error("Failed to generate link URL:", err);
    return NextResponse.json(
      { error: "Not authenticated or failed to initiate linking" },
      { status: 401 },
    );
  }
}
