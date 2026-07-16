import { NextRequest, NextResponse } from "next/server";

const ZITADEL_URL =
  process.env.ZITADEL_INTERNAL_URL ||
  "http://zitadel.puchi-auth.svc.cluster.local:8080";
const ZITADEL_SERVICE_TOKEN = process.env.ZITADEL_SERVICE_TOKEN!;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    const userRes = await fetch(
      `${ZITADEL_URL}/management/v1/global/users/_by_login_name?loginName=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
          Host: "auth.puchi.io.vn",
        },
      }
    );

    if (!userRes.ok) {
      return NextResponse.json({ success: true });
    }

    const userData = await userRes.json();

    const resetRes = await fetch(
      `${ZITADEL_URL}/v2beta/users/${userData.user.id}/password/reset`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
          Host: "auth.puchi.io.vn",
        },
        body: JSON.stringify({
          notifyType: 1,
          returnCode: false,
        }),
      }
    );

    if (!resetRes.ok) {
      console.error(
        "Password reset failed:",
        await resetRes.text()
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Password reset request failed" },
      { status: 500 }
    );
  }
}
