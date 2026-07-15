import { NextRequest, NextResponse } from "next/server";
import { ensureSupertokensInit } from "@/config/supertokens-server";
import { getAppDirRequestHandler } from "supertokens-node/nextjs";

async function handleAuth(request: NextRequest) {
  try {
    ensureSupertokensInit();
    const handler = getAppDirRequestHandler();
    const result = await handler(request);
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
