import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, logActivity } from "@/lib/auth";
import { BorrowRequestSchema } from "@/lib/validators";
import { generateTransactionCode } from "@/lib/utils";

const BORROW_INCLUDE = {
  user: { select: { id: true, name: true, email: true, nisnNip: true } },
  item: { select: { id: true, name: true, itemCode: true, imageUrl: true, category: { select: { name: true } } } },
  admin: { select: { id: true, name: true } },
};

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "10");

    const where = {
      ...(session.role === "siswa" && { userId: session.userId }),
      ...(status && { status: status as never }),
    };

    const [borrowings, total] = await Promise.all([
      prisma.borrowing.findMany({
        where,
        include: BORROW_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.borrowing.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: borrowings, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = BorrowRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Validasi gagal" }, { status: 400 });
    }

    const { itemId, quantity, borrowDate, returnExpectedDate, notes } = parsed.data;

    // Check stock (server-side validation)
    const item = await prisma.item.findUnique({ where: { id: itemId, isDeleted: false } });
    if (!item) return NextResponse.json({ success: false, error: "Item tidak ditemukan" }, { status: 404 });
    if (item.availableStock < quantity) {
      return NextResponse.json({ success: false, error: `Stok tidak cukup. Tersedia: ${item.availableStock}` }, { status: 400 });
    }

    const borrowing = await prisma.borrowing.create({
      data: {
        transactionCode: generateTransactionCode(),
        userId: session.userId,
        itemId,
        quantity,
        borrowDate: new Date(borrowDate),
        returnExpectedDate: new Date(returnExpectedDate),
        notes,
        status: "pending",
      },
      include: BORROW_INCLUDE,
    });

    await logActivity({
      userId: session.userId,
      action: "BORROW_REQUEST_CREATED",
      context: { transactionCode: borrowing.transactionCode, itemName: item.name, quantity },
      ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
    });

    return NextResponse.json({ success: true, data: borrowing }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
