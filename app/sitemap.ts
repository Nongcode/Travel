import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { absoluteUrl, sitemapAlternates } from "@/lib/seo";

const legacyDecoder = new TextDecoder("windows-1252");
const toLegacyMojibake = (value: string) => legacyDecoder.decode(Buffer.from(value, "utf8"));
const toDoubleLegacyMojibake = (value: string) => toLegacyMojibake(toLegacyMojibake(value));

const PUBLISHED_STATUS = "Đã xuất bản";
const PUBLISHED_STATUSES = [PUBLISHED_STATUS, toLegacyMojibake(PUBLISHED_STATUS), toDoubleLegacyMojibake(PUBLISHED_STATUS)];
const OPEN_STATUS = "Đang mở";
const VISIBLE_STATUS = "Hiển thị";
const OPEN_STATUSES = [OPEN_STATUS, toLegacyMojibake(OPEN_STATUS), toDoubleLegacyMojibake(OPEN_STATUS)];
const VISIBLE_STATUSES = [VISIBLE_STATUS, toLegacyMojibake(VISIBLE_STATUS), toDoubleLegacyMojibake(VISIBLE_STATUS)];

function sitemapEntry(path: string, lastModified: Date, changeFrequency: "daily" | "weekly" | "monthly", priority: number) {
  return {
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
    alternates: sitemapAlternates(path),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post.findMany({
    where: { status: { in: PUBLISHED_STATUSES } },
    select: { id: true, updatedAt: true },
  });

  const packages = await prisma.package.findMany({
    where: { status: { in: OPEN_STATUSES } },
    select: { slug: true, updatedAt: true },
  });

  const specialties = await prisma.localSpecialty.findMany({
    where: { status: { in: VISIBLE_STATUSES } },
    select: { slug: true, updatedAt: true },
  });

  const now = new Date();
  const routes = [
    sitemapEntry("/", now, "daily", 1),
    sitemapEntry("/goi-du-lich", now, "daily", 0.9),
    sitemapEntry("/huong-dan-visa", now, "daily", 0.8),
    sitemapEntry("/tin-tuc", now, "daily", 0.8),
    sitemapEntry("/dac-san", now, "daily", 0.8),
    sitemapEntry("/lien-he", now, "daily", 0.5),
  ];

  const postRoutes = posts.map((post) => sitemapEntry(`/tin-tuc/${post.id}`, post.updatedAt, "weekly", 0.8));
  const packageRoutes = packages.map((pkg) => sitemapEntry(`/goi-du-lich/${pkg.slug}`, pkg.updatedAt, "weekly", 0.8));
  const specialtyRoutes = specialties.map((spec) => sitemapEntry(`/dac-san/${spec.slug}`, spec.updatedAt, "monthly", 0.8));

  return [...routes, ...postRoutes, ...packageRoutes, ...specialtyRoutes];
}