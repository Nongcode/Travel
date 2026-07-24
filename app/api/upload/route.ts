import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/adminApiSession";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

function hasCloudinaryConfig() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  if (!getAdminApiSession(request)) {
    return NextResponse.json({ error: "Phien dang nhap khong hop le." }, { status: 401 });
  }

  if (!hasCloudinaryConfig()) {
    return NextResponse.json({ error: "Thieu cau hinh Cloudinary tren server." }, { status: 500 });
  }

  try {
    const data = await request.formData();
    const file = data.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Khong tim thay file tai len." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Dinh dang file khong duoc ho tro." }, { status: 415 });
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: "File khong duoc vuot qua 20 MB." }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<{ secure_url?: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "travel_uploads",
          resource_type: file.type.startsWith("video/") ? "video" : "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result || {});
        },
      );

      uploadStream.end(buffer);
    });

    if (!uploadResult.secure_url) {
      return NextResponse.json({ error: "Cloudinary khong tra ve URL file." }, { status: 502 });
    }

    return NextResponse.json({ url: uploadResult.secure_url }, { status: 200 });
  } catch (error) {
    console.error("Failed to upload asset to Cloudinary:", error);
    return NextResponse.json({ error: "Da xay ra loi trong qua trinh xu ly file." }, { status: 500 });
  }
}
