import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/adminAuth";
import { normalizeLocale, SupportedLocale } from "@/lib/i18n/config";
import { autoTranslateEntity } from "@/lib/translation/content";

type EntityType = "post" | "package";

function normalizeEntityTypes(value: unknown): EntityType[] {
  if (value === "all") return ["post", "package"];
  if (value === "package") return ["package"];
  return ["post"];
}

function normalizeLocales(value: unknown): SupportedLocale[] {
  const rawLocales = Array.isArray(value) ? value : [value || "en", "zh-CN"];
  return Array.from(new Set(rawLocales.map((locale) => normalizeLocale(String(locale))))).filter(
    (locale): locale is SupportedLocale => locale !== "vi",
  );
}

async function getTargetIds(entityType: EntityType, body: Record<string, unknown>) {
  if (body.all === true) {
    if (entityType === "post") {
      const rows = await prisma.post.findMany({ select: { id: true }, orderBy: { id: "asc" } });
      return rows.map((row) => row.id);
    }
    const rows = await prisma.package.findMany({ select: { id: true }, orderBy: { id: "asc" } });
    return rows.map((row) => row.id);
  }

  if (Array.isArray(body.entityIds)) {
    return body.entityIds.map(Number).filter(Number.isInteger);
  }

  const entityId = Number(body.entityId);
  if (Number.isInteger(entityId)) return [entityId];

  if (body.entityType === "all") {
    if (entityType === "post") {
      const rows = await prisma.post.findMany({ select: { id: true }, orderBy: { id: "asc" } });
      return rows.map((row) => row.id);
    }
    const rows = await prisma.package.findMany({ select: { id: true }, orderBy: { id: "asc" } });
    return rows.map((row) => row.id);
  }

  return [];
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const entityTypes = normalizeEntityTypes(body.entityType);
    const locales = normalizeLocales(body.locales || body.locale);
    if (locales.length === 0) return NextResponse.json({ error: "Invalid target locale." }, { status: 400 });

    const translations = [];
    const failures: Array<{ entityType: EntityType; entityId: number; locale: string; error: string }> = [];

    for (const entityType of entityTypes) {
      const ids = await getTargetIds(entityType, body);
      if (ids.length === 0) return NextResponse.json({ error: "Invalid entity id." }, { status: 400 });

      for (const entityId of ids) {
        for (const locale of locales) {
          try {
            translations.push(await autoTranslateEntity(entityType, entityId, locale));
          } catch (error) {
            const message = error instanceof Error ? error.message : "AUTO_TRANSLATE_FAILED";
            if (message === "GOOGLE_TRANSLATE_API_KEY_MISSING" || message === "UNSUPPORTED_TRANSLATION_PROVIDER") throw error;
            failures.push({ entityType, entityId, locale, error: message });
          }
        }
      }
    }

    return NextResponse.json({
      success: failures.length === 0,
      translatedCount: translations.length,
      failedCount: failures.length,
      translations,
      failures,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to auto translate content.";
    console.error("Failed to auto translate content:", error);
    const status = message === "GOOGLE_TRANSLATE_API_KEY_MISSING" || message === "UNSUPPORTED_TRANSLATION_PROVIDER" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

