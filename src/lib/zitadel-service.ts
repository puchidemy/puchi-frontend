import http from "node:http";
import https from "node:https";

const ZITADEL_URL =
  process.env.ZITADEL_INTERNAL_URL ||
  "http://zitadel.puchi-auth.svc.cluster.local:8080";
const ZITADEL_SERVICE_TOKEN = process.env.ZITADEL_SERVICE_TOKEN!;

// Zitadel uses the Host header for instance-based routing.
// Node.js fetch (undici) does NOT allow overriding the Host header,
// so we use the built-in http/https module instead.
export function zitadelFetch(
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {}
): Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<any>;
  text: () => Promise<string>;
}> {
  return new Promise((resolve, reject) => {
    const url = new URL(`${ZITADEL_URL}${path}`);
    const isHttps = url.protocol === "https:";
    const lib = isHttps ? https : http;

    const requestOptions: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || "GET",
      headers: {
        ...options.headers,
        Host: "auth.puchi.io.vn",
      },
    };

    const req = lib.request(requestOptions, (res) => {
      let data = "";
      res.on("data", (chunk: Buffer) => {
        data += chunk.toString();
      });
      res.on("end", () => {
        resolve({
          ok: res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode || 500,
          json: () => {
            try {
              return Promise.resolve(JSON.parse(data || "{}"));
            } catch {
              return Promise.resolve({});
            }
          },
          text: () => Promise.resolve(data),
        });
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

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
  const res = await zitadelFetch("/v2beta/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
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
  const res = await zitadelFetch(`/v2beta/sessions/${sessionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
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
  const res = await zitadelFetch(
    `/v2beta/oidc/auth_requests/${authRequestId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
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
  const res = await zitadelFetch(
    `/v2beta/oidc/auth_requests/${authRequestId}`,
    {
      headers: {
        Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
      },
    }
  );
  if (!res.ok)
    throw new Error(`Failed to get auth request: ${await res.text()}`);
  return res.json();
}

// --- IDP Intents (Social Login) ---

export interface IdpIntentResult {
  idpIntentId: string;
  authUrl: string;
}

export async function createIdpIntent(
  idpId: string
): Promise<IdpIntentResult> {
  const res = await zitadelFetch("/v2beta/idp_intents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
    },
    body: JSON.stringify({ idpId }),
  });
  if (!res.ok) throw new Error(`IDP intent creation failed: ${await res.text()}`);
  const data = await res.json();
  return { idpIntentId: data.idpIntentId, authUrl: data.authUrl };
}

export interface SessionFromIdpIntentResult {
  sessionId: string;
  sessionToken: string;
  userId: string;
}

export async function createSessionFromIdpIntent(
  idpIntentId: string,
  idpIntentToken: string
): Promise<SessionFromIdpIntentResult> {
  const res = await zitadelFetch("/v2beta/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
    },
    body: JSON.stringify({
      checks: {
        idpIntent: {
          idpIntentId,
          idpIntentToken,
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`Session from IDP intent failed: ${await res.text()}`);
  const data = await res.json();
  return {
    sessionId: data.id,
    sessionToken: data.sessionToken,
    userId: data.factors?.user?.id || "",
  };
}

export interface IdpIntentDetail {
  idpIntentId: string;
  userId?: string;
  token: string;
}

/**
 * After external auth, Zitadel redirects to the callback URL with these params.
 * This function extracts them from the URL search params.
 */
export function parseIdpIntentCallback(
  searchParams: URLSearchParams
): IdpIntentDetail | null {
  const idpIntentId = searchParams.get("idpIntentId");
  const token = searchParams.get("token");
  const userId = searchParams.get("userId") || undefined;

  if (!idpIntentId || !token) return null;

  return { idpIntentId, token, userId };
}

export async function getIdpIntent(
  idpIntentId: string
): Promise<any> {
  const res = await zitadelFetch(`/v2beta/idp_intents/${idpIntentId}`, {
    headers: {
      Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to get IDP intent: ${await res.text()}`);
  return res.json();
}
