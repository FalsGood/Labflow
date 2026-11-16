import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, setCookieToken, logActivity } from "@/lib/auth";
import { LoginSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Validasi gagal" }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return NextResponse.json({ success: false, error: "Email atau password salah" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: "Email atau password salah" }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, email: user.email, role: user.role, name: user.name });
    const cookieOptions = setCookieToken(token);

    // Set cookie in both cookieStore and response headers for maximum cross-browser reliability
    const cookieStore = await cookies();
    cookieStore.set(cookieOptions);

    await logActivity({
      userId: user.id,
      action: "USER_LOGIN",
      context: { role: user.role, email: user.email },
      ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
    });

    const response = NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
    response.cookies.set(cookieOptions);
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
