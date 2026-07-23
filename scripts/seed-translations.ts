import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const staticTranslations = [
  {
    namespace: "nav",
    key: "local_specialty",
    description: "Header nav - Local Specialty",
    values: {
      en: "Specialties",
      "zh-CN": "当地特产",
    }
  },
  {
    namespace: "localSpecialty",
    key: "hero_eyebrow",
    description: "Specialty list hero eyebrow",
    values: {
      en: "Local Specialties",
      "zh-CN": "当地特产",
    }
  },
  {
    namespace: "localSpecialty",
    key: "hero_title",
    description: "Specialty list hero title",
    values: {
      en: "Cultural essence through every flavor and handicraft.",
      "zh-CN": "通过每一种味道和手工艺品展现文化精髓。",
    }
  },
  {
    namespace: "localSpecialty",
    key: "hero_copy",
    description: "Specialty list hero copy",
    values: {
      en: "Discover regional specialties, preserving the essence of Vietnamese cuisine and traditional arts.",
      "zh-CN": "探索当地特产，保留越南美食和传统艺术的精髓。",
    }
  },
  {
    namespace: "localSpecialty",
    key: "type_food",
    description: "Specialty type FOOD",
    values: {
      en: "Food",
      "zh-CN": "美食",
    }
  },
  {
    namespace: "localSpecialty",
    key: "type_handicraft",
    description: "Specialty type HANDICRAFT",
    values: {
      en: "Handicraft",
      "zh-CN": "手工艺",
    }
  },
  {
    namespace: "localSpecialty",
    key: "view_detail",
    description: "Specialty view detail button",
    values: {
      en: "View Details",
      "zh-CN": "查看详情",
    }
  },
  {
    namespace: "localSpecialty",
    key: "price",
    description: "Specialty price label",
    values: {
      en: "Reference Price",
      "zh-CN": "参考价格",
    }
  },
  {
    namespace: "localSpecialty",
    key: "whereToBuy",
    description: "Specialty where to buy label",
    values: {
      en: "Where to buy",
      "zh-CN": "购买地点",
    }
  },
  {
    namespace: "localSpecialty",
    key: "detail_eyebrow",
    description: "Specialty detail eyebrow",
    values: {
      en: "Discover specialty",
      "zh-CN": "探索特产",
    }
  },
  {
    namespace: "localSpecialty",
    key: "consult_now",
    description: "Specialty contact button",
    values: {
      en: "Contact to Buy",
      "zh-CN": "联系购买",
    }
  },
];

const contentTranslations = {
  "nem-chua-thanh-hoa": {
    en: {
      name: "Thanh Hoa Fermented Pork Roll",
      description: "Famous specialty of Thanh land with the mild sour, spicy and crunchy taste of pork skin.",
      priceText: "45,000 - 60,000 VND / 10 pcs",
      whereToBuy: "Cay Da Facility, Thang Tuyen Facility (Thanh Hoa)",
      detail: {
        overview: "Thanh Hoa Fermented Pork Roll is an indispensable traditional dish during holidays, bringing the characteristic flavor of the North Central region.",
        history: "The profession of making fermented pork roll in Thanh Hoa has existed for a long time, passed down from generation to generation...",
        ingredients: "Pork shoulder, pork skin, garlic, chili, polyscias fruticosa leaves, roasted rice powder...",
        howToUse: "Eat directly, dip in chili sauce. Very suitable as a snack with beer.",
        preservation: "Store at room temperature for 2-3 days, or in the refrigerator for 5-7 days."
      }
    },
    "zh-CN": {
      name: "清化酸肉",
      description: "清化著名的特产，具有猪皮的微酸、辛辣和松脆的味道。",
      priceText: "45,000 - 60,000 越南盾 / 10个",
      whereToBuy: "Cay Da 设施, Thang Tuyen 设施 (清化)",
      detail: {
        overview: "清化酸肉是节日不可缺少的传统菜肴，具有中北部地区特色的风味。",
        history: "清化制作酸肉的职业由来已久，代代相传......",
        ingredients: "猪肩肉、猪皮、大蒜、辣椒、南洋参叶、烤米粉......",
        howToUse: "直接吃，蘸辣椒酱。非常适合作下酒菜。",
        preservation: "室温保存 2-3 天，或冰箱冷藏 5-7 天。"
      }
    }
  },
  "cha-muc-ha-long": {
    en: {
      name: "Ha Long Squid Sausage",
      description: "Hand-pounded squid sausage with standard Ha Long taste, chewy and delicious.",
      priceText: "350,000 - 450,000 VND / kg",
      whereToBuy: "Cai Dam Market, Ha Long 1 Market",
      detail: {
        overview: "Ha Long Squid Sausage is one of the most delicious dishes in Vietnam, made from fresh cuttlefish caught in Ha Long Bay.",
        history: "The dish appeared in the 1940s in Hon Gai, Ha Long, and became a famous specialty across the country.",
        ingredients: "Fresh cuttlefish, pork fat, onion, garlic, pepper, fish sauce...",
        howToUse: "Deep-fry until golden and eat with sticky rice, steamed rice rolls or hot rice.",
        preservation: "Store in the freezer for up to 6 months."
      }
    },
    "zh-CN": {
      name: "下龙墨鱼饼",
      description: "手工捣碎的墨鱼饼，具有标准的下龙味道，耐嚼可口。",
      priceText: "350,000 - 450,000 越南盾 / 公斤",
      whereToBuy: "Cai Dam 市场, 下龙 1 市场",
      detail: {
        overview: "下龙墨鱼饼是越南最美味的菜肴之一，由下龙湾捕获的新鲜墨鱼制成。",
        history: "这道菜于20世纪40年代出现在下龙的鸿基，并成为全国著名的特产。",
        ingredients: "新鲜墨鱼、猪油、洋葱、大蒜、胡椒、鱼露......",
        howToUse: "炸至金黄，配糯米饭、肠粉或热饭吃。",
        preservation: "在冰箱中保存长达 6 个月。"
      }
    }
  },
  "non-la-bai-tho-hue": {
    en: {
      name: "Hue Poem Conical Hat",
      description: "The characteristic conical hat of Hue, delicate and elegant with poems hidden inside.",
      priceText: "80,000 - 150,000 VND / piece",
      whereToBuy: "Dong Ba Market, Tay Ho Hat Village",
      detail: {
        overview: "The poem conical hat is a cultural symbol of Hue women, bringing a gentle and shy beauty.",
        history: "Tay Ho hat village has a history of hundreds of years, the birthplace of the famous poem conical hat.",
        ingredients: "Palm leaves, thread, bamboo frame, Do paper...",
        howToUse: "Wear to protect from sun, rain, or as a souvenir, decoration.",
        preservation: "Keep in a dry place, avoid heavy objects pressing on it causing the brim to break."
      }
    },
    "zh-CN": {
      name: "顺化诗篇斗笠",
      description: "顺化特有的斗笠，精致典雅，里面藏有诗歌。",
      priceText: "80,000 - 150,000 越南盾 / 顶",
      whereToBuy: "东波市场，西湖斗笠村",
      detail: {
        overview: "诗篇斗笠是顺化妇女的文化象征，带来温柔羞涩的美。",
        history: "西湖斗笠村有数百年的历史，是著名的诗篇斗笠的发源地。",
        ingredients: "棕榈叶、线、竹架、作纸......",
        howToUse: "戴着防晒、防雨，或作为纪念品、装饰品。",
        preservation: "存放在干燥的地方，避免重物压在上面导致帽檐断裂。"
      }
    }
  },
  "lua-ha-dong": {
    en: {
      name: "Ha Dong Silk",
      description: "Exquisitely hand-woven silk products, soft and luxurious from Van Phuc silk village.",
      priceText: "250,000 - 1,500,000 VND / meter",
      whereToBuy: "Van Phuc Silk Village, Ha Dong",
      detail: {
        overview: "Van Phuc Silk (Ha Dong) has long been famous for being soft, thin, light and airy, with diverse and sharp decorative patterns.",
        history: "Van Phuc silk village is over 1000 years old, once the place to supply silk to the Nguyen dynasty's royal court.",
        ingredients: "100% natural silk, hand-dyed...",
        howToUse: "Make Ao Dai, silk dresses, scarves, high-end gifts.",
        preservation: "Hand wash in cold water with shampoo or shower gel, dry in the shade."
      }
    },
    "zh-CN": {
      name: "河东丝绸",
      description: "来自万福丝绸村的精美手工编织丝绸产品，柔软奢华。",
      priceText: "250,000 - 1,500,000 越南盾 / 米",
      whereToBuy: "河东万福丝绸村",
      detail: {
        overview: "万福丝绸（河东）向来以柔软、轻薄、透气、装饰图案多样清晰而闻名。",
        history: "万福丝绸村已有1000多年的历史，曾是阮朝皇家宫廷丝绸的供应地。",
        ingredients: "100% 天然丝绸，手工染色......",
        howToUse: "制作奥黛、丝绸连衣裙、围巾、高端礼品。",
        preservation: "用冷水加入洗发水或沐浴露手洗，在阴凉处晾干。"
      }
    }
  }
};

async function main() {
  console.log("Seeding static translations...");
  for (const item of staticTranslations) {
    let key = await prisma.staticTranslationKey.findUnique({
      where: { namespace_key: { namespace: item.namespace, key: item.key } }
    });

    if (!key) {
      key = await prisma.staticTranslationKey.create({
        data: {
          namespace: item.namespace,
          key: item.key,
          description: item.description,
        }
      });
    }

    for (const [locale, value] of Object.entries(item.values)) {
      await prisma.staticTranslationValue.upsert({
        where: { keyId_locale: { keyId: key.id, locale } },
        update: { value },
        create: { keyId: key.id, locale, value },
      });
    }
  }

  console.log("Seeding content translations...");
  const specialties = await prisma.localSpecialty.findMany({ include: { detail: true } });
  
  for (const specialty of specialties) {
    const trData = contentTranslations[specialty.slug as keyof typeof contentTranslations];
    if (!trData) continue;

    for (const locale of ["en", "zh-CN"]) {
      const data = trData[locale as keyof typeof trData];
      
      // Save specialty translation
      await prisma.contentTranslation.upsert({
        where: { entityType_entityId_locale: { entityType: "local_specialty", entityId: specialty.id, locale } },
        update: {
          fields: {
            name: data.name,
            description: data.description,
            priceText: data.priceText,
            whereToBuy: data.whereToBuy,
          },
          sourceHash: "manual-seed-v1",
          status: "published",
        },
        create: {
          entityType: "local_specialty",
          entityId: specialty.id,
          locale,
          fields: {
            name: data.name,
            description: data.description,
            priceText: data.priceText,
            whereToBuy: data.whereToBuy,
          },
          sourceHash: "manual-seed-v1",
          status: "published",
        }
      });

      // Save specialty detail translation
      if (specialty.detail) {
        await prisma.contentTranslation.upsert({
          where: { entityType_entityId_locale: { entityType: "local_specialty_detail", entityId: specialty.detail.id, locale } },
          update: {
            fields: {
              overview: data.detail.overview,
              history: data.detail.history,
              ingredients: data.detail.ingredients,
              howToUse: data.detail.howToUse,
              preservation: data.detail.preservation,
            },
            sourceHash: "manual-seed-v1",
          status: "published",
          },
          create: {
            entityType: "local_specialty_detail",
            entityId: specialty.detail.id,
            locale,
            fields: {
              overview: data.detail.overview,
              history: data.detail.history,
              ingredients: data.detail.ingredients,
              howToUse: data.detail.howToUse,
              preservation: data.detail.preservation,
            },
            sourceHash: "manual-seed-v1",
          status: "published",
          }
        });
      }
    }
  }

  console.log("Translations seeded successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
