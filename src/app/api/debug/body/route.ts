import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    var clone = request.clone();
    var text = await clone.text();
    return NextResponse.json({
      ok: true,
      length: text.length,
      first200: text.substring(0, 200),
      headers: Object.fromEntries(request.headers.entries()),
    });
  } catch(e: unknown) {
    var err = e as Error;
    return NextResponse.json({ ok: false, error: err.message, stack: err.stack?.substring(0, 500) }, { status: 500 });
  }
}
