import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, logActivity } from "@/lib/auth";
import { ItemSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const item = await prisma.item.findUnique({ where: { id }, include: { category: true } });
  if (!item) return NextResponse.json({ success: false, error: "Item tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ success: true, data: item });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = ItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Validasi gagal" }, { status: 400 });
  }

  try {
    const { imageUrl, ...rest } = parsed.data;
    const item = await prisma.item.update({
      where: { id },
      data: { ...rest, imageUrl: imageUrl || null },
      include: { category: true },
    });

    await logActivity({
      userId: session.userId,
      action: "ITEM_UPDATED",
      context: { itemCode: item.itemCode, itemName: item.name },
      ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
    });

    return NextResponse.json({ success: true, data: item });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  // Soft delete if borrowings exist
  const borrowingCount = await prisma.borrowing.count({ where: { itemId: id } });
  if (borrowingCount > 0) {
    await prisma.item.update({ where: { id }, data: { isDeleted: true } });
  } else {
    await prisma.item.delete({ where: { id } });
  }

  await logActivity({
    userId: session.userId,
    action: "ITEM_DELETED",
    context: { itemId: id, softDelete: borrowingCount > 0 },
    ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
  });

  return NextResponse.json({ success: true, message: "Item berhasil dihapus" });
}
