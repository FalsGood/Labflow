import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, logActivity } from "@/lib/auth";
import { RejectSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = RejectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Validasi gagal" }, { status: 400 });
  }

  const borrowing = await prisma.borrowing.findUnique({ where: { id } });
  if (!borrowing) return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });
  if (borrowing.status !== "pending") {
    return NextResponse.json({ success: false, error: "Hanya permintaan berstatus pending yang dapat ditolak" }, { status: 400 });
  }

  const updated = await prisma.borrowing.update({
    where: { id },
    data: { status: "rejected", adminId: session.userId, adminNotes: parsed.data.adminNotes },
  });

  await logActivity({
    userId: session.userId,
    action: "BORROW_REJECTED",
    context: { transactionCode: borrowing.transactionCode, reason: parsed.data.adminNotes },
    ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
  });

  return NextResponse.json({ success: true, data: updated });
}
