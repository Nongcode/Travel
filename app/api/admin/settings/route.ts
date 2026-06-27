import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// Hàm kiểm tra quyền Super Admin
function checkSuperAdmin(request: NextRequest) {
  const tokenCookie = request.cookies.get("admin_token");
  if (!tokenCookie) return null;
  
  const decoded = verifyToken(tokenCookie.value);
  if (!decoded || decoded.email !== "admin") return null;
  
  return decoded;
}

// GET: Lấy tất cả cấu hình trang web hiện có
export async function GET(request: NextRequest) {
  try {
    const isAuthorized = checkSuperAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 403 });
    }

    const settings = await prisma.siteSetting.findMany();
    
    // Chuyển mảng [{ settingKey, settingValue }] thành dạng key-value object { [key]: value }
    const settingsMap = settings.reduce((acc: any, curr) => {
      acc[curr.settingKey] = curr.settingValue;
      return acc;
    }, {});

    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (error) {
    console.error("Lỗi khi tải cấu hình settings:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải cấu hình." }, { status: 500 });
  }
}

// POST: Cập nhật hoặc thêm mới các cấu hình trang web
export async function POST(request: NextRequest) {
  try {
    const isAuthorized = checkSuperAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body; // Dạng: { site_status: "active", page_home_status: "active" }

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Dữ liệu cấu hình không hợp lệ." }, { status: 400 });
    }

    // Thực hiện lưu từng cấu hình dưới dạng upsert
    const updatePromises = Object.entries(settings).map(([key, value]) => {
      return prisma.siteSetting.upsert({
        where: { settingKey: key },
        update: { settingValue: String(value) },
        create: { settingKey: key, settingValue: String(value) },
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true, message: "Lưu cấu hình hệ thống thành công." });
  } catch (error) {
    console.error("Lỗi khi lưu cấu hình settings:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi lưu cấu hình." }, { status: 500 });
  }
}
