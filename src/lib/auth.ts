import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { signToken, verifyToken, JWTPayload, COOKIE_NAME } from "./jwt";

export { signToken, verifyToken, COOKIE_NAME, type JWTPayload };

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function getSessionFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export function setCookieToken(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

export function clearCookieToken() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export async function logActivity({
  userId,
  action,
  context,
  ipAddress,
}: {
  userId?: string;
  action: string;
  context?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        context: context ? JSON.stringify(context) : undefined,
        ipAddress,
      },
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}
