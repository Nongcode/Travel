import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/adminAuth";
import { getContentTranslations, saveContentTranslations } from "@/lib/translation/adminContent";

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

function formatDetail(detail: any) {
  if (!detail) return null;
  return {
    id: detail.id,
    specialtyId: detail.specialtyId,
    bannerImageUrl: detail.bannerImageUrl || "",
    overview: detail.overview || "",
    history: detail.history || "",
    ingredients: detail.ingredients || "",
    howToUse: detail.howToUse || "",
    preservation: detail.preservation || "",
    highlights: Array.isArray(detail.highlights) ? detail.highlights : [],
    seoTitle: detail.seoTitle || "",
    seoDescription: detail.seoDescription || "",
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const specialtyId = await readId(context);
    if (!specialtyId) return NextResponse.json({ error: "Invalid specialty id." }, { status: 400 });

    const specialty = await prisma.localSpecialty.findUnique({ where: { id: specialtyId }, include: { detail: true } });
    if (!specialty) return NextResponse.json({ error: "Specialty not found." }, { status: 404 });

    const detailFormatted = formatDetail(specialty.detail);
    
    let translations = {};
    if (specialty.detail) {
       translations = await getContentTranslations("local_specialty_detail", specialty.detail.id);
    }

    return NextResponse.json({
      success: true,
      specialty: { id: specialty.id, name: specialty.name, slug: specialty.slug },
      detail: detailFormatted,
      translations: translations,
    });
  } catch (error) {
    console.error("Failed to load local specialty detail:", error);
    return NextResponse.json({ error: "Failed to load local specialty detail." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const specialtyId = await readId(context);
    if (!specialtyId) return NextResponse.json({ error: "Invalid specialty id." }, { status: 400 });

    const existingSpecialty = await prisma.localSpecialty.findUnique({ where: { id: specialtyId } });
    if (!existingSpecialty) return NextResponse.json({ error: "Specialty not found." }, { status: 404 });

    const body = await request.json();
    const detail = await prisma.localSpecialtyDetail.upsert({
      where: { specialtyId },
      update: {
        bannerImageUrl: asString(body.bannerImageUrl),
        overview: asString(body.overview),
        history: asString(body.history),
        ingredients: asString(body.ingredients),
        howToUse: asString(body.howToUse),
        preservation: asString(body.preservation),
        highlights: asJsonArray(body.highlights),
        seoTitle: asString(body.seoTitle),
        seoDescription: asString(body.seoDescription),
      },
      create: {
        specialtyId,
        bannerImageUrl: asString(body.bannerImageUrl),
        overview: asString(body.overview),
        history: asString(body.history),
        ingredients: asString(body.ingredients),
        howToUse: asString(body.howToUse),
        preservation: asString(body.preservation),
        highlights: asJsonArray(body.highlights),
        seoTitle: asString(body.seoTitle),
        seoDescription: asString(body.seoDescription),
      },
    });

    if (body.translations) {
      await saveContentTranslations("local_specialty_detail", detail.id, body.translations, detail);
    }

    return NextResponse.json({ success: true, detail: formatDetail(detail) });
  } catch (error) {
    console.error("Failed to save local specialty detail:", error);
    return NextResponse.json({ error: "Failed to save local specialty detail." }, { status: 500 });
  }
}
