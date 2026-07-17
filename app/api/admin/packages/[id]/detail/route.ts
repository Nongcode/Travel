import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/adminAuth";

type RouteContext = { params: Promise<{ id: string }> | { id: string } };

async function readId(context: RouteContext) {
  const rawParams = context.params as { id: string } | Promise<{ id: string }>;
  const params = typeof (rawParams as Promise<{ id: string }>).then === "function" ? await rawParams : (rawParams as { id: string });
  const id = Number(params.id);
  return Number.isInteger(id) ? id : null;
}

function asString(value: unknown) {
  return value === undefined || value === null ? null : String(value);
}

function asJsonArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function formatDetail(detail: Awaited<ReturnType<typeof prisma.packageDetail.findUnique>>) {
  if (!detail) return null;
  return {
    id: detail.id,
    packageId: detail.packageId,
    bannerImageUrl: detail.bannerImageUrl || "",
    gallery: Array.isArray(detail.gallery) ? detail.gallery : [],
    overview: detail.overview || "",
    highlights: Array.isArray(detail.highlights) ? detail.highlights : [],
    offers: Array.isArray(detail.offers) ? detail.offers : [],
    included: Array.isArray(detail.included) ? detail.included : [],
    itinerary: Array.isArray(detail.itinerary) ? detail.itinerary : [],
    benefits: Array.isArray(detail.benefits) ? detail.benefits : [],
    consultTitle: detail.consultTitle || "",
    consultCopy: detail.consultCopy || "",
    consultPoints: Array.isArray(detail.consultPoints) ? detail.consultPoints : [],
    seoTitle: detail.seoTitle || "",
    seoDescription: detail.seoDescription || "",
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const packageId = await readId(context);
    if (!packageId) return NextResponse.json({ error: "Invalid package id." }, { status: 400 });

    const pkg = await prisma.package.findUnique({ where: { id: packageId }, include: { detail: true } });
    if (!pkg) return NextResponse.json({ error: "Package not found." }, { status: 404 });

    return NextResponse.json({
      success: true,
      package: { id: pkg.id, name: pkg.name, slug: pkg.slug },
      detail: formatDetail(pkg.detail),
    });
  } catch (error) {
    console.error("Failed to load package detail:", error);
    return NextResponse.json({ error: "Failed to load package detail." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const packageId = await readId(context);
    if (!packageId) return NextResponse.json({ error: "Invalid package id." }, { status: 400 });

    const existingPackage = await prisma.package.findUnique({ where: { id: packageId } });
    if (!existingPackage) return NextResponse.json({ error: "Package not found." }, { status: 404 });

    const body = await request.json();
    const detail = await prisma.packageDetail.upsert({
      where: { packageId },
      update: {
        bannerImageUrl: asString(body.bannerImageUrl),
        gallery: asJsonArray(body.gallery),
        overview: asString(body.overview),
        highlights: asJsonArray(body.highlights),
        offers: asJsonArray(body.offers),
        included: asJsonArray(body.included),
        itinerary: asJsonArray(body.itinerary),
        benefits: asJsonArray(body.benefits),
        consultTitle: asString(body.consultTitle),
        consultCopy: asString(body.consultCopy),
        consultPoints: asJsonArray(body.consultPoints),
        seoTitle: asString(body.seoTitle),
        seoDescription: asString(body.seoDescription),
      },
      create: {
        packageId,
        bannerImageUrl: asString(body.bannerImageUrl),
        gallery: asJsonArray(body.gallery),
        overview: asString(body.overview),
        highlights: asJsonArray(body.highlights),
        offers: asJsonArray(body.offers),
        included: asJsonArray(body.included),
        itinerary: asJsonArray(body.itinerary),
        benefits: asJsonArray(body.benefits),
        consultTitle: asString(body.consultTitle),
        consultCopy: asString(body.consultCopy),
        consultPoints: asJsonArray(body.consultPoints),
        seoTitle: asString(body.seoTitle),
        seoDescription: asString(body.seoDescription),
      },
    });

    return NextResponse.json({ success: true, detail: formatDetail(detail) });
  } catch (error) {
    console.error("Failed to save package detail:", error);
    return NextResponse.json({ error: "Failed to save package detail." }, { status: 500 });
  }
}

