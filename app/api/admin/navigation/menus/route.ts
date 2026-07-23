import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/adminApiSession";
import prisma from "@/lib/prisma";
import { decorateSiteMenuItem, type SiteMenuLocation } from "@/lib/siteChromeShared";

function normalizeMenuPayload(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const input = body as Record<string, unknown>;
  const label = typeof input.label === "string" ? input.label.trim() : "";
  const url = typeof input.url === "string" ? input.url.trim() : "";
  const location = input.location === "header" || input.location === "footer" ? input.location : null;
  const order = Number(input.order);

  if (!label || label.length > 80 || !url || url.length > 500 || !location) return null;
  if (!url.startsWith("/") && !url.startsWith("#") && !/^https?:\/\//i.test(url)) return null;
  if (!Number.isInteger(order) || order < 1 || order > 999) return null;

  return { label, url, location: location as SiteMenuLocation, order };
}

export async function POST(request: NextRequest) {
  if (!getAdminApiSession(request)) {
    return NextResponse.json({ error: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
  }

  try {
    const payload = normalizeMenuPayload(await request.json());
    if (!payload) {
      return NextResponse.json({ error: "Dữ liệu menu không hợp lệ." }, { status: 400 });
    }

    const duplicate = await prisma.navigationMenu.findFirst({
      where: { location: payload.location, url: payload.url },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json({ error: "Đường dẫn này đã tồn tại trong menu." }, { status: 409 });
    }

    const item = await prisma.navigationMenu.create({
      data: {
        label: payload.label,
        url: payload.url,
        location: payload.location,
        menuOrder: payload.order,
      },
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
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create navigation item:", error);
    return NextResponse.json({ error: "Không thể thêm menu." }, { status: 500 });
  }
}

