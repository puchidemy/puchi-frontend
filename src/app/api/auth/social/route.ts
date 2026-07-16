import { NextRequest, NextResponse } from "next/server";

const ZITADEL_URL =
  process.env.ZITADEL_INTERNAL_URL ||
  "http://zitadel.puchi-auth.svc.cluster.local:8080";
const ZITADEL_SERVICE_TOKEN = process.env.ZITADEL_SERVICE_TOKEN!;

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json();

    if (!provider) {
      return NextResponse.json(
        { error: "Provider required" },
        { status: 400 }
      );
    }

    const idpsRes = await fetch(
      `${ZITADEL_URL}/v2beta/settings/login/idps`,
      {
        headers: {
          Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
          Host: "auth.puchi.io.vn",
        },
      }
    );

    if (!idpsRes.ok) {
      return NextResponse.json(
        { error: "Failed to get identity providers" },
        { status: 500 }
      );
    }

    const idps = await idpsRes.json();
    const idp = idps.identityProviders?.find(
      (ip: any) => ip.name?.toLowerCase() === provider.toLowerCase()
    );

    if (!idp) {
      return NextResponse.json(
        { error: `Provider ${provider} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      idpId: idp.id,
      name: idp.name,
      type: idp.type,
    });
  } catch (err) {
    console.error("Social login error:", err);
    return NextResponse.json(
      { error: "Failed to get social login config" },
      { status: 500 }
    );
  }
}
