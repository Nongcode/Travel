import "dotenv/config";
import prisma from "../lib/prisma";
import { normalizeLegacyText } from "../lib/text/encoding";

async function main() {
  let keyDescriptions = 0;
  let values = 0;

  const keys = await prisma.staticTranslationKey.findMany();
  for (const key of keys) {
    const cleanDescription = key.description ? normalizeLegacyText(key.description) : key.description;
    if (cleanDescription !== key.description) {
      await prisma.staticTranslationKey.update({
        where: { id: key.id },
        data: { description: cleanDescription },
      });
      keyDescriptions += 1;
    }
  }

  const rows = await prisma.staticTranslationValue.findMany();
  for (const row of rows) {
    const cleanValue = normalizeLegacyText(row.value);
    if (cleanValue !== row.value) {
      await prisma.staticTranslationValue.update({
        where: { id: row.id },
        data: { value: cleanValue },
      });
      values += 1;
    }
  }

  console.log(`Cleaned ${keyDescriptions} key descriptions and ${values} translation values.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
