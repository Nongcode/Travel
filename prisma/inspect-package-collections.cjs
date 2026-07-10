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
  const collections = await prisma.packageCollection.findMany({ orderBy: { id: "asc" }, include: { items: true } });
  console.log(JSON.stringify(collections.map((c) => ({ id: c.id, accent: c.accent, eyebrow: c.eyebrow, title: c.title, items: c.items.map((i) => i.packageId) })), null, 2));
  await prisma["$disconnect"]();
  await pool.end();
})().catch((error) => { console.error(error); process.exit(1); });
