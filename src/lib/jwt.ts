import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "labflow-super-secret-jwt-key-2026-change-in-production"
);

export const COOKIE_NAME = "labflow_token";

export interface JWTPayload {
  userId: string;
  email: string;
  role: "admin" | "siswa";
  name: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as "admin" | "siswa",
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

