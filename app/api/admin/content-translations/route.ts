import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/adminAuth";
import { normalizeLocale } from "@/lib/i18n/config";

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType") || undefined;
    const entityId = searchParams.get("entityId");
    const where: { entityType?: string; entityId?: number } = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = Number(entityId);
    const translations = await prisma.contentTranslation.findMany({ where, orderBy: { updatedAt: "desc" } });
    return NextResponse.json({ success: true, translations });
  } catch (error) {
    console.error("Failed to load content translations:", error);
    return NextResponse.json({ error: "Failed to load content translations." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const entityType = body.entityType === "package" ? "package" : "post";
    const entityId = Number(body.entityId);
    const locale = normalizeLocale(body.locale);
    if (!Number.isInteger(entityId) || locale === "vi") {
      return NextResponse.json({ error: "Invalid translation target." }, { status: 400 });
    }
    const fields = body.fields && typeof body.fields === "object" ? body.fields : {};
    const status = ["machine", "reviewed", "published"].includes(body.status) ? body.status : "reviewed";
    const sourceHash = String(body.sourceHash || "manual");
    const translation = await prisma.contentTranslation.upsert({
      where: { entityType_entityId_locale: { entityType, entityId, locale } },
      update: { fields, status, sourceHash },
      create: { entityType, entityId, locale, fields, status, sourceHash },
    });
    return NextResponse.json({ success: true, translation });
  } catch (error) {
    console.error("Failed to save content translation:", error);
    return NextResponse.json({ error: "Failed to save content translation." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid translation id." }, { status: 400 });
    await prisma.contentTranslation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete content translation:", error);
    return NextResponse.json({ error: "Failed to delete content translation." }, { status: 500 });
  }
}
