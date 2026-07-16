import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/zitadel-service";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const { sessionId, sessionToken } = await createSession(email);

    const verified = await verifyPassword(sessionId, password);
    if (!verified) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId,
      sessionToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    const message = err instanceof Error ? err.message : "Login failed";
    if (message.includes("user") && message.includes("not found")) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
