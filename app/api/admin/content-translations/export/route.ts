import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/adminAuth";
import { normalizeLocale } from "@/lib/i18n/config";
import { ContentEntityType, extractTranslatableFields, getSourceEntity, getTranslationPath, pathToColumn } from "@/lib/translation/content";

type ExportRow = {
  entityType: ContentEntityType;
  entityId: number;
  locale: string;
  path: string;
  sourceText: string;
  translatedText: string;
  status: string;
};

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (!/[",\r\n]/.test(text)) return text;
  return '"' + text.replace(/"/g, '""') + '"';
}

function toCsv(rows: ExportRow[]) {
  const headers = ["entityType", "entityId", "locale", "path", "sourceText", "translatedText", "status"];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header as keyof ExportRow])).join(","));
  }
  return "\uFEFF" + lines.join("\r\n");
}

function normalizeEntityTypes(value: string | null): ContentEntityType[] {
  if (value === "all" || !value) return ["post", "package"];
  return value === "package" ? ["package"] : ["post"];
}

async function getIds(entityType: ContentEntityType, entityId: string | null) {
  const id = Number(entityId);
  if (Number.isInteger(id)) return [id];
  if (entityType === "post") {
    const rows = await prisma.post.findMany({ select: { id: true }, orderBy: { id: "asc" } });
    return rows.map((row) => row.id);
  }
  const rows = await prisma.package.findMany({ select: { id: true }, orderBy: { id: "asc" } });
  return rows.map((row) => row.id);
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const locale = normalizeLocale(searchParams.get("locale") || "en");
    if (locale === "vi") return NextResponse.json({ error: "Locale đích không hợp lệ." }, { status: 400 });

    const rows: ExportRow[] = [];
    for (const entityType of normalizeEntityTypes(searchParams.get("entityType"))) {
      const ids = await getIds(entityType, searchParams.get("entityId"));
      for (const entityId of ids) {
        const entity = await getSourceEntity(entityType, entityId);
        if (!entity) continue;
        const { entries } = extractTranslatableFields(entityType, entity as Record<string, unknown>);
        const existing = await prisma.contentTranslation.findUnique({
          where: { entityType_entityId_locale: { entityType, entityId, locale } },
        });
        const fields = existing?.fields && typeof existing.fields === "object" ? existing.fields : {};
        for (const entry of entries) {
          rows.push({
            entityType,
            entityId,
            locale,
            path: pathToColumn(entry.path),
            sourceText: entry.value,
            translatedText: getTranslationPath(fields, entry.path),
            status: existing?.status || "reviewed",
          });
        }
      }
    }

    const csv = toCsv(rows);
    const filename = `vietvista-content-translations-${locale}-${Date.now()}.csv`;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Failed to export content translations:", error);
    return NextResponse.json({ error: "Không xuất được file dịch." }, { status: 500 });
  }
}
