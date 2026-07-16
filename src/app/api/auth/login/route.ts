import { NextRequest } from "next/server";
import { defaultHandler, validateRequired } from "@/lib/api-handler";
import type { APILogin } from "@/lib/api-contracts";
import { createSession, verifyPassword, completeOidcFlow } from "@/lib/zitadel-service";

export async function POST(request: NextRequest) {
  return defaultHandler<APILogin>(
    {
      request,
      validate: (body) => validateRequired(body, ["email", "password"]),
    },
    async (body) => {
      const { sessionId, sessionToken } = await createSession(body.email);
      const verified = await verifyPassword(sessionId, body.password);
      if (!verified) {
        return { error: "Invalid credentials" } as const;
      }

      const authRequestId = request.nextUrl.searchParams.get("authRequestId");
      let callbackUrl: string | undefined;

      if (authRequestId) {
        callbackUrl = await completeOidcFlow(authRequestId, sessionId, sessionToken);
      }

      return {
        success: true,
        sessionId,
        callbackUrl,
      };
    },
  );
}
