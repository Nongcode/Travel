import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/adminApiSession";
import { saveSiteChromeSettings, SITE_CHROME_SETTING_KEYS } from "@/lib/siteChrome";

export async function PUT(request: NextRequest) {
  if (!getAdminApiSession(request)) {
    return NextResponse.json({ error: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const logoUrl = typeof body.logoUrl === "string" ? body.logoUrl.trim() : "";
    const logoAlt = typeof body.logoAlt === "string" ? body.logoAlt.trim() : "";
    const companyName = typeof body.companyName === "string" ? body.companyName.trim() : "";

    const isInternalLogo = logoUrl.startsWith("/") && !logoUrl.startsWith("//");
    const isRemoteLogo = /^https?:\/\//i.test(logoUrl);
    if ((!isInternalLogo && !isRemoteLogo) || logoUrl.length > 500) {
      return NextResponse.json({ error: "Logo phai la duong dan noi bo bat dau bang / hoac URL http/https hop le." }, { status: 400 });
    }    if (!logoAlt || logoAlt.length > 160 || !companyName || companyName.length > 120) {
      return NextResponse.json({ error: "Tên công ty hoặc mô tả logo không hợp lệ." }, { status: 400 });
    }

    await saveSiteChromeSettings({
      [SITE_CHROME_SETTING_KEYS.headerLogoUrl]: logoUrl,
      [SITE_CHROME_SETTING_KEYS.headerLogoAlt]: logoAlt,
      [SITE_CHROME_SETTING_KEYS.headerCompanyName]: companyName,
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update header configuration:", error);
    return NextResponse.json({ error: "Không thể lưu cấu hình Header." }, { status: 500 });
  }
}

