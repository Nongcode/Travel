import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
  const keys = await prisma.staticTranslationKey.findMany({
    where: { namespace: "contact", key: { in: ["card2_copy", "form_copy", "hero_title"] } },
    include: { values: { where: { locale: "vi" } } },
    orderBy: { key: "asc" },
  });
  for (const key of keys) {
    console.log(`${key.namespace}.${key.key}: ${key.values[0]?.value || ""}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
