import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/adminApiSession";
import prisma from "@/lib/prisma";
import { decorateSiteMenuItem, type SiteMenuLocation } from "@/lib/siteChromeShared";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isValidUrl(url: string) {
  return url.startsWith("/") || url.startsWith("#") || /^https?:\/\//i.test(url);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  if (!getAdminApiSession(request)) {
    return NextResponse.json({ error: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
  }

  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "ID menu không hợp lệ." }, { status: 400 });
    }

    const existing = await prisma.navigationMenu.findUnique({ where: { id } });
    if (!existing || !["header", "footer"].includes(existing.location)) {
      return NextResponse.json({ error: "Không tìm thấy menu." }, { status: 404 });
    }

    const body = await request.json() as Record<string, unknown>;
    const label = typeof body.label === "string" ? body.label.trim() : existing.label;
    const url = typeof body.url === "string" ? body.url.trim() : existing.url;
    const location = body.location === "header" || body.location === "footer" ? body.location : existing.location;
    const order = body.order === undefined ? existing.menuOrder : Number(body.order);

    if (!label || label.length > 80 || !url || url.length > 500 || !isValidUrl(url)) {
      return NextResponse.json({ error: "Nhãn hoặc đường dẫn menu không hợp lệ." }, { status: 400 });
    }
    if (!Number.isInteger(order) || order < 1 || order > 999) {
      return NextResponse.json({ error: "Thứ tự menu không hợp lệ." }, { status: 400 });
    }

    const duplicate = await prisma.navigationMenu.findFirst({
      where: { location, url, id: { not: id } },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json({ error: "Đường dẫn này đã tồn tại trong menu." }, { status: 409 });
    }

    const item = await prisma.navigationMenu.update({
      where: { id },
      data: { label, url, location, menuOrder: order },
    });

    revalidatePath("/", "layout");
    return NextResponse.json({
      success: true,
      item: decorateSiteMenuItem({
        id: item.id,
        label: item.label,
        url: item.url,
        location: item.location as SiteMenuLocation,
        order: item.menuOrder,
      }),
    });
  } catch (error) {
    console.error("Failed to update navigation item:", error);
    return NextResponse.json({ error: "Không thể cập nhật menu." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  if (!getAdminApiSession(request)) {
    return NextResponse.json({ error: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
  }

  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "ID menu không hợp lệ." }, { status: 400 });
    }

    const existing = await prisma.navigationMenu.findUnique({ where: { id } });
    if (!existing || !["header", "footer"].includes(existing.location)) {
      return NextResponse.json({ error: "Không tìm thấy menu." }, { status: 404 });
    }

    await prisma.navigationMenu.delete({ where: { id } });
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete navigation item:", error);
    return NextResponse.json({ error: "Không thể xóa menu." }, { status: 500 });
  }
}

