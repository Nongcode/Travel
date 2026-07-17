import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { DEFAULT_LOCALE, normalizeLocale, SupportedLocale } from "./config";
import { defaultLanguages, defaultStaticTranslations } from "./defaults";
import { normalizeLegacyText } from "@/lib/text/encoding";

export type TranslationMap = Record<string, string>;

export type LanguageOption = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isActive: boolean;
  isDefault: boolean;
};

function getDefaultTranslationMap(locale: string): TranslationMap {
  const normalizedLocale = normalizeLocale(locale);
  const map: TranslationMap = {};
  for (const item of defaultStaticTranslations) {
    const value = item.values[normalizedLocale] || item.values[DEFAULT_LOCALE];
    if (value) map[item.namespace + "." + item.key] = normalizeLegacyText(value);
  }
  return map;
}

function getFallbackLanguages(): LanguageOption[] {
  return defaultLanguages.map((language) => ({
    code: language.code,
    name: language.name,
    nativeName: language.nativeName,
    flag: language.flag,
    isActive: language.isActive,
    isDefault: language.isDefault,
  }));
}

export async function getRequestLocale(): Promise<SupportedLocale> {
  const headerList = await headers();
  return normalizeLocale(headerList.get("x-locale"));
}

export async function ensureDefaultI18nData() {
  const languageCount = await prisma.language.count();
  const keyCount = await prisma.staticTranslationKey.count();

  if (languageCount > 0 && keyCount > 0) {
    return;
  }

  if (languageCount === 0) {
    for (const language of defaultLanguages) {
      await prisma.language.upsert({
        where: { code: language.code },
        update: {
          name: language.name,
          nativeName: language.nativeName,
          flag: language.flag,
          isActive: language.isActive,
          isDefault: language.isDefault,
          sortOrder: language.sortOrder,
        },
        create: language,
      });
    }
  }

  if (keyCount === 0) {
    for (const item of defaultStaticTranslations) {
      const key = await prisma.staticTranslationKey.upsert({
        where: { namespace_key: { namespace: item.namespace, key: item.key } },
        update: { description: normalizeLegacyText(item.description) },
        create: { namespace: item.namespace, key: item.key, description: normalizeLegacyText(item.description) },
      });

      for (const [locale, value] of Object.entries(item.values)) {
        const normalizedValue = normalizeLegacyText(value);
        await prisma.staticTranslationValue.upsert({
          where: { keyId_locale: { keyId: key.id, locale } },
          update: { value: normalizedValue },
          create: { keyId: key.id, locale, value: normalizedValue },
        });
      }
    }
  }
}

export async function getStaticTranslationMap(locale: string): Promise<TranslationMap> {
  const normalizedLocale = normalizeLocale(locale);
  const locales = normalizedLocale === DEFAULT_LOCALE ? [DEFAULT_LOCALE] : [DEFAULT_LOCALE, normalizedLocale];

  const client = prisma as typeof prisma & { staticTranslationKey?: typeof prisma.staticTranslationKey };
  if (!client.staticTranslationKey) return getDefaultTranslationMap(normalizedLocale);

  try {
    const rows = await client.staticTranslationKey.findMany({
      include: {
        values: {
          where: { locale: { in: locales } },
        },
      },
    });

    const map: TranslationMap = getDefaultTranslationMap(normalizedLocale);
    for (const row of rows) {
      const base = row.values.find((value) => value.locale === DEFAULT_LOCALE)?.value;
      const localized = row.values.find((value) => value.locale === normalizedLocale)?.value;
      const value = localized || base;
      if (value) map[row.namespace + "." + row.key] = value;
    }
    return map;
  } catch (error) {
    console.error("Failed to query static translations, using defaults:", error);
    return getDefaultTranslationMap(normalizedLocale);
  }
}

export function translateFromMap(map: TranslationMap, namespace: string, key: string, fallback: string) {
  return map[namespace + "." + key] || fallback;
}

export async function localizeContent<T extends Record<string, unknown>>(entityType: "post" | "package" | "local_specialty" | "local_specialty_detail", entity: T, locale: string): Promise<T> {
  const normalizedLocale = normalizeLocale(locale);
  if (normalizedLocale === DEFAULT_LOCALE || !entity?.id) return entity;

  const client = prisma as typeof prisma & { contentTranslation?: typeof prisma.contentTranslation };
  if (!client.contentTranslation) return entity;

  try {
    const translation = await client.contentTranslation.findUnique({
      where: {
        entityType_entityId_locale: {
          entityType,
          entityId: Number(entity.id),
          locale: normalizedLocale,
        },
      },
    });

    if (translation && ["machine", "reviewed", "published"].includes(translation.status)) {
      const fields = translation.fields && typeof translation.fields === "object" ? translation.fields : {};
      return { ...entity, ...(fields as Record<string, unknown>) } as T;
    }

    return entity;
  } catch (error) {
    console.error("Failed to query content translation, using source content:", error);
    return entity;
  }
}


export async function getActiveLanguages(): Promise<LanguageOption[]> {
  const client = prisma as typeof prisma & { language?: typeof prisma.language };
  if (!client.language) return getFallbackLanguages().filter((language) => language.isActive);

  try {
    const languages = await client.language.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });

    if (languages.length === 0) return [];
    return languages.map((language) => ({
      code: language.code,
      name: language.name,
      nativeName: language.nativeName,
      flag: language.flag || "",
      isActive: language.isActive,
      isDefault: language.isDefault,
    }));
  } catch (error) {
    console.error("Failed to query active languages, using defaults:", error);
    return getFallbackLanguages().filter((language) => language.isActive);
  }
}






