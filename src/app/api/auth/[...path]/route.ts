import { NextRequest } from "next/server";
import { ensureSupertokensInit } from "@/config/supertokens-server";
import { getAppDirRequestHandler } from "supertokens-node/nextjs";

export async function GET(request: NextRequest) {
  ensureSupertokensInit();
  return getAppDirRequestHandler()(request);
}

export async function POST(request: NextRequest) {
  ensureSupertokensInit();
  return getAppDirRequestHandler()(request);
}

export async function PUT(request: NextRequest) {
  ensureSupertokensInit();
  return getAppDirRequestHandler()(request);
}

export async function DELETE(request: NextRequest) {
  ensureSupertokensInit();
  return getAppDirRequestHandler()(request);
}

export async function PATCH(request: NextRequest) {
  ensureSupertokensInit();
  return getAppDirRequestHandler()(request);
}
