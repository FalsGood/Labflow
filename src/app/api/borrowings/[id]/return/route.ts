import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, logActivity } from "@/lib/auth";
import { ReturnSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = ReturnSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Validasi gagal" }, { status: 400 });
  }

  const borrowing = await prisma.borrowing.findUnique({ where: { id }, include: { item: true } });
  if (!borrowing) return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });
  if (!["borrowed", "overdue"].includes(borrowing.status)) {
    return NextResponse.json({ success: false, error: "Status tidak valid untuk pengembalian" }, { status: 400 });
  }

  const { condition, adminNotes } = parsed.data;

  // Restore stock regardless of condition (admin notes document damage)
  const result = await prisma.$transaction(async (tx) => {
    await tx.item.update({
      where: { id: borrowing.itemId },
      data: {
        availableStock: { increment: borrowing.quantity },
        condition: condition,
      },
    });

    return tx.borrowing.update({
      where: { id },
      data: {
        status: "returned",
        returnActualDate: new Date(),
        adminId: session.userId,
        adminNotes,
      },
    });
  });

  await logActivity({
    userId: session.userId,
    action: "ITEM_RETURNED",
    context: { transactionCode: borrowing.transactionCode, condition, adminNotes },
    ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
  });

  return NextResponse.json({ success: true, data: result });
}
