import "dotenv/config";
import prisma from "../lib/prisma";
import { defaultLanguages, defaultStaticTranslations } from "../lib/i18n/defaults";
import { normalizeLegacyText } from "../lib/text/encoding";

async function main() {
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

  let imported = 0;
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

    for (const [locale, value] of Object.entries(item.values)) {
      await prisma.staticTranslationValue.upsert({
        where: { keyId_locale: { keyId: key.id, locale } },
        update: { value: normalizeLegacyText(value) },
        create: { keyId: key.id, locale, value: normalizeLegacyText(value) },
      });
    }
    imported += 1;
  }

  console.log(`Synced ${imported} static translation keys.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
