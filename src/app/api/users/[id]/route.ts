import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, logActivity } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { isActive, role } = body as { isActive?: boolean; role?: "admin" | "siswa" };

  const updated = await prisma.user.update({
    where: { id },
    data: { ...(isActive !== undefined && { isActive }), ...(role && { role }) },
    select: { id: true, name: true, email: true, nisnNip: true, role: true, isActive: true },
  });

  await logActivity({
    userId: session.userId,
    action: "USER_UPDATED",
    context: { targetUserId: id, changes: { isActive, role } },
    ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
  });

  return NextResponse.json({ success: true, data: updated });
}
