import { NextRequest, NextResponse } from "next/server";
import { ensureSupertokensInit } from "@/config/supertokens-server";
import { getAppDirRequestHandler } from "supertokens-node/nextjs";

async function handleAuth(request: NextRequest) {
  try {
    ensureSupertokensInit();
    const handler = getAppDirRequestHandler();

    // Debug: check what body we actually receive
    const rawBody = await request.clone().text();
    console.log("BODY PREVIEW:", rawBody.substring(0, 200));

    // supertokens cần đọc body 2 lần (formData + json),
    // tạo request mới với string body cho phép đọc lại
    const bufferedReq = new NextRequest(request.url, {
      method: request.method,
      headers: request.headers,
      body: rawBody,
    });

    const result = await handler(bufferedReq);
    return result;
  } catch (e: unknown) {
    const err = e as Error;
    console.error("ROUTE ERROR:", err.stack || err.message);
    return NextResponse.json(
      { error: err.message || String(e) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleAuth(request);
}
export async function POST(request: NextRequest) {
  return handleAuth(request);
}
export async function PUT(request: NextRequest) {
  return handleAuth(request);
}
export async function DELETE(request: NextRequest) {
  return handleAuth(request);
}
export async function PATCH(request: NextRequest) {
  return handleAuth(request);
}
