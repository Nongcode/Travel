import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/adminApiSession";
import { saveSiteChromeSettings, SITE_CHROME_SETTING_KEYS } from "@/lib/siteChrome";

const SOCIAL_URL_FIELDS = ["facebook", "instagram", "twitter"] as const;

function isValidOptionalWebUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function PUT(request: NextRequest) {
  if (!getAdminApiSession(request)) {
    return NextResponse.json({ error: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const values = {
      brandName: typeof body.brandName === "string" ? body.brandName.trim() : "",
      description: typeof body.description === "string" ? body.description.trim() : "",
      address: typeof body.address === "string" ? body.address.trim() : "",
      phone: typeof body.phone === "string" ? body.phone.trim() : "",
      email: typeof body.email === "string" ? body.email.trim() : "",
      facebook: typeof body.facebook === "string" ? body.facebook.trim() : "",
      instagram: typeof body.instagram === "string" ? body.instagram.trim() : "",
      twitter: typeof body.twitter === "string" ? body.twitter.trim() : "",
      copyright: typeof body.copyright === "string" ? body.copyright.trim() : "",
    };

    if (!values.brandName || values.brandName.length > 120 || !values.description || values.description.length > 1000) {
      return NextResponse.json({ error: "Tên thương hiệu hoặc mô tả không hợp lệ." }, { status: 400 });
    }
    if (values.address.length > 500 || values.phone.length > 80 || values.email.length > 160 || values.copyright.length > 300) {
      return NextResponse.json({ error: "Thông tin liên hệ vượt quá độ dài cho phép." }, { status: 400 });
    }
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      return NextResponse.json({ error: "Email liên hệ không hợp lệ." }, { status: 400 });
    }
    if (SOCIAL_URL_FIELDS.some((field) => !isValidOptionalWebUrl(values[field]))) {
      return NextResponse.json({ error: "Đường dẫn mạng xã hội không hợp lệ." }, { status: 400 });
    }

    await saveSiteChromeSettings({
      [SITE_CHROME_SETTING_KEYS.footerBrandName]: values.brandName,
      [SITE_CHROME_SETTING_KEYS.footerDescription]: values.description,
      [SITE_CHROME_SETTING_KEYS.footerAddress]: values.address,
      [SITE_CHROME_SETTING_KEYS.footerPhone]: values.phone,
      [SITE_CHROME_SETTING_KEYS.footerEmail]: values.email,
      [SITE_CHROME_SETTING_KEYS.footerFacebook]: values.facebook,
      [SITE_CHROME_SETTING_KEYS.footerInstagram]: values.instagram,
      [SITE_CHROME_SETTING_KEYS.footerTwitter]: values.twitter,
      [SITE_CHROME_SETTING_KEYS.footerCopyright]: values.copyright,
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update footer configuration:", error);
    return NextResponse.json({ error: "Không thể lưu cấu hình Footer." }, { status: 500 });
  }
}
