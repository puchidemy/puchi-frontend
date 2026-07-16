import { NextRequest, NextResponse } from "next/server";
import { zitadelFetch } from "@/lib/zitadel-service";

export async function POST(request: NextRequest) {
  try {
    const { userId, code, password } = await request.json();
    if (!userId || !code || !password) {
      return NextResponse.json(
        { error: "userId, code, and password required" },
        { status: 400 }
      );
    }

    const res = await zitadelFetch(`/v2beta/users/${userId}/password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ZITADEL_SERVICE_TOKEN!}`,
      },
      body: JSON.stringify({
        newPassword: { password, changeRequired: false },
        verificationCode: code,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Password reset failed: ${text}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Password reset failed" },
      { status: 500 }
    );
  }
}
