const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const envPath = path.join(process.cwd(), ".env");
const envText = fs.readFileSync(envPath, "utf8");
const dbLine = envText.split(/\r?\n/).find((line) => /^\s*DATABASE_URL\s*=/.test(line));
if (!dbLine) throw new Error("DATABASE_URL not found in .env");
process.env.DATABASE_URL = dbLine.split(/=(.*)/s)[1].trim().replace(/^"|"$/g, "");

const translations = [
  {
    id: 31,
    en: {
      name: "Hoi An - Da Nang 4D3N Combo with Old Town Photo Session",
      destination: "Da Nang",
      duration: "4 days 3 nights",
      summary: "Ideal for couples and friend groups who want a relaxed itinerary with curated local dining suggestions.",
      description: "A 4-day, 3-night Hoi An and Da Nang combo designed for couples and small groups, including a gentle schedule, handpicked local food stops, and a memorable photo session in Hoi An Old Town.",
      peopleNote: "Best for couples, small friend groups, and travelers who prefer a light-paced trip.",
    },
    zh: {
      name: "会安-岘港4天3晚套餐，含古城写真拍摄",
      destination: "岘港",
      duration: "4天3晚",
      summary: "适合情侣和朋友小团，行程轻松，并提供精选本地餐厅建议。",
      description: "会安与岘港4天3晚套餐，专为情侣和小团体设计，节奏轻松，包含精选本地美食推荐，并安排一次难忘的会安古城写真拍摄。",
      peopleNote: "适合情侣、朋友小团以及喜欢轻松节奏的旅行者。",
    },
  },
  {
    id: 32,
    en: {
      name: "Ha Giang Golden Season: Free 5-Day Itinerary Consultation",
      destination: "Ha Giang",
      duration: "5 days 4 nights",
      summary: "Receive a sample itinerary file, recommended stops, and essential safety notes for mountain routes.",
      description: "A free consultation package for Ha Giang's golden season, including a 5-day sample itinerary, carefully selected viewpoints, practical rest stops, and safety guidance for traveling mountain passes.",
      peopleNote: "Best for adventurous travelers, photographers, and small groups planning the Ha Giang loop.",
    },
    zh: {
      name: "河江金色季节：免费咨询5天行程",
      destination: "河江",
      duration: "5天4晚",
      summary: "获取行程范本、推荐停靠点以及山路旅行的重要安全提示。",
      description: "河江金色季节免费咨询服务，包含5天行程范本、精选观景点、实用休息点，以及高山公路旅行的安全建议。",
      peopleNote: "适合热爱探险、摄影以及计划河江环线的小团体。",
    },
  },
  {
    id: 33,
    en: {
      name: "Da Lat Flower Season: 10% Off Valley-View Homestays",
      destination: "Da Lat",
      duration: "Flexible stay",
      summary: "Includes an exclusive sunset cafe map, valid for bookings made at least 15 days before departure.",
      description: "A Da Lat flower-season offer with 10% savings on selected valley-view homestays, plus an exclusive sunset cafe map for guests who book at least 15 days in advance.",
      peopleNote: "Best for couples, friends, and travelers who enjoy cafes, flowers, and cool highland weather.",
    },
    zh: {
      name: "大叻花季：山谷景民宿9折优惠",
      destination: "大叻",
      duration: "住宿天数灵活",
      summary: "赠送独家日落咖啡地图，适用于出发前至少15天预订的订单。",
      description: "大叻花季优惠，精选山谷景民宿可享9折，并为提前至少15天预订的客人赠送独家日落咖啡地图。",
      peopleNote: "适合情侣、朋友以及喜欢咖啡、花季和凉爽高原气候的旅行者。",
    },
  },
  {
    id: 34,
    en: {
      name: "Quy Nhon All-Inclusive: Free Phu Cat Airport Transfer",
      destination: "Quy Nhon",
      duration: "From 3 days 2 nights",
      summary: "Available for every booking of 3 days 2 nights or longer this summer, with private 4-7 seat transfer support.",
      description: "A convenient Quy Nhon summer offer with complimentary private transfer from Phu Cat Airport for bookings of at least 3 days 2 nights, suitable for couples, families, and small groups.",
      peopleNote: "Best for groups who want a smooth airport pickup and a relaxed coastal stay.",
    },
    zh: {
      name: "归仁全包优惠：免费富吉机场接送",
      destination: "归仁",
      duration: "3天2晚起",
      summary: "适用于今夏所有3天2晚及以上预订，提供4-7座私人车辆接送支持。",
      description: "便捷的归仁夏季优惠，凡预订至少3天2晚行程，即可享受富吉机场私人接送服务，适合情侣、家庭和小团体。",
      peopleNote: "适合希望机场接送顺畅、轻松享受海滨假期的团队。",
    },
  },
  {
    id: 35,
    en: {
      name: "Ninh Binh Rice Season: Free Trang An Kayaking Ticket",
      destination: "Ninh Binh",
      duration: "Weekend experience",
      summary: "Limited offer for weekend Trang An - Bai Dinh experience bookings.",
      description: "A limited Ninh Binh rice-season promotion that includes a complimentary Trang An kayaking ticket for selected weekend Trang An and Bai Dinh experience bookings.",
      peopleNote: "Best for nature lovers, families, and weekend travelers looking for a fresh outdoor experience.",
    },
    zh: {
      name: "宁平稻熟季：赠送长安皮划艇票",
      destination: "宁平",
      duration: "周末体验",
      summary: "限量适用于周末长安-拜丁体验行程预订。",
      description: "宁平稻熟季限量优惠，指定周末长安与拜丁体验行程可获赠长安皮划艇门票。",
      peopleNote: "适合自然爱好者、家庭以及想体验户外周末旅行的游客。",
    },
  },
  {
    id: 36,
    en: {
      name: "Early Summer: 15% Off Phu Quoc Resort Packages",
      destination: "Phu Quoc",
      duration: "June - July departures",
      summary: "Available for groups of 4 or more departing in June and July, with priority for beachfront resorts.",
      description: "An early-summer Phu Quoc offer with 15% savings for groups of at least 4 guests, valid for June and July departures and focused on relaxing beachfront resort stays.",
      peopleNote: "Best for families, friend groups, and guests who want a comfortable beach resort break.",
    },
    zh: {
      name: "初夏优惠：富国岛度假套餐85折",
      destination: "富国岛",
      duration: "6月至7月出发",
      summary: "适用于6月和7月出发的4人及以上团队，优先安排海滨度假村。",
      description: "富国岛初夏优惠，4人及以上团队可享度假套餐85折，适用于6月和7月出发，主打舒适的海滨度假村体验。",
      peopleNote: "适合家庭、朋友团队以及想享受舒适海滨度假的客人。",
    },
  },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  for (const item of translations) {
    for (const [locale, fields] of [["en", item.en], ["zh-CN", item.zh]]) {
      await prisma.contentTranslation.upsert({
        where: { entityType_entityId_locale: { entityType: "package", entityId: item.id, locale } },
        update: { fields, status: "published", sourceHash: "manual-package-offers-v2" },
        create: { entityType: "package", entityId: item.id, locale, fields, status: "published", sourceHash: "manual-package-offers-v2" },
      });
    }
  }

  const count = await prisma.contentTranslation.count({
    where: { entityType: "package", entityId: { in: translations.map((item) => item.id) } },
  });
  console.log(`Upserted translations for ${translations.length} packages. Translation rows in scope: ${count}.`);

  await prisma["$disconnect"]();
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
