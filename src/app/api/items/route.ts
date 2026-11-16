import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, logActivity } from "@/lib/auth";
import { ItemSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const categoryId = searchParams.get("categoryId") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "12");
    const showDeleted = searchParams.get("showDeleted") === "true";

    const where = {
      isDeleted: showDeleted ? undefined : false,
      ...(search && { OR: [{ name: { contains: search } }, { itemCode: { contains: search } }] }),
      ...(categoryId && { categoryId }),
    };

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.item.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = ItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Validasi gagal" }, { status: 400 });
    }

    const { imageUrl, ...rest } = parsed.data;
    const item = await prisma.item.create({
      data: { ...rest, imageUrl: imageUrl || null },
      include: { category: true },
    });

    await logActivity({
      userId: session.userId,
      action: "ITEM_CREATED",
      context: { itemCode: item.itemCode, itemName: item.name },
      ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ success: false, error: "Kode item sudah digunakan" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
