import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/adminApiSession";
import {
  getSiteChromeConfig,
  saveSiteChromeSettings,
  SITE_CHROME_SETTING_KEYS,
} from "@/lib/siteChrome";

export const runtime = "nodejs";

const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const LOGO_DIRECTORY = path.join(process.cwd(), "public", "uploads", "logos");
const LOGO_PUBLIC_PREFIX = "/uploads/logos/";
const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function hasValidSignature(bytes: Buffer, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return (
      bytes.length >= 8 &&
      bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    );
  }
  if (mimeType === "image/webp") {
    return (
      bytes.length >= 12 &&
      bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      bytes.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  return false;
}

async function removePreviousUploadedLogo(logoUrl: string) {
  if (!logoUrl.startsWith(LOGO_PUBLIC_PREFIX)) return;

  const fileName = path.basename(logoUrl);
  const filePath = path.join(LOGO_DIRECTORY, fileName);
  await fs.unlink(filePath).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") {
      console.error("Failed to remove previous logo:", error);
    }
  });
}

export async function POST(request: NextRequest) {
  if (!getAdminApiSession(request)) {
    return NextResponse.json({ error: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
  }

  let newFilePath = "";

  try {
    const formData = await request.formData();
    const fileValue = formData.get("logo");

    if (!(fileValue instanceof File) || fileValue.size === 0) {
      return NextResponse.json({ error: "Vui lòng chọn file logo." }, { status: 400 });
    }
    if (fileValue.size > MAX_LOGO_SIZE) {
      return NextResponse.json({ error: "Logo không được vượt quá 5 MB." }, { status: 413 });
    }

    const extension = EXTENSION_BY_MIME[fileValue.type];
    if (!extension) {
      return NextResponse.json(
        { error: "Logo chỉ hỗ trợ định dạng PNG, JPG hoặc WebP." },
        { status: 415 },
      );
    }

    const bytes = Buffer.from(await fileValue.arrayBuffer());
    if (!hasValidSignature(bytes, fileValue.type)) {
      return NextResponse.json({ error: "Nội dung file logo không hợp lệ." }, { status: 400 });
    }

    const currentConfig = await getSiteChromeConfig();
    const fileName = `logo-${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;
    newFilePath = path.join(LOGO_DIRECTORY, fileName);
    const logoUrl = `${LOGO_PUBLIC_PREFIX}${fileName}`;

    await fs.mkdir(LOGO_DIRECTORY, { recursive: true });
    await fs.writeFile(newFilePath, bytes, { flag: "wx" });
    await saveSiteChromeSettings({
      [SITE_CHROME_SETTING_KEYS.headerLogoUrl]: logoUrl,
    });

    await removePreviousUploadedLogo(currentConfig.header.logoUrl);
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, logoUrl });
  } catch (error) {
    if (newFilePath) {
      await fs.unlink(newFilePath).catch(() => undefined);
    }
    console.error("Failed to upload header logo:", error);
    return NextResponse.json({ error: "Không thể tải logo lên máy chủ." }, { status: 500 });
  }
}
