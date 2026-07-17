import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/adminAuth";

const CORE_COLLECTIONS = [
  {
    accent: "family",
    eyebrow: "Du lịch cùng gia đình",
    title: "Kỳ nghỉ nhẹ nhàng cho gia đình lớn",
    description: "Ưu tiên lịch trình ít di chuyển, khách sạn tiện nghi, bữa ăn phù hợp trẻ nhỏ và khoảng nghỉ đủ dài cho ông bà.",
  },
  {
    accent: "youth",
    eyebrow: "Du lịch cùng thanh xuân",
    title: "Chuyến đi cho nhóm bạn thích khám phá và lưu giữ kỷ niệm",
    description: "Nhịp đi năng động hơn, nhiều điểm chụp ảnh, trải nghiệm bản địa và gợi ý quán ăn dành cho nhóm trẻ.",
  },
  {
    accent: "vietnam",
    eyebrow: "Điểm đến đẹp nhất Việt Nam",
    title: "Những hành trình khám phá Việt Nam",
    description: "Tuyển chọn các điểm đến có cảnh quan nổi bật, phù hợp khách lần đầu đi hoặc khách cần lịch trình dễ tư vấn.",
  },
] as const;

const CORE_ACCENTS = CORE_COLLECTIONS.map((item) => item.accent);

type PackageCollectionRow = {
  id: number;
  title: string;
  eyebrow: string | null;
  description: string | null;
  accent: string | null;
  _count?: { items: number };
};

function formatCollection(collection: PackageCollectionRow) {
  return {
    id: collection.id,
    name: collection.title,
    slug: collection.eyebrow || "",
    description: collection.description || "",
    accent: collection.accent || "",
    packageCount: collection._count?.items || 0,
  };
}

function getPayloadValue(value: unknown) {
  return value === undefined || value === null ? "" : String(value).trim();
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json({ error: "Bạn chưa đăng nhập quản trị." }, { status: 401 });
    }

    const collections = await prisma.packageCollection.findMany({
      where: { accent: { in: CORE_ACCENTS } },
      orderBy: { id: "asc" },
      include: { _count: { select: { items: true } } },
    });

    return NextResponse.json({ success: true, categories: collections.map(formatCollection) });
  } catch (error) {
    console.error("Failed to load package collections:", error);
    return NextResponse.json({ error: "Không tải được danh mục gói du lịch." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json({ error: "Bạn chưa đăng nhập quản trị." }, { status: 401 });
    }

    const body = await request.json();
    const title = getPayloadValue(body.name);
    const eyebrow = getPayloadValue(body.slug);
    const description = getPayloadValue(body.description);
    const accent = getPayloadValue(body.accent);

    if (!title) return NextResponse.json({ error: "Tên danh mục không được để trống." }, { status: 400 });
    if (!CORE_ACCENTS.includes(accent as any)) {
      return NextResponse.json({ error: "Chỉ được sử dụng 3 danh mục: family, youth, vietnam." }, { status: 400 });
    }

    const existing = await prisma.packageCollection.findFirst({ where: { accent } });
    if (existing) return NextResponse.json({ error: "Danh mục này đã tồn tại." }, { status: 400 });

    const collection = await prisma.packageCollection.create({
      data: { title, eyebrow: eyebrow || null, description: description || null, accent },
      include: { _count: { select: { items: true } } },
    });

    return NextResponse.json({ success: true, category: formatCollection(collection) });
  } catch (error) {
    console.error("Failed to create package collection:", error);
    return NextResponse.json({ error: "Không tạo được danh mục gói du lịch." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json({ error: "Bạn chưa đăng nhập quản trị." }, { status: 401 });
    }

    const body = await request.json();
    const id = Number(body.id);
    const title = getPayloadValue(body.name);
    const eyebrow = getPayloadValue(body.slug);
    const description = getPayloadValue(body.description);
    const accent = getPayloadValue(body.accent);

    if (!Number.isInteger(id)) return NextResponse.json({ error: "ID danh mục không hợp lệ." }, { status: 400 });
    if (!title) return NextResponse.json({ error: "Tên danh mục không được để trống." }, { status: 400 });
    if (!CORE_ACCENTS.includes(accent as any)) {
      return NextResponse.json({ error: "Chỉ được sử dụng 3 danh mục: family, youth, vietnam." }, { status: 400 });
    }

    const existing = await prisma.packageCollection.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Không tìm thấy danh mục cần cập nhật." }, { status: 404 });

    const duplicatedAccent = await prisma.packageCollection.findFirst({ where: { accent, NOT: { id } } });
    if (duplicatedAccent) return NextResponse.json({ error: "Accent này đã được dùng bởi danh mục khác." }, { status: 400 });

    const collection = await prisma.packageCollection.update({
      where: { id },
      data: { title, eyebrow: eyebrow || null, description: description || null, accent },
      include: { _count: { select: { items: true } } },
    });

    return NextResponse.json({ success: true, category: formatCollection(collection) });
  } catch (error) {
    console.error("Failed to update package collection:", error);
    return NextResponse.json({ error: "Không cập nhật được danh mục gói du lịch." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json({ error: "Bạn chưa đăng nhập quản trị." }, { status: 401 });
    }

    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id)) return NextResponse.json({ error: "ID danh mục không hợp lệ." }, { status: 400 });

    const existing = await prisma.packageCollection.findUnique({ where: { id } });
    if (existing?.accent && CORE_ACCENTS.includes(existing.accent as any)) {
      return NextResponse.json({ error: "Không thể xóa 3 danh mục gói chính." }, { status: 400 });
    }

    const itemCount = await prisma.packageCollectionItem.count({ where: { collectionId: id } });
    if (itemCount > 0) {
      return NextResponse.json({ error: "Không thể xóa danh mục đang có gói du lịch bên trong." }, { status: 400 });
    }

    await prisma.packageCollection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete package collection:", error);
    return NextResponse.json({ error: "Không xóa được danh mục gói du lịch." }, { status: 500 });
  }
}
