import "dotenv/config";
import prisma from "../lib/prisma";
import { defaultLanguages, defaultStaticTranslations } from "../lib/i18n/defaults";
import { normalizeLegacyText } from "../lib/text/encoding";
import { DEFAULT_SITE_CHROME_CONFIG } from "../lib/siteChromeShared";
import { SITE_CHROME_SETTING_KEYS } from "../lib/siteChrome";

const publicContentSettings: Array<[string, string]> = [
  [SITE_CHROME_SETTING_KEYS.headerLogoAlt, DEFAULT_SITE_CHROME_CONFIG.header.logoAlt],
  [SITE_CHROME_SETTING_KEYS.headerCompanyName, DEFAULT_SITE_CHROME_CONFIG.header.companyName],
  [SITE_CHROME_SETTING_KEYS.footerBrandName, DEFAULT_SITE_CHROME_CONFIG.footer.brandName],
  [SITE_CHROME_SETTING_KEYS.footerDescription, DEFAULT_SITE_CHROME_CONFIG.footer.description],
];

async function syncLanguages() {
  let synced = 0;

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
    synced += 1;
  }

  return synced;
}

async function syncStaticTranslations() {
  let keys = 0;
  let values = 0;

  for (const item of defaultStaticTranslations) {
    const key = await prisma.staticTranslationKey.upsert({
      where: { namespace_key: { namespace: item.namespace, key: item.key } },
      update: { description: normalizeLegacyText(item.description) },
      create: {
        namespace: item.namespace,
        key: item.key,
        description: normalizeLegacyText(item.description),
      },
    });

    keys += 1;

    for (const [locale, value] of Object.entries(item.values)) {
      await prisma.staticTranslationValue.upsert({
        where: { keyId_locale: { keyId: key.id, locale } },
        update: { value: normalizeLegacyText(value) },
        create: { keyId: key.id, locale, value: normalizeLegacyText(value) },
      });
      values += 1;
    }
  }

  return { keys, values };
}

async function syncPublicSiteSettings() {
  let synced = 0;

  for (const [settingKey, settingValue] of publicContentSettings) {
    await prisma.siteSetting.upsert({
      where: { settingKey },
      update: { settingValue: normalizeLegacyText(settingValue) },
      create: { settingKey, settingValue: normalizeLegacyText(settingValue) },
    });
    synced += 1;
  }

  return synced;
}

async function main() {
  const languageCount = await syncLanguages();
  const translationResult = await syncStaticTranslations();
  const settingCount = await syncPublicSiteSettings();

  console.log(
    `Synced public content: ${languageCount} languages, ${translationResult.keys} translation keys, ${translationResult.values} translation values, ${settingCount} site settings.`,
  );
}

main()
  .catch((error) => {
    console.error("Failed to sync public content:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });