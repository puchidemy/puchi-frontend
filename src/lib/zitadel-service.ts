const ZITADEL_URL =
  process.env.ZITADEL_INTERNAL_URL ||
  "http://zitadel.puchi-auth.svc.cluster.local:8080";
const ZITADEL_SERVICE_TOKEN = process.env.ZITADEL_SERVICE_TOKEN!;

interface ZitadelSession {
  id: string;
  factors: {
    user: { id: string; loginName: string };
    password?: { verifiedAt: string };
  };
}

export async function createSession(
  email: string
): Promise<{ sessionId: string; sessionToken: string }> {
  const res = await fetch(`${ZITADEL_URL}/v2beta/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
      Host: "auth.puchi.io.vn",
    },
    body: JSON.stringify({
      checks: { user: { loginName: email } },
    }),
  });
  if (!res.ok) throw new Error(`Session creation failed: ${await res.text()}`);
  const data = await res.json();
  return { sessionId: data.id, sessionToken: data.sessionToken };
}

export async function verifyPassword(
  sessionId: string,
  password: string
): Promise<boolean> {
  const res = await fetch(`${ZITADEL_URL}/v2beta/sessions/${sessionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
      Host: "auth.puchi.io.vn",
    },
    body: JSON.stringify({
      checks: { password: { password } },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    if (text.includes("password")) return false;
    throw new Error(`Password verification failed: ${text}`);
  }
  return true;
}

export async function completeOidcFlow(
  authRequestId: string,
  sessionId: string,
  sessionToken: string
): Promise<string> {
  const res = await fetch(
    `${ZITADEL_URL}/v2beta/oidc/auth_requests/${authRequestId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
        Host: "auth.puchi.io.vn",
      },
      body: JSON.stringify({ session: { sessionId, sessionToken } }),
    }
  );

  if (!res.ok)
    throw new Error(`OIDC callback failed: ${await res.text()}`);
  const data = await res.json();
  return data.callbackUrl || data.redirectUri || "";
}

export async function getAuthRequest(
  authRequestId: string
): Promise<any> {
  const res = await fetch(
    `${ZITADEL_URL}/v2beta/oidc/auth_requests/${authRequestId}`,
    {
      headers: {
        Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
        Host: "auth.puchi.io.vn",
      },
    }
  );
  if (!res.ok)
    throw new Error(`Failed to get auth request: ${await res.text()}`);
  return res.json();
}
