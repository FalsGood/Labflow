import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, logActivity } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

const BORROW_INCLUDE = {
  user: { select: { id: true, name: true, email: true, nisnNip: true } },
  item: { select: { id: true, name: true, itemCode: true, imageUrl: true, category: { select: { name: true } } } },
  admin: { select: { id: true, name: true } },
};

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const borrowing = await prisma.borrowing.findUnique({ where: { id }, include: BORROW_INCLUDE });
  if (!borrowing) return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });

  // Student can only view their own
  if (session.role === "siswa" && borrowing.userId !== session.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json({ success: true, data: borrowing });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const borrowing = await prisma.borrowing.findUnique({ where: { id } });
  if (!borrowing) return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });

  // Only student who owns it can cancel pending, or admin
  if (session.role === "siswa" && (borrowing.userId !== session.userId || borrowing.status !== "pending")) {
    return NextResponse.json({ success: false, error: "Hanya permintaan pending milik Anda yang dapat dibatalkan" }, { status: 403 });
  }

  await prisma.borrowing.update({ where: { id }, data: { status: "rejected", adminNotes: "Dibatalkan oleh siswa" } });

  await logActivity({
    userId: session.userId,
    action: "BORROW_CANCELLED",
    context: { transactionCode: borrowing.transactionCode },
    ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
  });

  return NextResponse.json({ success: true, message: "Permintaan dibatalkan" });
}
