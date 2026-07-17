import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/adminAuth";
import { slugify } from "@/lib/slug";
import { getContentTranslations, saveContentTranslations } from "@/lib/translation/adminContent";

function optionalString(value: unknown) {
  const text = value === undefined || value === null ? "" : String(value).trim();
  return text || null;
}

function optionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function findOrCreateDestination(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  return prisma.destination.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed, slug: slugify(trimmed) },
  });
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const specialties = await prisma.localSpecialty.findMany({
      include: { destination: true, category: true, detail: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
    });

    const formatted = specialties.map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      type: item.type,
      categoryId: item.categoryId,
      categoryName: item.category?.name || "",
      destinationId: item.destinationId,
      destinationName: item.destination?.name || "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      priceText: item.priceText || "",
      whereToBuy: item.whereToBuy || "",
      status: item.status,
      hasDetail: Boolean(item.detail),
    }));

    // Fetch translations
    for (const item of formatted) {
      (item as any).translations = await getContentTranslations("local_specialty", item.id);
    }

    return NextResponse.json({ localSpecialties: formatted });
  } catch (error: any) {
    console.error("GET /api/admin/local-specialties error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ: " + (error?.message || "Unknown error") }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const name = optionalString(body.name);
    const type = optionalString(body.type) || "FOOD";
    const destName = optionalString(body.destinationName);
    
    if (!name) return NextResponse.json({ error: "Tên đặc sản không hợp lệ." }, { status: 400 });

    let slug = optionalString(body.slug);
    if (!slug) slug = slugify(name);

    const existingSlug = await prisma.localSpecialty.findUnique({ where: { slug } });
    if (existingSlug) return NextResponse.json({ error: "Đường dẫn (slug) đã tồn tại. Vui lòng chọn tên khác." }, { status: 400 });

    let destinationId: number | null = null;
    if (destName) {
      const dest = await findOrCreateDestination(destName);
      if (dest) destinationId = dest.id;
    }

    const newItem = await prisma.localSpecialty.create({
      data: {
        name,
        slug,
        type,
        destinationId,
        description: optionalString(body.description),
        imageUrl: optionalString(body.imageUrl),
        priceText: optionalString(body.priceText),
        whereToBuy: optionalString(body.whereToBuy),
        status: optionalString(body.status) || "Hiển thị",
      },
    });

    if (body.translations) {
      await saveContentTranslations("local_specialty", newItem.id, body.translations, newItem);
    }

    return NextResponse.json({ success: true, localSpecialty: newItem });
  } catch (error) {
    console.error("POST /api/admin/local-specialties error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ khi tạo đặc sản." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const id = optionalNumber(body.id);
    if (!id) return NextResponse.json({ error: "ID đặc sản không hợp lệ." }, { status: 400 });

    const existing = await prisma.localSpecialty.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Không tìm thấy đặc sản." }, { status: 404 });

    const name = optionalString(body.name);
    let slug = optionalString(body.slug);
    if (name && !slug) slug = slugify(name);

    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.localSpecialty.findUnique({ where: { slug } });
      if (slugTaken) return NextResponse.json({ error: "Đường dẫn (slug) đã tồn tại." }, { status: 400 });
    }

    let destinationId: number | null = existing.destinationId;
    if (body.destinationName !== undefined) {
      const destName = optionalString(body.destinationName);
      if (destName) {
        const dest = await findOrCreateDestination(destName);
        if (dest) destinationId = dest.id;
      } else {
        destinationId = null;
      }
    }

    const updated = await prisma.localSpecialty.update({
      where: { id },
      data: {
        name: name || undefined,
        slug: slug || undefined,
        type: optionalString(body.type) || undefined,
        destinationId: destinationId,
        description: body.description !== undefined ? optionalString(body.description) : undefined,
        imageUrl: body.imageUrl !== undefined ? optionalString(body.imageUrl) : undefined,
        priceText: body.priceText !== undefined ? optionalString(body.priceText) : undefined,
        whereToBuy: body.whereToBuy !== undefined ? optionalString(body.whereToBuy) : undefined,
        status: optionalString(body.status) || undefined,
      },
    });

    if (body.translations) {
      await saveContentTranslations("local_specialty", updated.id, body.translations, updated);
    }

    return NextResponse.json({ success: true, localSpecialty: updated });
  } catch (error) {
    console.error("PUT /api/admin/local-specialties error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ khi cập nhật đặc sản." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = optionalNumber(request.nextUrl.searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "ID không hợp lệ." }, { status: 400 });

    await prisma.localSpecialty.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/local-specialties error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ khi xóa đặc sản." }, { status: 500 });
  }
}
