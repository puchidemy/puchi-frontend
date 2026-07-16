import { NextRequest, NextResponse } from "next/server";

const ZITADEL_URL =
  process.env.ZITADEL_INTERNAL_URL ||
  "http://zitadel.puchi-auth.svc.cluster.local:8080";
const ZITADEL_SERVICE_TOKEN = process.env.ZITADEL_SERVICE_TOKEN!;

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${ZITADEL_URL}/management/v1/users/human`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
          Host: "auth.puchi.io.vn",
        },
        body: JSON.stringify({
          userName: email.split("@")[0],
          email: { email, isEmailVerified: false },
          profile: {
            firstName: firstName || email.split("@")[0],
            lastName: lastName || "",
            displayName: firstName
              ? `${firstName} ${lastName}`.trim()
              : email,
          },
          password,
          passwordChangeRequired: false,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      if (text.includes("already")) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: `Registration failed: ${text}` },
        { status: 400 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, userId: data.userId });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
