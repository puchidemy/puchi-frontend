import { NextRequest } from "next/server";
import { defaultHandler, validateRequired } from "@/lib/api-handler";
import type { APIForgotPassword } from "@/lib/api-contracts";
import { zitadelFetch } from "@/lib/zitadel-service";
import { requireSecret } from "@/config/env";

export async function POST(request: NextRequest) {
  return defaultHandler<APIForgotPassword>(
    {
      request,
      validate: (body) => validateRequired(body, ["email"]),
    },
    async (body) => {
      const userRes = await zitadelFetch(
        `/management/v1/global/users/_by_login_name?loginName=${encodeURIComponent(body.email)}`,
        {
          headers: {
            Authorization: `Bearer ${requireSecret('ZITADEL_SERVICE_TOKEN')}`,
          },
        },
      );

      if (!userRes.ok) {
        return { success: true }; // don't reveal user existence
      }

      const userData = await userRes.json();

      const resetRes = await zitadelFetch(
        `/v2beta/users/${userData.user.id}/password/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${requireSecret('ZITADEL_SERVICE_TOKEN')}`,
          },
          body: JSON.stringify({
            notifyType: 1,
            returnCode: false,
          }),
        },
      );

      if (!resetRes.ok) {
        console.error("Password reset failed:", await resetRes.text());
      }

      return { success: true };
    },
  );
}
