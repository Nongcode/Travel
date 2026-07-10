import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const BANNER_MEDIA_DIR = path.join(PUBLIC_DIR, "banners");
const DEFAULT_HOMEPAGE_VIDEO = "/Drone_flight_Vietnam_landscapes_202606220932.mp4";
const legacyDecoder = new TextDecoder("windows-1252");
const toLegacyMojibake = (value: string) => legacyDecoder.decode(Buffer.from(value, "utf8"));
const toDoubleLegacyMojibake = (value: string) => toLegacyMojibake(toLegacyMojibake(value));

const OPEN_STATUS = "\u0110ang m\u1edf";
const CLOSED_STATUS = "T\u1ea1m \u0111\u00f3ng";
const LEGACY_OPEN_STATUSES = [toLegacyMojibake(OPEN_STATUS), toDoubleLegacyMojibake(OPEN_STATUS)];
const LEGACY_CLOSED_STATUSES = [toLegacyMojibake(CLOSED_STATUS), toDoubleLegacyMojibake(CLOSED_STATUS)];
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".mp4", ".webm", ".mov"]);
const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

type BannerPayload = {
  id?: string;
  type?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
  mediaType?: string;
  status?: string;
  uploadedImage?: string;
  uploadedMediaType?: string;
};

function verifyAdminSession(request: NextRequest) {
  const tokenCookie = request.cookies.get("admin_token");
  if (!tokenCookie) return null;

  const decoded = verifyToken(tokenCookie.value);
  if (!decoded) return null;

  return decoded;
}

function normalizeStatus(status?: string | null) {
  if (!status) return OPEN_STATUS;
  if (LEGACY_OPEN_STATUSES.includes(status)) return OPEN_STATUS;
  if (LEGACY_CLOSED_STATUSES.includes(status)) return CLOSED_STATUS;
  return status;
}

function normalizeMediaType(mediaType?: string | null, imageUrl?: string | null) {
  if (mediaType === "video" || mediaType === "image") return mediaType;
  const ext = imageUrl ? path.extname(imageUrl.split("?")[0]).toLowerCase() : "";
  return [".mp4", ".webm", ".mov"].includes(ext) ? "video" : "image";
}

async function setBannerMediaType(id: number, mediaType: string) {
  await prisma.$executeRaw`UPDATE banners SET media_type = ${mediaType} WHERE id = ${id}`;
}

function formatBanner(banner: {
  id: number;
  bannerType: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  mediaType?: string | null;
  status: string;
}) {
  return {
    id: banner.id,
    type: banner.bannerType,
    title: banner.title || "",
    subtitle: banner.subtitle || "",
    image: banner.imageUrl,
    link: banner.linkUrl || "",
    mediaType: normalizeMediaType(banner.mediaType, banner.imageUrl),
    status: normalizeStatus(banner.status),
  };
}

function cleanText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return undefined;
}

function cleanOptionalText(value: unknown) {
  const cleaned = cleanText(value);
  return cleaned ? cleaned : null;
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : undefined;
}

function inferMediaTypeFromFile(file: File) {
  if (file.type.startsWith("video/")) return "video";
  return "image";
}

function assertSafePublicPath(publicUrl: string) {
  if (!publicUrl.startsWith("/") || publicUrl.startsWith("//")) return null;

  const decodedPath = decodeURIComponent(publicUrl.split(/[?#]/)[0]);
  const absolutePath = path.resolve(PUBLIC_DIR, `.${decodedPath}`);
  const relativePath = path.relative(PUBLIC_DIR, absolutePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) return null;
  return absolutePath;
}

async function saveBannerFile(file: File) {
  const originalExt = path.extname(file.name).toLowerCase();
  const ext = ALLOWED_EXTENSIONS.has(originalExt) ? originalExt : EXTENSION_BY_MIME[file.type];

  if (!ext) {
    throw new Error("UNSUPPORTED_FILE_TYPE");
  }

  const baseName = path
    .basename(file.name, originalExt)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "banner";
  const fileName = `${baseName}-${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
  const diskPath = path.join(BANNER_MEDIA_DIR, fileName);

  await fs.mkdir(BANNER_MEDIA_DIR, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(diskPath, bytes);

  return {
    imageUrl: `/banners/${fileName}`,
    mediaType: inferMediaTypeFromFile(file),
  };
}

async function parseBannerRequest(request: NextRequest): Promise<BannerPayload> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const fileValue = formData.get("file");
    const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
    const uploaded = file ? await saveBannerFile(file) : null;

    return {
      id: getFormString(formData, "id"),
      type: getFormString(formData, "type"),
      title: getFormString(formData, "title"),
      subtitle: getFormString(formData, "subtitle"),
      image: getFormString(formData, "image"),
      link: getFormString(formData, "link"),
      mediaType: getFormString(formData, "mediaType"),
      status: getFormString(formData, "status"),
      uploadedImage: uploaded?.imageUrl,
      uploadedMediaType: uploaded?.mediaType,
    };
  }

  const body = await request.json().catch(() => ({}));
  return {
    id: cleanText(body.id),
    type: cleanText(body.type),
    title: cleanText(body.title),
    subtitle: cleanText(body.subtitle),
    image: cleanText(body.image),
    link: cleanText(body.link),
    mediaType: cleanText(body.mediaType),
    status: cleanText(body.status),
  };
}

async function deletePublicMediaIfUnused(imageUrl: string, skipBannerId?: number) {
  if (!imageUrl || imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return;

  const diskPath = assertSafePublicPath(imageUrl);
  if (!diskPath) return;

  const stillUsed = await prisma.banner.count({
    where: {
      imageUrl,
      ...(skipBannerId ? { id: { not: skipBannerId } } : {}),
    },
  });

  if (stillUsed > 0) return;

  await fs.unlink(diskPath).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") {
      console.error("Lỗi khi xóa file banner:", error);
    }
  });
}

async function ensureDefaultHomepageBanner() {
  const defaultPath = assertSafePublicPath(DEFAULT_HOMEPAGE_VIDEO);
  if (!defaultPath) return null;

  const exists = await fs
    .access(defaultPath)
    .then(() => true)
    .catch(() => false);

  if (!exists) return null;

  const existingDefaultBanner = await prisma.banner.findFirst({
    where: {
      bannerType: "homepage",
      imageUrl: DEFAULT_HOMEPAGE_VIDEO,
    },
  });

  if (existingDefaultBanner) {
    await setBannerMediaType(existingDefaultBanner.id, "video");
    return { ...existingDefaultBanner, mediaType: "video" };
  }

  const defaultBanner = await prisma.banner.create({
    data: {
      bannerType: "homepage",
      title: "Những chuyến đi cùng bạn như một kí ức đẹp không thể quên.",
      subtitle:
        "Blog du lịch hiện đại dành cho người muốn tìm cảm hứng, đọc kinh nghiệm thực tế và để lại thông tin khi cần gợi ý lịch trình phù hợp.",
      imageUrl: DEFAULT_HOMEPAGE_VIDEO,
      status: OPEN_STATUS,
    },
  });
  await setBannerMediaType(defaultBanner.id, "video");
  return { ...defaultBanner, mediaType: "video" };
}

// GET: Lấy danh sách banner, có thể lọc theo loại.
export async function GET(request: NextRequest) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const whereClause = type ? { bannerType: type } : {};

    if (type === "homepage") {
      await ensureDefaultHomepageBanner();
    }

    const banners = await prisma.banner.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, banners: banners.map(formatBanner) });
  } catch (error) {
    console.error("Lỗi khi tải danh sách banner:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải danh sách banner." }, { status: 500 });
  }
}

// POST: Thêm banner mới. DB chỉ lưu đường dẫn file, không lưu binary/base64.
export async function POST(request: NextRequest) {
  let uploadedImage: string | undefined;

  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const payload = await parseBannerRequest(request);
    uploadedImage = payload.uploadedImage;
    const imageUrl = payload.uploadedImage || payload.image;

    if (!imageUrl) {
      return NextResponse.json({ error: "Vui lòng chọn file hoặc nhập đường dẫn ảnh/video." }, { status: 400 });
    }

    const newBanner = await prisma.banner.create({
      data: {
        bannerType: payload.type || "homepage",
        title: cleanOptionalText(payload.title),
        subtitle: cleanOptionalText(payload.subtitle),
        imageUrl,
        linkUrl: cleanOptionalText(payload.link),
        status: normalizeStatus(payload.status),
      },
    });

    const nextMediaType = normalizeMediaType(payload.uploadedMediaType || payload.mediaType, imageUrl);
    await setBannerMediaType(newBanner.id, nextMediaType);

    return NextResponse.json({ success: true, banner: formatBanner({ ...newBanner, mediaType: nextMediaType }) });
  } catch (error) {
    if (uploadedImage) await deletePublicMediaIfUnused(uploadedImage);
    if (error instanceof Error && error.message === "UNSUPPORTED_FILE_TYPE") {
      return NextResponse.json({ error: "Định dạng file không được hỗ trợ." }, { status: 400 });
    }
    console.error("Lỗi khi thêm banner:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi thêm banner." }, { status: 500 });
  }
}

// PUT: Cập nhật banner. Nếu upload file mới, file cũ sẽ được xóa khi không còn banner nào dùng.
export async function PUT(request: NextRequest) {
  let uploadedImage: string | undefined;

  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const payload = await parseBannerRequest(request);
    uploadedImage = payload.uploadedImage;

    if (!payload.id) {
      return NextResponse.json({ error: "Thiếu ID banner." }, { status: 400 });
    }

    const bannerId = Number(payload.id);
    if (!Number.isInteger(bannerId)) {
      return NextResponse.json({ error: "ID banner không hợp lệ." }, { status: 400 });
    }

    const existingBanner = await prisma.banner.findUnique({
      where: { id: bannerId },
    });

    if (!existingBanner) {
      return NextResponse.json({ error: "Banner không tồn tại." }, { status: 404 });
    }

    const nextImageUrl = payload.uploadedImage || payload.image || existingBanner.imageUrl;
    const updatedBanner = await prisma.banner.update({
      where: { id: bannerId },
      data: {
        bannerType: payload.type !== undefined ? payload.type : existingBanner.bannerType,
        title: payload.title !== undefined ? cleanOptionalText(payload.title) : existingBanner.title,
        subtitle: payload.subtitle !== undefined ? cleanOptionalText(payload.subtitle) : existingBanner.subtitle,
        imageUrl: nextImageUrl,
        linkUrl: payload.link !== undefined ? cleanOptionalText(payload.link) : existingBanner.linkUrl,
        status: payload.status !== undefined ? normalizeStatus(payload.status) : normalizeStatus(existingBanner.status),
      },
    });

    const currentMediaType = "mediaType" in existingBanner ? existingBanner.mediaType : undefined;
    const nextMediaType =
      payload.uploadedMediaType || payload.mediaType !== undefined
        ? normalizeMediaType(payload.uploadedMediaType || payload.mediaType, nextImageUrl)
        : normalizeMediaType(currentMediaType, nextImageUrl);
    await setBannerMediaType(updatedBanner.id, nextMediaType);

    if (existingBanner.imageUrl !== updatedBanner.imageUrl) {
      await deletePublicMediaIfUnused(existingBanner.imageUrl, updatedBanner.id);
    }

    return NextResponse.json({ success: true, banner: formatBanner({ ...updatedBanner, mediaType: nextMediaType }) });
  } catch (error) {
    if (uploadedImage) await deletePublicMediaIfUnused(uploadedImage);
    if (error instanceof Error && error.message === "UNSUPPORTED_FILE_TYPE") {
      return NextResponse.json({ error: "Định dạng file không được hỗ trợ." }, { status: 400 });
    }
    console.error("Lỗi khi cập nhật banner:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật banner." }, { status: 500 });
  }
}

// DELETE: Xóa banner và xóa file local nếu file đó không còn được banner khác sử dụng.
export async function DELETE(request: NextRequest) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID banner." }, { status: 400 });
    }

    const bannerId = Number(id);
    if (!Number.isInteger(bannerId)) {
      return NextResponse.json({ error: "ID banner không hợp lệ." }, { status: 400 });
    }

    const existingBanner = await prisma.banner.findUnique({
      where: { id: bannerId },
    });

    if (!existingBanner) {
      return NextResponse.json({ error: "Banner không tồn tại." }, { status: 404 });
    }

    await prisma.banner.delete({
      where: { id: bannerId },
    });
    await deletePublicMediaIfUnused(existingBanner.imageUrl);

    return NextResponse.json({ success: true, message: "?? x?a banner." });
  } catch (error) {
    console.error("Lỗi khi xóa banner:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa banner." }, { status: 500 });
  }
}
