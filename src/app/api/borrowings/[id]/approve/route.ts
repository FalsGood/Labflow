import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, logActivity } from "@/lib/auth";
import { ApproveSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = ApproveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Validasi gagal" }, { status: 400 });
  }

  const borrowing = await prisma.borrowing.findUnique({ where: { id }, include: { item: true } });
  if (!borrowing) return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });
  if (borrowing.status !== "pending") {
    return NextResponse.json({ success: false, error: "Hanya permintaan berstatus pending yang dapat disetujui" }, { status: 400 });
  }

  // Transactional: check stock and deduct
  const result = await prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({ where: { id: borrowing.itemId } });
    if (!item || item.availableStock < borrowing.quantity) {
      throw new Error(`Stok tidak cukup. Tersedia: ${item?.availableStock ?? 0}`);
    }

    await tx.item.update({
      where: { id: borrowing.itemId },
      data: { availableStock: { decrement: borrowing.quantity } },
    });

    return tx.borrowing.update({
      where: { id },
      data: { status: "approved", adminId: session.userId, adminNotes: parsed.data.adminNotes },
    });
  });

  await logActivity({
    userId: session.userId,
    action: "BORROW_APPROVED",
    context: { transactionCode: borrowing.transactionCode },
    ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
  });

  return NextResponse.json({ success: true, data: result });
}
