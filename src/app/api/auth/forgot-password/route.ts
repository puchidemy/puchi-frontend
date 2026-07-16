import { NextRequest, NextResponse } from "next/server";
import { zitadelFetch } from "@/lib/zitadel-service";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    const userRes = await zitadelFetch(
      `/management/v1/global/users/_by_login_name?loginName=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ZITADEL_SERVICE_TOKEN!}`,
        },
      }
    );

    if (!userRes.ok) {
      return NextResponse.json({ success: true });
    }

    const userData = await userRes.json();

    const resetRes = await zitadelFetch(
      `/v2beta/users/${userData.user.id}/password/reset`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ZITADEL_SERVICE_TOKEN!}`,
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
