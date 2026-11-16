import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, logActivity } from "@/lib/auth";
import { CategorySchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = CategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Validasi gagal" }, { status: 400 });
  }

  try {
    const category = await prisma.category.update({ where: { id }, data: parsed.data, include: { _count: { select: { items: true } } } });
    await logActivity({ userId: session.userId, action: "CATEGORY_UPDATED", context: { name: category.name } });
    return NextResponse.json({ success: true, data: category });
  } catch {
    return NextResponse.json({ success: false, error: "Slug sudah digunakan" }, { status: 409 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const itemCount = await prisma.item.count({ where: { categoryId: id } });
  if (itemCount > 0) {
    return NextResponse.json({ success: false, error: "Kategori masih memiliki item, tidak dapat dihapus" }, { status: 409 });
  }

  await prisma.category.delete({ where: { id } });
  await logActivity({ userId: session.userId, action: "CATEGORY_DELETED", context: { categoryId: id } });
  return NextResponse.json({ success: true, message: "Kategori berhasil dihapus" });
}
