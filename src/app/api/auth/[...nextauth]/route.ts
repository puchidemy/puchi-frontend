import { handlers } from '@/lib/auth';

const AUTH_URL = process.env.AUTH_URL || process.env.NEXTAUTH_URL;

async function fixRequestUrl(req: Request): Promise<Request> {
  if (!AUTH_URL) return req;

  const targetOrigin = new URL(AUTH_URL).origin;
  const reqUrl = new URL(req.url);

  // If the request URL already matches the target, use as-is
  if (reqUrl.origin === targetOrigin) return req;

  // Fix the request URL to use the configured auth URL origin
  const fixed = new URL(reqUrl.pathname + reqUrl.search, targetOrigin);
  return new Request(fixed.toString(), req);
}

async function wrappedHandler(req: Request) {
  const fixedReq = await fixRequestUrl(req);
  return handlers.POST(fixedReq);
}

export const GET = wrappedHandler;
export const POST = wrappedHandler;
export const PUT = wrappedHandler;
export const DELETE = wrappedHandler;
export const PATCH = wrappedHandler;
