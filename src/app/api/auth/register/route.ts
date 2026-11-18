import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, setCookieToken, logActivity } from "@/lib/auth";
import { RegisterSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Validasi gagal" }, { status: 400 });
    }
    const { name, email, nisnNip, password, phoneNumber } = parsed.data;

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { nisnNip }] } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email atau NISN sudah terdaftar" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, nisnNip, password: hashed, role: "siswa", phoneNumber },
    });

    const token = await signToken({ userId: user.id, email: user.email, role: user.role, name: user.name });
    const cookieOptions = setCookieToken(token);

    await logActivity({
      userId: user.id,
      action: "USER_REGISTERED",
      context: { name, email },
      ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
    });

    const response = NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, { status: 201 });
    response.cookies.set(cookieOptions);
    return response;
  } catch (err: unknown) {
    console.error("Register error:", err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server saat mendaftar";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
