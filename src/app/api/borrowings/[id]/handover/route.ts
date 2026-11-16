import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, logActivity } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const borrowing = await prisma.borrowing.findUnique({ where: { id } });
  if (!borrowing) return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });
  if (borrowing.status !== "approved") {
    return NextResponse.json({ success: false, error: "Hanya peminjaman berstatus approved yang dapat diserahkan" }, { status: 400 });
  }

  const updated = await prisma.borrowing.update({
    where: { id },
    data: { status: "borrowed" },
  });

  await logActivity({
    userId: session.userId,
    action: "BORROW_HANDOVER",
    context: { transactionCode: borrowing.transactionCode },
    ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
  });

  return NextResponse.json({ success: true, data: updated });
}
