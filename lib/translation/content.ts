/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { defaultPackageDetailContent } from "@/lib/packageDetailContent";
import { translateTexts } from "./googleTranslate";
import { normalizeLocale } from "@/lib/i18n/config";
import { normalizeLegacyText } from "@/lib/text/encoding";

const TRANSLATABLE_POST_FIELDS = ["title", "excerpt", "summary", "seoDescription", "readTime"] as const;
const TRANSLATABLE_PACKAGE_FIELDS = ["name", "destination", "duration", "summary", "description", "peopleNote"] as const;
const NON_TRANSLATABLE_JSON_KEYS = new Set(["url", "image", "imageUrl", "src", "href", "slug", "status", "price", "priceText", "id"]);

export type ContentEntityType = "post" | "package";
export type ContentTranslationPayload = Record<string, Record<string, unknown>>;

export const REQUIRED_CONTENT_LOCALES = ["en", "zh-CN"] as const;

const REQUIRED_FIELDS: Record<ContentEntityType, string[]> = {
  post: ["title", "excerpt", "summary"],
  package: ["name", "destination", "duration", "summary", "description"],
};

export type TextEntry = {
  path: string[];
  value: string;
};

function hashSource(value: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
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

export function pathToColumn(path: string[]) {
  return path.join(".");
}

export function columnToPath(path: string) {
  return path.split(".").map((item) => item.trim()).filter(Boolean);
}

export function setTranslationPath(target: Record<string, any>, path: string[], value: string) {
  let cursor: any = target;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const nextKey = path[i + 1];
    if (cursor[key] === undefined) cursor[key] = /^\d+$/.test(nextKey) ? [] : {};
    cursor = cursor[key];
  }
  cursor[path[path.length - 1]] = value;
}

export function getTranslationPath(source: unknown, path: string[]) {
  let cursor: any = source;
  for (const key of path) {
    if (cursor === null || cursor === undefined) return "";
    cursor = cursor[key];
  }
  return typeof cursor === "string" ? cursor : "";
}

export function normalizeSourceText(value: string) {
  return normalizeLegacyText(value);
}

function shouldTranslateString(value: string, key?: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (key && NON_TRANSLATABLE_JSON_KEYS.has(key)) return false;
  if (/^(https?:)?\/\//i.test(trimmed)) return false;
  if (/^\/[\w./-]+\.(png|jpe?g|webp|gif|svg|mp4|webm|mov)$/i.test(trimmed)) return false;
  return true;
}

function collectContentBlockTexts(blocks: unknown, root = "contentBlocks") {
  const entries: TextEntry[] = [];
  if (!Array.isArray(blocks)) return entries;

  blocks.forEach((block, index) => {
    if (!block || typeof block !== "object") return;
    const item = block as Record<string, any>;
    for (const field of ["text", "title", "caption", "author"] as const) {
      if (typeof item[field] === "string" && shouldTranslateString(item[field], field)) {
        entries.push({ path: [root, String(index), field], value: normalizeSourceText(item[field]) });
      }
    }
    if (Array.isArray(item.items)) {
      item.items.forEach((value, itemIndex) => {
        if (typeof value === "string" && shouldTranslateString(value)) {
          entries.push({ path: [root, String(index), "items", String(itemIndex)], value: normalizeSourceText(value) });
        }
      });
    }
  });
  return entries;
}

function collectJsonTexts(value: unknown, path: string[] = ["detailContent"]) {
  const entries: TextEntry[] = [];
  const key = path[path.length - 1];
  if (typeof value === "string") {
    if (shouldTranslateString(value, key)) entries.push({ path, value: normalizeSourceText(value) });
    return entries;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => entries.push(...collectJsonTexts(item, [...path, String(index)])));
    return entries;
  }
  if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([childKey, child]) => {
      entries.push(...collectJsonTexts(child, [...path, childKey]));
    });
  }
  return entries;
}

export async function getSourceEntity(entityType: string, entityId: number) {
  if (entityType === "post") {
    return prisma.post.findUnique({ where: { id: entityId } });
  }
  if (entityType === "package") {
    const pkg = await prisma.package.findUnique({ where: { id: entityId }, include: { destination: true, detail: true } });
    return pkg ? { ...pkg, destination: pkg.destination?.name || "", detailContent: pkg.detail || pkg.detailContent || defaultPackageDetailContent } : null;
  }
  return null;
}

export function extractTranslatableFields(entityType: ContentEntityType, entity: Record<string, any>) {
  const source: Record<string, any> = {};
  const entries: TextEntry[] = [];
  const fields = entityType === "post" ? TRANSLATABLE_POST_FIELDS : TRANSLATABLE_PACKAGE_FIELDS;

  for (const field of fields) {
    if (typeof entity[field] === "string" && shouldTranslateString(entity[field], field)) {
      const normalizedValue = normalizeSourceText(entity[field]);
      source[field] = normalizedValue;
      entries.push({ path: [field], value: normalizedValue });
    }
  }

  if (entityType === "post" && entity.contentBlocks) {
    source.contentBlocks = entity.contentBlocks;
    entries.push(...collectContentBlockTexts(entity.contentBlocks));
  }

  if (entityType === "package") {
    const detailContent = entity.detailContent || defaultPackageDetailContent;
    source.detailContent = detailContent;
    entries.push(...collectJsonTexts(detailContent));
  }

  return { source, entries, sourceHash: hashSource(source) };
}

export async function autoTranslateEntity(entityType: ContentEntityType, entityId: number, targetLocale: string) {
  const locale = normalizeLocale(targetLocale);
  if (locale === "vi") throw new Error("TARGET_LOCALE_MUST_NOT_BE_DEFAULT");

  const entity = await getSourceEntity(entityType, entityId);
  if (!entity) throw new Error("ENTITY_NOT_FOUND");

  const { entries, sourceHash } = extractTranslatableFields(entityType, entity as Record<string, any>);
  const translatedTexts = await translateTexts(entries.map((entry) => entry.value), locale);
  const fields: Record<string, any> = {};

  entries.forEach((entry, index) => {
    setTranslationPath(fields, entry.path, translatedTexts[index]);
  });

  return prisma.contentTranslation.upsert({
    where: { entityType_entityId_locale: { entityType, entityId, locale } },
    update: { fields, sourceHash, status: "machine" },
    create: { entityType, entityId, locale, fields, sourceHash, status: "machine" },
  });
}





export async function getContentTranslations(entityType: ContentEntityType, entityId: number) {
  const rows = await prisma.contentTranslation.findMany({
    where: { entityType, entityId },
    orderBy: { locale: "asc" },
  });

  return Object.fromEntries(rows.map((row) => [row.locale, row.fields || {}]));
}

export function validateRequiredTranslations(entityType: ContentEntityType, translations: ContentTranslationPayload) {
  const missing: string[] = [];
  const requiredFields = REQUIRED_FIELDS[entityType];

  for (const locale of REQUIRED_CONTENT_LOCALES) {
    const fields = normalizeFields(translations?.[locale]);
    for (const field of requiredFields) {
      if (!hasValue(fields[field])) missing.push(`${locale}.${field}`);
    }
  }

  return missing;
}

export async function saveContentTranslations(entityType: ContentEntityType, entityId: number, translations: ContentTranslationPayload, source?: Record<string, unknown>) {
  const sourceHash = hashSource(source || {});
  const saved = [];

  for (const locale of REQUIRED_CONTENT_LOCALES) {
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

