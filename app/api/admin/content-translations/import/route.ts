import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import type { InputJsonValue } from "@prisma/client/runtime/client";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/adminAuth";
import { normalizeLocale } from "@/lib/i18n/config";
import { columnToPath, ContentEntityType, extractTranslatableFields, getSourceEntity, setTranslationPath } from "@/lib/translation/content";

type ImportRow = {
  entityType?: string;
  entityId?: string | number;
  locale?: string;
  path?: string;
  translatedText?: string;
  value?: string;
  status?: string;
};

type ImportGroup = {
  entityType: ContentEntityType;
  entityId: number;
  locale: string;
  status: string;
  fields: Record<string, unknown>;
};

function validEntityType(value: unknown): ContentEntityType | null {
  return value === "package" ? "package" : value === "post" ? "post" : null;
}

function normalizeStatus(value: unknown) {
  return ["machine", "reviewed", "published"].includes(String(value)) ? String(value) : "reviewed";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>) {
  const output: Record<string, unknown> = Array.isArray(target) ? [...target] as unknown as Record<string, unknown> : { ...target };
  for (const [key, value] of Object.entries(source)) {
    const current = output[key];
    if (isPlainObject(current) && isPlainObject(value)) output[key] = deepMerge(current, value);
    else if (Array.isArray(current) && Array.isArray(value)) output[key] = deepMerge(current as unknown as Record<string, unknown>, value as unknown as Record<string, unknown>);
    else output[key] = value;
  }
  return output;
}

function readRows(buffer: Buffer, filename: string) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json<ImportRow>(sheet, { defval: "" });
  if (rows.length > 0) return rows;

  if (filename.toLowerCase().endsWith(".csv")) {
    const csvWorkbook = XLSX.read(buffer.toString("utf8"), { type: "string" });
    const csvSheet = csvWorkbook.Sheets[csvWorkbook.SheetNames[0]];
    return csvSheet ? XLSX.utils.sheet_to_json<ImportRow>(csvSheet, { defval: "" }) : [];
  }
  return [];
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const formData = await request.formData();
    const file = formData.get("file");
    const defaultStatus = normalizeStatus(formData.get("status") || "reviewed");
    if (!(file instanceof File)) return NextResponse.json({ error: "Thiếu file CSV/XLSX." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const rows = readRows(buffer, file.name);
    if (rows.length === 0) return NextResponse.json({ error: "File không có dữ liệu." }, { status: 400 });

    const groups = new Map<string, ImportGroup>();
    let skipped = 0;

    for (const row of rows) {
      const entityType = validEntityType(row.entityType);
      const entityId = Number(row.entityId);
      const locale = normalizeLocale(String(row.locale || ""));
      const path = columnToPath(String(row.path || ""));
      const translatedText = String(row.translatedText || row.value || "").trim();
      if (!entityType || !Number.isInteger(entityId) || locale === "vi" || path.length === 0 || !translatedText) {
        skipped += 1;
        continue;
      }

      const key = `${entityType}:${entityId}:${locale}`;
      if (!groups.has(key)) {
        groups.set(key, { entityType, entityId, locale, status: normalizeStatus(row.status || defaultStatus), fields: {} });
      }
      setTranslationPath(groups.get(key)!.fields, path, translatedText);
    }

    const saved = [];
    for (const group of groups.values()) {
      const entity = await getSourceEntity(group.entityType, group.entityId);
      if (!entity) {
        skipped += 1;
        continue;
      }
      const { sourceHash } = extractTranslatableFields(group.entityType, entity as Record<string, unknown>);
      const existing = await prisma.contentTranslation.findUnique({
        where: { entityType_entityId_locale: { entityType: group.entityType, entityId: group.entityId, locale: group.locale } },
      });
      const existingFields = (existing?.fields && typeof existing.fields === "object" ? existing.fields : {}) as Record<string, unknown>;
      const fields = deepMerge(existingFields, group.fields) as InputJsonValue;
      saved.push(await prisma.contentTranslation.upsert({
        where: { entityType_entityId_locale: { entityType: group.entityType, entityId: group.entityId, locale: group.locale } },
        update: { fields, sourceHash, status: group.status },
        create: { entityType: group.entityType, entityId: group.entityId, locale: group.locale, fields, sourceHash, status: group.status },
      }));
    }

    return NextResponse.json({ success: true, importedCount: saved.length, skippedCount: skipped, translations: saved });
  } catch (error) {
    console.error("Failed to import content translations:", error);
    return NextResponse.json({ error: "Không import được file dịch." }, { status: 500 });
  }
}




