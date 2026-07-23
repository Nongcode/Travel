import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/adminApiSession";
import { ensureSiteChromeDefaults, getSiteChromeConfig } from "@/lib/siteChrome";

export async function GET(request: NextRequest) {
  if (!getAdminApiSession(request)) {
    return NextResponse.json({ error: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
  }

  try {
    await ensureSiteChromeDefaults();
    const config = await getSiteChromeConfig();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("Failed to load header/footer configuration:", error);
    return NextResponse.json({ error: "Không thể tải cấu hình Header & Footer." }, { status: 500 });
  }
}

