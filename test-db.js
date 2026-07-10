require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  try {
    const categories = await prisma.packageCategory.findMany({
      orderBy: { id: "asc" },
      include: { _count: { select: { packages: true } } },
    });
    console.log(categories);
  } catch(e) {
    console.error("ERROR:");
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
