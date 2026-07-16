import { NextRequest } from "next/server";
import { defaultHandler, validateRequired } from "@/lib/api-handler";
import type { APIRegister } from "@/lib/api-contracts";
import { zitadelFetch } from "@/lib/zitadel-service";
import { env, requireSecret } from "@/config/env";

export async function POST(request: NextRequest) {
  return defaultHandler<APIRegister>(
    {
      request,
      validate: (body) => validateRequired(body, ["email", "password"]),
    },
    async (body) => {
      const res = await zitadelFetch("/management/v1/users/human", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${requireSecret('ZITADEL_SERVICE_TOKEN')}`,
        },
        body: JSON.stringify({
          userName: body.email.split("@")[0],
          email: { email: body.email, isEmailVerified: false },
          profile: {
            firstName: body.firstName || body.email.split("@")[0],
            lastName: body.lastName || "",
            displayName: body.firstName
              ? `${body.firstName} ${body.lastName}`.trim()
              : body.email,
          },
          password: body.password,
          passwordChangeRequired: false,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        if (text.includes("already")) {
          return { error: "User already exists" } as const;
        }
        return { error: `Registration failed: ${text}` } as const;
      }

      const data = await res.json();
      return { success: true, userId: data.userId };
    },
  );
}
