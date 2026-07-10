const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const envText = fs.readFileSync(path.join(process.cwd(), ".env"), "utf8");
const dbLine = envText.split(/\r?\n/).find((line) => /^\s*DATABASE_URL\s*=/.test(line));
if (!dbLine) throw new Error("DATABASE_URL not found in .env");
process.env.DATABASE_URL = dbLine.split(/=(.*)/s)[1].trim().replace(/^"|"$/g, "");

const CORE_COLLECTIONS = [
  {
    accent: "family",
    eyebrow: "Du lịch cùng gia đình",
    title: "Kỳ nghỉ nhẹ nhàng cho gia đình lớn",
    description: "Ưu tiên lịch trình ít di chuyển, khách sạn tiện nghi, bữa ăn phù hợp trẻ nhỏ và khoảng nghỉ đủ dài cho ông bà.",
    slugs: [
      "ky-nghi-gia-dinh-phu-quoc",
      "ninh-binh-cuoi-tuan",
      "da-nang-nghi-duong-bien",
      "con-dao-nghi-duong-rieng-tu",
      "ha-long-gia-dinh-du-thuyen",
      "dau-he-giam-15-goi-nghi-duong-phu-quoc",
    ],
  },
  {
    accent: "youth",
    eyebrow: "Du lịch cùng thanh xuân",
    title: "Chuyến đi cho nhóm bạn thích khám phá và lưu giữ kỷ niệm",
    description: "Nhịp đi năng động hơn, nhiều điểm chụp ảnh, trải nghiệm bản địa và gợi ý quán ăn dành cho nhóm trẻ.",
    slugs: [
      "hoi-an-di-cham",
      "cung-duong-anh-ha-giang",
      "quy-nhon-roadtrip",
      "da-lat-san-may",
      "phu-yen-tuoi-tre-bien-xanh",
      "hoi-an-dem-pho-co",
      "combo-hoi-an-da-nang-4n3d-kem-buoi-chup-anh-pho-co",
      "quy-nhon-tron-goi-mien-phi-xe-dua-don-san-bay-phu-cat",
    ],
  },
  {
    accent: "vietnam",
    eyebrow: "Điểm đến đẹp nhất Việt Nam",
    title: "Những hành trình khám phá Việt Nam",
    description: "Tuyển chọn các điểm đến có cảnh quan nổi bật, phù hợp khách lần đầu đi hoặc khách cần lịch trình dễ tư vấn.",
    slugs: [
      "hoi-an-di-cham",
      "cung-duong-anh-ha-giang",
      "ky-nghi-gia-dinh-phu-quoc",
      "ninh-binh-cuoi-tuan",
      "da-nang-nghi-duong-bien",
      "ha-long-gia-dinh-du-thuyen",
      "quy-nhon-roadtrip",
      "da-lat-san-may",
      "phu-yen-tuoi-tre-bien-xanh",
      "hoi-an-dem-pho-co",
      "sa-pa-mua-may",
      "ninh-binh-di-san-xanh",
      "combo-hoi-an-da-nang-4n3d-kem-buoi-chup-anh-pho-co",
      "ha-giang-mua-vang-tu-van-mien-phi-lich-trinh-5-ngay",
      "mua-hoa-da-lat-uu-dai-10-homestay-ngam-thung-lung",
      "quy-nhon-tron-goi-mien-phi-xe-dua-don-san-bay-phu-cat",
      "ninh-binh-mua-lua-chin-tang-ve-cheo-kayak-trang-an",
      "dau-he-giam-15-goi-nghi-duong-phu-quoc",
    ],
  },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const result = await prisma.$transaction(async (tx) => {
    const canonicalByAccent = new Map();

    for (const core of CORE_COLLECTIONS) {
      const existing = await tx.packageCollection.findMany({ where: { accent: core.accent }, orderBy: { id: "asc" } });
      const canonical = existing[0] || await tx.packageCollection.create({ data: { accent: core.accent, eyebrow: core.eyebrow, title: core.title, description: core.description } });
      const updated = await tx.packageCollection.update({
        where: { id: canonical.id },
        data: { eyebrow: core.eyebrow, title: core.title, description: core.description, accent: core.accent },
      });
      canonicalByAccent.set(core.accent, updated.id);

      for (const duplicate of existing.slice(1)) {
        const duplicateItems = await tx.packageCollectionItem.findMany({ where: { collectionId: duplicate.id } });
        for (const item of duplicateItems) {
          await tx.packageCollectionItem.upsert({
            where: { collectionId_packageId: { collectionId: updated.id, packageId: item.packageId } },
            update: {},
            create: { collectionId: updated.id, packageId: item.packageId, sortOrder: item.sortOrder },
          });
        }
        await tx.packageCollection.delete({ where: { id: duplicate.id } });
      }
    }

    const coreAccents = CORE_COLLECTIONS.map((item) => item.accent);
    const nonCore = await tx.packageCollection.findMany({ where: { OR: [{ accent: null }, { accent: { notIn: coreAccents } }] } });
    for (const collection of nonCore) {
      await tx.packageCollection.delete({ where: { id: collection.id } });
    }

    for (const core of CORE_COLLECTIONS) {
      const collectionId = canonicalByAccent.get(core.accent);
      await tx.packageCollectionItem.deleteMany({ where: { collectionId } });
      const packages = await tx.package.findMany({ where: { slug: { in: core.slugs } }, select: { id: true, slug: true } });
      const bySlug = new Map(packages.map((pkg) => [pkg.slug, pkg.id]));
      const data = core.slugs
        .map((slug, index) => ({ slug, packageId: bySlug.get(slug), sortOrder: index }))
        .filter((item) => item.packageId)
        .map((item) => ({ collectionId, packageId: item.packageId, sortOrder: item.sortOrder }));
      if (data.length > 0) await tx.packageCollectionItem.createMany({ data, skipDuplicates: true });
    }

    const finalCollections = await tx.packageCollection.findMany({
      where: { accent: { in: coreAccents } },
      orderBy: { id: "asc" },
      include: { items: true },
    });

    return finalCollections.map((collection) => ({
      id: collection.id,
      accent: collection.accent,
      eyebrow: collection.eyebrow,
      title: collection.title,
      packageCount: collection.items.length,
    }));
  });

  console.log(JSON.stringify(result, null, 2));
  await prisma["$disconnect"]();
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

