import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const legacyDecoder = new TextDecoder("windows-1252");
const toLegacyMojibake = (value: string) => legacyDecoder.decode(Buffer.from(value, "utf8"));
const toDoubleLegacyMojibake = (value: string) => toLegacyMojibake(toLegacyMojibake(value));

const PUBLISHED_STATUS = "Đã xuất bản";
const PUBLISHED_STATUSES = [PUBLISHED_STATUS, toLegacyMojibake(PUBLISHED_STATUS), toDoubleLegacyMojibake(PUBLISHED_STATUS)];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://timesgreen.net";

  const posts = await prisma.post.findMany({
    where: { status: { in: PUBLISHED_STATUSES } },
    select: { id: true, updatedAt: true },
  });

  const packages = await prisma.package.findMany({
    where: { status: "Đang mở" },
    select: { slug: true, updatedAt: true },
  });

  const specialties = await prisma.localSpecialty.findMany({
    where: { status: "Hiển thị" },
    select: { slug: true, updatedAt: true },
  });

  const routes = [
    { path: "", priority: 1 },
    { path: "/goi-du-lich", priority: 0.9 },
    { path: "/huong-dan-visa", priority: 0.8 },
    { path: "/tin-tuc", priority: 0.8 },
    { path: "/dac-san", priority: 0.8 },
    { path: "/lien-he", priority: 0.5 },
  ].map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route.priority,
  }));

  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/tin-tuc/${post.id}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const packageRoutes = packages.map((pkg) => ({
    url: `${baseUrl}/goi-du-lich/${pkg.slug}`,
    lastModified: pkg.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const specialtyRoutes = specialties.map((spec) => ({
    url: `${baseUrl}/dac-san/${spec.slug}`,
    lastModified: spec.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...routes, ...postRoutes, ...packageRoutes, ...specialtyRoutes];
}
