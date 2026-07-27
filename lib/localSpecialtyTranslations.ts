export type LocalSpecialtyTranslationFields = {
  name: string;
  description: string;
  priceText: string;
  whereToBuy: string;
};

export type LocalSpecialtyDetailTranslationFields = {
  overview: string;
};

export const localSpecialtyContentTranslations: Record<string, Record<string, LocalSpecialtyTranslationFields>> = {
  "nem-chua-thanh-hoa": {
    en: {
      name: "Thanh Hoa fermented pork roll",
      description: "A signature Thanh Hoa specialty with a gentle sour taste, warm chili notes, and the crisp bite of pork skin.",
      priceText: "45,000 - 60,000 VND per bundle of 10",
      whereToBuy: "Cay Da producer, Thang Tuyen producer in Thanh Hoa",
    },
    "zh-CN": {
      name: "清化酸肉卷",
      description: "清化著名特产，酸味柔和、微辣开胃，猪皮带来爽脆口感。",
      priceText: "每十个约 45,000 - 60,000 越南盾",
      whereToBuy: "清化 Cây Đa 作坊、Thắng Tuyến 作坊",
    },
  },
  "cha-muc-ha-long": {
    en: {
      name: "Ha Long hand-pounded squid sausage",
      description: "Hand-pounded squid sausage with the authentic Ha Long texture: springy, savory, and rich in fresh squid flavor.",
      priceText: "350,000 - 450,000 VND per kg",
      whereToBuy: "Cai Dam Market, Ha Long Market 1",
    },
    "zh-CN": {
      name: "下龙手打鱿鱼饼",
      description: "保留下龙传统口感的手打鱿鱼饼，弹牙鲜香，充满新鲜鱿鱼风味。",
      priceText: "每公斤约 350,000 - 450,000 越南盾",
      whereToBuy: "Cái Dăm 市场、下龙一号市场",
    },
  },
  "non-la-bai-tho-hue": {
    en: {
      name: "Hue poem conical hat",
      description: "Hue’s delicate poem conical hat, light and graceful, with hidden verses pressed between the palm leaves.",
      priceText: "80,000 - 150,000 VND per hat",
      whereToBuy: "Dong Ba Market, Tay Ho conical hat craft village",
    },
    "zh-CN": {
      name: "顺化诗意斗笠",
      description: "顺化特色诗意斗笠，轻薄雅致，叶片之间藏有若隐若现的诗句。",
      priceText: "每顶约 80,000 - 150,000 越南盾",
      whereToBuy: "东巴市场、西湖斗笠手工村",
    },
  },
  "lua-ha-dong": {
    en: {
      name: "Ha Dong silk",
      description: "Fine handwoven silk from Van Phuc village, known for its softness, elegant sheen, and refined craftsmanship.",
      priceText: "250,000 - 1,500,000 VND per meter",
      whereToBuy: "Van Phuc Silk Village, Ha Dong",
    },
    "zh-CN": {
      name: "河东丝绸",
      description: "来自万福丝绸村的精致手织真丝，以柔软质感、优雅光泽和细腻工艺闻名。",
      priceText: "每米约 250,000 - 1,500,000 越南盾",
      whereToBuy: "河东万福丝绸村",
    },
  },
};

export const localSpecialtyDetailContentTranslations: Record<string, Record<string, LocalSpecialtyDetailTranslationFields>> = {
  "nem-chua-thanh-hoa": {
    en: {
      overview: "Thanh Hoa fermented pork roll is a traditional food often shared during holidays and gatherings, carrying the distinctive taste of Vietnam’s north-central region.",
    },
    "zh-CN": {
      overview: "清化酸肉卷是节庆和聚会中常见的传统小吃，呈现越南北中部地区独特的酸、辣、脆风味。",
    },
  },
  "cha-muc-ha-long": {
    en: {
      overview: "Ha Long squid sausage is one of Vietnam’s beloved seafood specialties, made from fresh cuttlefish caught around the waters of Ha Long Bay.",
    },
    "zh-CN": {
      overview: "下龙手打鱿鱼饼是越南备受喜爱的海鲜特产之一，通常使用下龙湾海域捕捞的新鲜墨鱼制作。",
    },
  },
  "non-la-bai-tho-hue": {
    en: {
      overview: "The Hue poem conical hat is a cultural symbol of Hue women, expressing gentle beauty, elegance, and quiet poetic charm.",
    },
    "zh-CN": {
      overview: "顺化诗意斗笠是顺化女性文化形象的象征，展现温婉、优雅和含蓄的诗意之美。",
    },
  },
  "lua-ha-dong": {
    en: {
      overview: "Van Phuc silk in Ha Dong has long been admired for being soft, light, breathable, and decorated with crisp, graceful patterns.",
    },
    "zh-CN": {
      overview: "河东万福丝绸长期以柔软、轻薄、透气和纹样清晰优雅而闻名，是越南传统丝织工艺的代表。",
    },
  },
};
