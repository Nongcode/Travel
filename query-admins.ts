import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const admins = await prisma.admin.findMany();
  admins.forEach(a => {
    console.log(`Email: ${a.email} | PasswordHash: ${a.passwordHash} | Role: ${a.role}`);
  });
}

main().finally(() => {
  prisma.$disconnect();
  pool.end();
});
