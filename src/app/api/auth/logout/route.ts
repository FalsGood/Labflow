import { NextRequest, NextResponse } from "next/server";
import { clearCookieToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.set(clearCookieToken());
  return response;
}
