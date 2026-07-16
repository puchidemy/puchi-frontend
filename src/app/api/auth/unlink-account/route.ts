// src/app/api/auth/unlink-account/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ensureSupertokensInit } from "@/config/supertokens-server";
import supertokens from "supertokens-node";
import { getSession } from "supertokens-node/recipe/session";

export async function POST(request: NextRequest) {
  ensureSupertokensInit();

  try {
    const session = await getSession(request, NextResponse.next());
    const userId = session.getUserId();
    const { providerUserId } = await request.json();

    if (!providerUserId) {
      return NextResponse.json(
        { error: "providerUserId is required" },
        { status: 400 }
      );
    }

    // Unlink the account
    await supertokens.removeAccountLinking(userId, providerUserId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to unlink account:", err);
    return NextResponse.json(
      { error: "Failed to unlink account" },
      { status: 500 }
    );
  }
}
