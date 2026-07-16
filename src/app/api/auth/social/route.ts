import { NextRequest, NextResponse } from "next/server";
import { zitadelFetch } from "@/lib/zitadel-service";

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json();

    if (!provider) {
      return NextResponse.json(
        { error: "Provider required" },
        { status: 400 }
      );
    }

    const idpsRes = await zitadelFetch("/v2beta/settings/login/idps", {
      headers: {
        Authorization: `Bearer ${process.env.ZITADEL_SERVICE_TOKEN!}`,
      },
    });

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
