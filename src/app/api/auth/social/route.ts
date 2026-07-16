import { NextRequest } from "next/server";
import { defaultHandler, validateRequired } from "@/lib/api-handler";
import { zitadelFetch } from "@/lib/zitadel-service";
import { env, requireSecret } from "@/config/env";

export async function POST(request: NextRequest) {
  return defaultHandler<{
    url: '/api/auth/social';
    method: 'post';
    data: { provider: string };
    result: { idpId: string; name: string; type: string; authorizeUrl: string } | { error: string };
  }>(
    {
      request,
      validate: (body) => validateRequired(body, ["provider"]),
    },
    async (body) => {
      const idpsRes = await zitadelFetch("/v2beta/settings/login/idps", {
        headers: {
          Authorization: `Bearer ${requireSecret('ZITADEL_SERVICE_TOKEN')}`,
        },
      });

      if (!idpsRes.ok) {
        return { error: "Failed to get identity providers" } as const;
      }

      const idps = await idpsRes.json();
      const idp = idps.identityProviders?.find(
        (ip: any) => ip.name?.toLowerCase() === body.provider.toLowerCase(),
      );

      if (!idp) {
        return { error: `Provider ${body.provider} not found` } as const;
      }

      const redirectUri = `${env.AUTH_URL}/api/auth/callback/zitadel`;
      const scope = encodeURIComponent("openid email profile");
      const authorizeUrl = `https://auth.puchi.io.vn/oauth/v2/authorize?client_id=${requireSecret('ZITADEL_CLIENT_ID')}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&idp_hint=${idp.id}`;

      return {
        idpId: idp.id,
        name: idp.name,
        type: idp.type,
        authorizeUrl,
      };
    },
  );
}
