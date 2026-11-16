import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, clearCookieToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const response = NextResponse.json({ success: true });
  response.cookies.set(clearCookieToken());
  return response;
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, data: null }, { status: 401 });
  return NextResponse.json({ success: true, data: session });
}
