import { NextRequest } from "next/server";
import { defaultHandler, validateRequired } from "@/lib/api-handler";
import type { APIResetPassword } from "@/lib/api-contracts";
import { zitadelFetch } from "@/lib/zitadel-service";
import { requireSecret } from "@/config/env";

export async function POST(request: NextRequest) {
  return defaultHandler<APIResetPassword>(
    {
      request,
      validate: (body) => validateRequired(body, ["userId", "code", "password"]),
    },
    async (body) => {
      const res = await zitadelFetch(`/v2beta/users/${body.userId}/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${requireSecret('ZITADEL_SERVICE_TOKEN')}`,
        },
        body: JSON.stringify({
          newPassword: { password: body.password, changeRequired: false },
          verificationCode: body.code,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        return { error: `Password reset failed: ${text}` } as const;
      }

      return { success: true };
    },
  );
}
