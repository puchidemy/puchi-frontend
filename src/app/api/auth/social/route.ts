import { NextRequest } from "next/server";
import { defaultHandler, validateRequired } from "@/lib/api-handler";
import { zitadelFetch, createIdpIntent } from "@/lib/zitadel-service";
import { requireSecret } from "@/config/env";

export async function POST(request: NextRequest) {
  return defaultHandler<{
    url: '/api/auth/social';
    method: 'post';
    data: { provider: string };
    result: { idpId: string; name: string; authUrl: string; idpIntentId: string } | { error: string };
  }>(
    {
      request,
      validate: (body) => validateRequired(body, ["provider"]),
    },
    async (body) => {
      // 1. Look up IDP from Zitadel
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
        return { error: `Provider ${body.provider} not found in Zitadel. Configure it first.` } as const;
      }

      // 2. Create IDP intent — this tells Zitadel to start the external auth flow
      const { idpIntentId, authUrl } = await createIdpIntent(idp.id);

      return {
        idpId: idp.id,
        name: idp.name,
        authUrl,
        idpIntentId,
      };
    },
  );
}
