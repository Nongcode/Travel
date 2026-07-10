import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const packageTranslations: Record<string, Record<string, Record<string, string>>> = {
  "hoi-an-di-cham": {
    en: { name: "Slow-paced Hoi An", destination: "Hoi An", duration: "4 days 3 nights", summary: "Slow itinerary, boutique hotel, cooking class and Hoai river sunset boat tour.", description: "A gentle Hoi An itinerary with boutique stays, local cooking experiences, riverside evenings, and enough free time to enjoy the old town slowly." },
    "zh-CN": { name: "慢节奏会安", destination: "会安", duration: "4天3晚", summary: "慢节奏行程、精品酒店、烹饪课程和怀河日落游船。", description: "轻松的会安行程，包含精品住宿、本地烹饪体验、河畔夜晚，并留出充足时间慢慢感受古城。" },
  },
  "cung-duong-anh-ha-giang": {
    en: { name: "Ha Giang Photo Route", destination: "Ha Giang", duration: "5 days 4 nights", summary: "Sunrise photography route, terraced fields, Dong Van old town and Hmong villages.", description: "A scenic Ha Giang route for travelers who love mountain light, winding passes, highland villages, and quiet photography stops." },
    "zh-CN": { name: "河江摄影路线", destination: "河江", duration: "5天4晚", summary: "日出摄影路线、梯田、同文古镇和苗族村落。", description: "适合热爱山地光影、盘山公路、高原村落和安静摄影点的河江风景行程。" },
  },
  "ky-nghi-gia-dinh-phu-quoc": {
    en: { name: "Phu Quoc Family Holiday", destination: "Phu Quoc", duration: "3 days 2 nights", summary: "Beachfront resort, minimal travel itinerary, kid-friendly restaurant recommendations.", description: "A relaxed Phu Quoc family escape with beach time, gentle transfers, child-friendly meals, and flexible consulting for every generation." },
    "zh-CN": { name: "富国岛家庭假期", destination: "富国岛", duration: "3天2晚", summary: "海边度假村、少移动行程和亲子餐厅建议。", description: "轻松的富国岛家庭假期，包含海边时光、舒适交通、适合儿童的餐饮建议，并可按家庭需求灵活调整。" },
  },
  "ninh-binh-cuoi-tuan": {
    en: { name: "Ninh Binh Weekend", destination: "Ninh Binh", duration: "2 days 1 night", summary: "Trang An boat trip, green resort stay and just enough itinerary for families with kids.", description: "A short Ninh Binh nature break with boat rides, peaceful landscapes, and a comfortable pace for families traveling with children." },
    "zh-CN": { name: "宁平周末", destination: "宁平", duration: "2天1晚", summary: "长安游船、绿色度假住宿和适合亲子家庭的轻量行程。", description: "宁平短途自然之旅，包含游船、宁静山水和适合带孩子家庭的舒适节奏。" },
  },
  "da-nang-nghi-duong-bien": {
    en: { name: "Da Nang Beach Retreat", destination: "Da Nang", duration: "4 days 3 nights", summary: "Beachfront resort, private transfer, Hoi An old town and easy family-friendly stops.", description: "A beach-focused Da Nang journey combining resort time, private transfers, Hoi An old town, and accessible sightseeing stops." },
    "zh-CN": { name: "岘港海滨度假", destination: "岘港", duration: "4天3晚", summary: "海边度假村、私人接送、会安古镇和轻松景点。", description: "以海滨度假为主的岘港行程，结合度假村时间、私人接送、会安古镇和轻松易达的景点。" },
  },
  "quy-nhon-roadtrip": {
    en: { name: "Quy Nhon Roadtrip", destination: "Quy Nhon", duration: "3 days 2 nights", summary: "Coastal roads, Eo Gio, Ky Co and local seafood stops for freedom-loving groups.", description: "A flexible Quy Nhon coastal roadtrip for groups who enjoy open roads, sea views, seafood, and independent photo stops." },
    "zh-CN": { name: "归仁海岸自驾", destination: "归仁", duration: "3天2晚", summary: "海岸公路、风口、Ky Co 和适合自由团队的海鲜小店。", description: "灵活的归仁海岸路线，适合喜欢公路、海景、海鲜和自由拍照点的团队。" },
  },
  "da-lat-san-may": {
    en: { name: "Da Lat Cloud Hunting", destination: "Da Lat", duration: "3 days 2 nights", summary: "Cloud hunting, forest cafes, night market and homestay with shared social space.", description: "A cool Da Lat itinerary for friends who enjoy cloud views, forest cafes, local markets, and cozy homestay evenings." },
    "zh-CN": { name: "大叻寻云", destination: "大叻", duration: "3天2晚", summary: "寻云、森林咖啡、夜市和带公共空间的民宿。", description: "清凉的大叻行程，适合喜欢云海、森林咖啡、本地市场和温馨民宿夜晚的朋友。" },
  },
  "con-dao-nghi-duong-rieng-tu": {
    en: { name: "Con Dao Private Retreat", destination: "Con Dao", duration: "4 days 3 nights", summary: "Quiet beach space, private resort and a calm rhythm for families who need to recharge.", description: "A private Con Dao retreat with quiet beaches, restful resort time, and gentle planning for travelers seeking real downtime." },
    "zh-CN": { name: "昆岛私享度假", destination: "昆岛", duration: "4天3晚", summary: "安静海滩、私密度假村和适合家庭恢复精力的慢节奏。", description: "私密的昆岛度假行程，包含安静海滩、充足休息和适合真正放松的柔和安排。" },
  },
  "ha-long-gia-dinh-du-thuyen": {
    en: { name: "Ha Long Family Cruise", destination: "Ha Long", duration: "2 days 1 night", summary: "Overnight bay cruise, gentle meals and itinerary suitable for multi-generation families.", description: "A light Ha Long cruise experience with bay views, overnight rest, simple meals, and pacing suitable for mixed-age families." },
    "zh-CN": { name: "下龙湾家庭游轮", destination: "下龙湾", duration: "2天1晚", summary: "海湾过夜游轮、轻松餐食和适合多代家庭的行程。", description: "轻松的下龙湾游轮体验，包含海湾风景、过夜休息、简餐和适合多代家庭的节奏。" },
  },
  "phu-yen-tuoi-tre-bien-xanh": {
    en: { name: "Phu Yen Youth Blue Sea", destination: "Phu Yen", duration: "3 days 2 nights", summary: "Coastal route, local seafood and check-in spots for freedom-loving friend groups.", description: "A youthful Phu Yen seaside route with blue water, open roads, seafood stops, and casual moments for friend groups." },
    "zh-CN": { name: "富安青春蓝海", destination: "富安", duration: "3天2晚", summary: "海岸路线、本地海鲜和适合朋友团队的打卡点。", description: "充满青春感的富安海岸路线，包含蓝色海景、公路、海鲜小店和适合朋友团队的轻松时刻。" },
  },
  "hoi-an-dem-pho-co": {
    en: { name: "Hoi An Old Town Night", destination: "Hoi An", duration: "3 days 2 nights", summary: "Old town photography, lantern release, craft workshop and optimized evening itinerary.", description: "A Hoi An evening journey for young groups with lanterns, crafts, old-town photography, and a balanced night schedule." },
    "zh-CN": { name: "会安古城之夜", destination: "会安", duration: "3天2晚", summary: "古城摄影、放花灯、手作体验和优化夜间行程。", description: "适合年轻团队的会安夜游，包含灯笼、手作、古城摄影和节奏合适的夜间安排。" },
  },
  "sa-pa-mua-may": {
    en: { name: "Sa Pa Cloud Season", destination: "Sa Pa", duration: "4 days 3 nights", summary: "Terraced fields, highland villages, cloud hunting and Northwest culture.", description: "A Sa Pa mountain itinerary with cloud views, rice terraces, village walks, and gentle cultural discovery in the Northwest." },
    "zh-CN": { name: "沙坝云季", destination: "沙坝", duration: "4天3晚", summary: "梯田、高原村落、寻云和西北文化体验。", description: "沙坝山地行程，包含云海、梯田、村落漫步和轻松了解越南西北文化。" },
  },
  "ninh-binh-di-san-xanh": {
    en: { name: "Ninh Binh Green Heritage", destination: "Ninh Binh", duration: "3 days 2 nights", summary: "Trang An, Mua Cave, Tam Coc and signature green viewpoints of Northern Vietnam.", description: "A green heritage route through Ninh Binh with river caves, limestone peaks, countryside roads, and easy photo viewpoints." },
    "zh-CN": { name: "宁平绿色遗产", destination: "宁平", duration: "3天2晚", summary: "长安、舞洞、三谷和越南北部代表性绿色景观点。", description: "宁平绿色遗产路线，包含河洞、石灰岩山峰、乡间道路和轻松拍照的观景点。" },
  },
};

const postTranslations: Record<number, Record<string, Record<string, string>>> = {
  1: {
    en: { title: "48 hours in Hoi An: slow itinerary, local food and old-town light", excerpt: "A compact journey for first-time visitors to Hoi An, focused on real experiences instead of rushing through a checklist.", summary: "A tidy, slow-paced journey for travelers who want to feel peaceful Hoi An through small alleys, local flavors and lantern light at night.", seoDescription: "Detailed 48-hour Hoi An travel guide with local food, the Hoai River, old-town light and a relaxed itinerary.", readTime: "6 min read" },
    "zh-CN": { title: "会安48小时：慢行程、本地美食与古城光影", excerpt: "适合首次到访会安的紧凑行程，重视真实体验，而不是匆忙打卡。", summary: "一段整洁而慢节奏的旅程，适合想通过小巷、本地味道和夜晚灯笼感受宁静会安的旅行者。", seoDescription: "详细的会安48小时旅行指南，包含本地美食、怀河、古城光影和轻松行程。", readTime: "6分钟阅读" },
  },
  2: {
    en: { title: "Phu Yen after the sunny season: worthwhile stops before the crowds arrive", excerpt: "Suggestions for coastal roads, small eateries and golden moments for photography lovers.", summary: "Phu Yen keeps a raw, dramatic beauty of dark cliffs beside deep blue ocean. Traveling in the cooler transition season brings a rare sense of peace.", seoDescription: "Independent Phu Yen travel guide with Ganh Da Dia, Mui Dien, Bai Xep and local seafood experiences.", readTime: "5 min read" },
    "zh-CN": { title: "晴季后的富安：人潮到来前值得停留的地方", excerpt: "推荐海岸路线、小餐馆和适合摄影爱好者的黄金时刻。", summary: "富安保留着黑色岩壁与湛蓝海洋相映的原始壮丽。换季转凉时前往，会带来少见的平静体验。", seoDescription: "富安自由行指南，包含石盘滩、岬电、拜斜和本地海鲜体验。", readTime: "5分钟阅读" },
  },
  3: {
    en: { title: "Da Lat outside the center: quiet homestays, forest cafes and local markets", excerpt: "A slow experience map for couples, small families and friends who need a gentle retreat.", summary: "Beyond the busy center, Da Lat still has pine-filled corners, birdsong and romantic mist in the outskirts.", seoDescription: "Guide to peaceful Da Lat outskirts, cloud hunting, forest cafes and valley-view homestays.", readTime: "7 min read" },
    "zh-CN": { title: "大叻市中心之外：安静民宿、森林咖啡和市集", excerpt: "为情侣、小家庭和需要轻松度假的朋友准备的慢体验地图。", summary: "离开热闹中心后，大叻仍有松林、鸟鸣和郊外浪漫薄雾中的小角落。", seoDescription: "大叻郊外宁静体验指南，包含寻云、森林咖啡和山谷景观民宿。", readTime: "7分钟阅读" },
  },
  4: {
    en: { title: "A short Ninh Binh holiday for families with young children", excerpt: "Stops with less travel, beautiful scenery and enough rest rhythm for the family.", summary: "Ninh Binh, with calm rivers, cool caves and golden rice fields, is a gentle nature destination for families with children.", seoDescription: "Ninh Binh weekend plan for families with young children, including Trang An, Tam Coc and family-friendly stays.", readTime: "8 min read" },
    "zh-CN": { title: "适合带小孩家庭的宁平短假", excerpt: "少移动、风景优美并保留家庭休息节奏的停留建议。", summary: "宁平拥有平静河流、清凉洞穴和金色稻田，是适合亲子家庭的轻松自然目的地。", seoDescription: "适合带小孩家庭的宁平周末计划，包含长安、三谷和亲子友好住宿建议。", readTime: "8分钟阅读" },
  },
};

async function upsertTranslation(entityType: "post" | "package", entityId: number, locale: string, fields: Record<string, string>) {
  await prisma.contentTranslation.upsert({
    where: { entityType_entityId_locale: { entityType, entityId, locale } },
    update: { fields, sourceHash: "manual-seed-v1", status: "published" },
    create: { entityType, entityId, locale, fields, sourceHash: "manual-seed-v1", status: "published" },
  });
}

async function main() {
  for (const [slug, translations] of Object.entries(packageTranslations)) {
    const pkg = await prisma.package.findUnique({ where: { slug } });
    if (!pkg) continue;
    for (const [locale, fields] of Object.entries(translations)) {
      await upsertTranslation("package", pkg.id, locale, fields);
    }
  }

  for (const [id, translations] of Object.entries(postTranslations)) {
    const post = await prisma.post.findUnique({ where: { id: Number(id) } });
    if (!post) continue;
    for (const [locale, fields] of Object.entries(translations)) {
      await upsertTranslation("post", post.id, locale, fields);
    }
  }

  console.log("Content translations seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
