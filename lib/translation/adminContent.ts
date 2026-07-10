import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export type AdminContentEntityType = "post" | "package" | "local_specialty" | "local_specialty_detail";
export type AdminContentTranslationPayload = Record<string, Record<string, unknown>>;

export const REQUIRED_ADMIN_CONTENT_LOCALES = ["en", "zh-CN"] as const;

const REQUIRED_FIELDS: Record<AdminContentEntityType, string[]> = {
  post: ["title", "excerpt", "summary"],
  package: ["name", "destination", "duration", "summary", "description"],
  local_specialty: ["name", "description"],
  local_specialty_detail: ["overview"],
};

function hashSource(value: unknown) {
  const text = JSON.stringify(value ?? {});
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return `manual-${Math.abs(hash)}`;
}

function hasValue(value: unknown) {
  return typeof value === "string" ? value.trim().length > 0 : value !== undefined && value !== null;
}

function normalizeFields(fields: unknown) {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return {};
  return Object.fromEntries(
    Object.entries(fields as Record<string, unknown>).filter(([, value]) => hasValue(value)),
  );
}

export async function getContentTranslations(entityType: AdminContentEntityType, entityId: number) {
  const rows = await prisma.contentTranslation.findMany({
    where: { entityType, entityId },
    orderBy: { locale: "asc" },
  });

  return Object.fromEntries(rows.map((row) => [row.locale, row.fields || {}]));
}

export function validateRequiredTranslations(
  entityType: AdminContentEntityType,
  translations: AdminContentTranslationPayload,
) {
  const missing: string[] = [];
  const requiredFields = REQUIRED_FIELDS[entityType];

  for (const locale of REQUIRED_ADMIN_CONTENT_LOCALES) {
    const fields = normalizeFields(translations?.[locale]);
    for (const field of requiredFields) {
      if (!hasValue(fields[field])) missing.push(`${locale}.${field}`);
    }
  }

  return missing;
}

export async function saveContentTranslations(
  entityType: AdminContentEntityType,
  entityId: number,
  translations: AdminContentTranslationPayload,
  source?: Record<string, unknown>,
) {
  const sourceHash = hashSource(source);
  const saved = [];

  for (const locale of REQUIRED_ADMIN_CONTENT_LOCALES) {
    const fields = normalizeFields(translations?.[locale]);
    if (Object.keys(fields).length === 0) continue;

    saved.push(
      await prisma.contentTranslation.upsert({
        where: { entityType_entityId_locale: { entityType, entityId, locale } },
        update: { fields: fields as Prisma.InputJsonValue, sourceHash, status: "published" },
        create: { entityType, entityId, locale, fields: fields as Prisma.InputJsonValue, sourceHash, status: "published" },
      }),
    );
  }

  return saved;
}
