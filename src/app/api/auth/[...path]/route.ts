import { NextRequest } from "next/server";
import { ensureSupertokensInit } from "@/config/supertokens-server";

ensureSupertokensInit();

export async function GET(req: NextRequest) {
  return handleAuthRequest(req);
}

export async function POST(req: NextRequest) {
  return handleAuthRequest(req);
}

export async function PUT(req: NextRequest) {
  return handleAuthRequest(req);
}

export async function DELETE(req: NextRequest) {
  return handleAuthRequest(req);
}

async function handleAuthRequest(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/auth", "");

  const supertokensUrl = `${process.env.SUPERTOKENS_CONNECTION_URI || "http://localhost:30567"
    }${path}${url.search}`;

  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (key !== "host") {
      headers[key] = value;
    }
  });

  const response = await fetch(supertokensUrl, {
    method: req.method,
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body:
      req.method !== "GET" && req.method !== "HEAD"
        ? await req.text()
        : undefined,
  });

  const responseData = await response.text();

  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "content-encoding") {
      responseHeaders[key] = value;
    }
  });

  return new Response(responseData, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
