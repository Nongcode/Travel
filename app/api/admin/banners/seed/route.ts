import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_HOMEPAGE_VIDEO = "/Drone_flight_Vietnam_landscapes_202606220932.mp4";

async function setBannerMediaType(id: number, mediaType: string) {
  await prisma.$executeRaw`UPDATE banners SET media_type = ${mediaType} WHERE id = ${id}`;
}

export async function GET() {
  const existingVideoBanner = await prisma.banner.findFirst({
    where: {
      bannerType: "homepage",
      imageUrl: DEFAULT_HOMEPAGE_VIDEO,
    },
  });

  const data = {
    title: "Những chuyến đi cùng bạn như một kí ức đẹp không thể quên.",
    subtitle:
      "Blog du lịch hiện đại dành cho người muốn tìm cảm hứng, đọc kinh nghiệm thực tế và để lại thông tin khi cần gợi ý lịch trình phù hợp.",
    imageUrl: DEFAULT_HOMEPAGE_VIDEO,
    bannerType: "homepage",
    status: "Đang mở",
  };

  const banner = existingVideoBanner
    ? await prisma.banner.update({
        where: { id: existingVideoBanner.id },
        data,
      })
    : await prisma.banner.create({ data });

  await setBannerMediaType(banner.id, "video");

  return NextResponse.json({ success: true, banner: { ...banner, mediaType: "video" } });
}