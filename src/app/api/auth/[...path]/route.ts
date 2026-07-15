import { NextRequest, NextResponse } from "next/server";
import { ensureSupertokensInit } from "@/config/supertokens-server";
import { getAppDirRequestHandler } from "supertokens-node/nextjs";

export async function GET(request: NextRequest) {
  try {
    ensureSupertokensInit();
    return getAppDirRequestHandler()(request);
  } catch (e) {
    console.error("ROUTE ERROR:", e instanceof Error ? e.stack : e);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureSupertokensInit();
    return getAppDirRequestHandler()(request);
  } catch (e) {
    console.error("ROUTE ERROR:", e instanceof Error ? e.stack : e);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    ensureSupertokensInit();
    return getAppDirRequestHandler()(request);
  } catch (e) {
    console.error("ROUTE ERROR:", e instanceof Error ? e.stack : e);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    ensureSupertokensInit();
    return getAppDirRequestHandler()(request);
  } catch (e) {
    console.error("ROUTE ERROR:", e instanceof Error ? e.stack : e);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    ensureSupertokensInit();
    return getAppDirRequestHandler()(request);
  } catch (e) {
    console.error("ROUTE ERROR:", e instanceof Error ? e.stack : e);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
