const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const envText = fs.readFileSync(path.join(process.cwd(), ".env"), "utf8");
const dbLine = envText.split(/\r?\n/).find((line) => /^\s*DATABASE_URL\s*=/.test(line));
process.env.DATABASE_URL = dbLine.split(/=(.*)/s)[1].trim().replace(/^"|"$/g, "");

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const rows = await prisma.contentTranslation.findMany({
    where: { entityType: "package", entityId: { in: [31, 32, 33, 34, 35, 36] } },
    orderBy: [{ entityId: "asc" }, { locale: "asc" }],
  });
  console.log(JSON.stringify(rows.map((row) => ({
    entityId: row.entityId,
    locale: row.locale,
    name: row.fields.name,
    destination: row.fields.destination,
    duration: row.fields.duration,
    status: row.status,
  })), null, 2));
  await prisma["$disconnect"]();
  await pool.end();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
