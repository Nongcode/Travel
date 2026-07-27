/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { allPackages, packageCollections as staticCollections } from "@/app/data/travel";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizeContent } from "@/lib/i18n/server";

export type PublicPackage = {
  id: number;
  slug: string;
  name: string;
  destination: string;
  rawDestination: string;
  duration: string;
  price: string;
  summary: string;
  description: string;
  minPeople?: number | null;
  maxPeople?: number | null;
  peopleNote?: string;
  offer?: { id: number; title: string; description?: string; tag?: string } | null;
  image: string;
  status: string;
  detailContent?: unknown;
};

export type PublicPackageCollection = {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  items: PublicPackage[];
};

const fallbackImage = "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80";

const collectionTranslations: Record<string, Record<string, { eyebrow: string; title: string; description: string }>> = {
  family: {
    en: {
      eyebrow: "Family travel",
      title: "Easy Vietnam holidays for families and multi-generation groups",
      description: "Easy-paced Vietnam itineraries with comfortable hotels, child-friendly meals, reliable transfers and enough rest time for every generation.",
    },
    "zh-CN": {
      eyebrow: "\u5bb6\u5ead\u65c5\u884c",
      title: "\u9002\u5408\u5927\u5bb6\u5ead\u7684\u8f7b\u677e\u5047\u671f",
      description: "\u8282\u594f\u8f7b\u677e\u7684\u884c\u7a0b\uff0c\u8212\u9002\u9152\u5e97\uff0c\u9002\u5408\u513f\u7ae5\u7684\u9910\u98df\uff0c\u5e76\u4e3a\u6bcf\u4e00\u4ee3\u4eba\u7559\u51fa\u5145\u8db3\u4f11\u606f\u65f6\u95f4\u3002",
    },
  },
  youth: {
    en: {
      eyebrow: "Trips with friends",
      title: "Vietnam adventures for friends who collect stories",
      description: "A livelier Vietnam travel pace with scenic photo stops, local experiences, street-food suggestions and flexible days made for young groups.",
    },
    "zh-CN": {
      eyebrow: "\u670b\u53cb\u51fa\u884c",
      title: "\u4e3a\u559c\u6b22\u63a2\u7d22\u548c\u6536\u85cf\u56de\u5fc6\u7684\u670b\u53cb\u6253\u9020\u7684\u65c5\u7a0b",
      description: "\u66f4\u6709\u6d3b\u529b\u7684\u8282\u594f\uff0c\u66f4\u591a\u62cd\u7167\u70b9\uff0c\u672c\u5730\u4f53\u9a8c\u548c\u9002\u5408\u5e74\u8f7b\u56e2\u961f\u7684\u7f8e\u98df\u5efa\u8bae\u3002",
    },
  },
  vietnam: {
    en: {
      eyebrow: "Best destinations in Vietnam",
      title: "Signature Vietnam journeys for first-time visitors",
      description: "Selected scenic Vietnam destinations for first-time visitors who want an easy itinerary to understand, consult and customize before arrival.",
    },
    "zh-CN": {
      eyebrow: "\u8d8a\u5357\u7cbe\u9009\u76ee\u7684\u5730",
      title: "\u63a2\u7d22\u8d8a\u5357\u7684\u7ecf\u5178\u884c\u7a0b",
      description: "\u7cbe\u9009\u98ce\u666f\u7a81\u51fa\u7684\u76ee\u7684\u5730\uff0c\u9002\u5408\u9996\u6b21\u5230\u8bbf\u6216\u9700\u8981\u6613\u4e8e\u54a8\u8be2\u5b9a\u5236\u884c\u7a0b\u7684\u5ba2\u4eba\u3002",
    },
  },
};

function formatPriceText(price: string, locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  if (normalizedLocale === "vi") return price;
  const match = price.match(/[\d.]+/);
  if (!match) return price;
  const amount = match[0].replace(/\./g, ",");
  return normalizedLocale === "zh-CN" ? `${amount} VND` : `From ${amount} VND`;
}

const staticPackageTranslations: Record<string, Record<string, { name: string; summary: string }>> = {
  "hoi-an-di-cham": {
    en: { name: "Slow-paced Hoi An", summary: "Slow itinerary, boutique hotel, cooking class and Hoai river sunset boat tour." },
    "zh-CN": { name: "Ã¦â€¦Â¢Ã¨Å â€šÃ¥Â¥ÂÃ¤Â¼Å¡Ã¥Â®â€°", summary: "Ã¦â€¦Â¢Ã¨Å â€šÃ¥Â¥ÂÃ¨Â¡Å’Ã§Â¨â€¹Ã¯Â¼Å’Ã§Â²Â¾Ã¥â€œÂÃ©â€¦â€™Ã¥Âºâ€”Ã¯Â¼Å’Ã§Æ’Â¹Ã©Â¥ÂªÃ¨Â¯Â¾Ã§Â¨â€¹Ã¥â€™Å’Ã¦Â·Â®Ã¦Â²Â³Ã¦â€”Â¥Ã¨ÂÂ½Ã¦Â¸Â¸Ã¨Ë†Â¹Ã£â‚¬â€š" }
  },
  "cung-duong-anh-ha-giang": {
    en: { name: "Ha Giang Photo Tour", summary: "Sunrise photography route, terraced fields, Dong Van old town and Hmong villages." },
    "zh-CN": { name: "Ã¦Â²Â³Ã¦Â±Å¸Ã¦â€˜â€žÃ¥Â½Â±Ã¤Â¹â€¹Ã¦â€”â€¦", summary: "Ã¦â€”Â¥Ã¥â€¡ÂºÃ¦â€˜â€žÃ¥Â½Â±Ã¨Â·Â¯Ã§ÂºÂ¿Ã¯Â¼Å’Ã¦Â¢Â¯Ã§â€Â°Ã¯Â¼Å’Ã¥ÂÅ’Ã¦â€“â€¡Ã¥ÂÂ¤Ã©â€¢â€¡Ã¥â€™Å’Ã¨â€¹â€”Ã¦â€”ÂÃ¦Ââ€˜Ã¨ÂÂ½Ã£â‚¬â€š" }
  },
  "ky-nghi-gia-dinh-phu-quoc": {
    en: { name: "Phu Quoc Family Holiday", summary: "Beachfront resort, minimal travel itinerary, kid-friendly restaurant recommendations." },
    "zh-CN": { name: "Ã¥Â¯Å’Ã¥â€ºÂ½Ã¥Â²â€ºÃ¥Â®Â¶Ã¥ÂºÂ­Ã¥Ââ€¡Ã¦Å“Å¸", summary: "Ã¦ÂµÂ·Ã¦Â»Â¨Ã¥ÂºÂ¦Ã¥Ââ€¡Ã¦Ââ€˜Ã¯Â¼Å’Ã¦Å¾ÂÃ§Â®â‚¬Ã¨Â¡Å’Ã§Â¨â€¹Ã¯Â¼Å’Ã©â‚¬â€šÃ¥ÂË†Ã¥â€žÂ¿Ã§Â«Â¥Ã§Å¡â€žÃ©Â¤ÂÃ¥Å½â€¦Ã¦Å½Â¨Ã¨ÂÂÃ£â‚¬â€š" }
  },
  "ninh-binh-cuoi-tuan": {
    en: { name: "Ninh Binh Weekend", summary: "Trang An boat trip, green resort stay and just enough itinerary for families with kids." },
    "zh-CN": { name: "Ã¥Â®ÂÃ¥Â¹Â³Ã¥â€˜Â¨Ã¦Å“Â«", summary: "Ã©â€¢Â¿Ã¥Â®â€°Ã¤Â¹ËœÃ¨Ë†Â¹Ã¦Â¸Â¸Ã¨Â§Ë†Ã¯Â¼Å’Ã§Â»Â¿Ã¨â€°Â²Ã¥ÂºÂ¦Ã¥Ââ€¡Ã¦Ââ€˜Ã¤Â½ÂÃ¥Â®Â¿Ã¤Â»Â¥Ã¥ÂÅ Ã©â‚¬â€šÃ¥ÂË†Ã¦Å“â€°Ã¥Â­Â©Ã¥Â­ÂÃ§Å¡â€žÃ¥Â®Â¶Ã¥ÂºÂ­Ã§Å¡â€žÃ¨Â¡Å’Ã§Â¨â€¹Ã£â‚¬â€š" }
  },
  "da-nang-nghi-duong-bien": {
    en: { name: "Da Nang Beach Retreat", summary: "Beachfront resort, private transfer, combined with Hoi An ancient town and accessible attractions." },
    "zh-CN": { name: "Ã¥Â²ËœÃ¦Â¸Â¯Ã¦ÂµÂ·Ã¦Â»Â©Ã¥ÂºÂ¦Ã¥Ââ€¡", summary: "Ã¦ÂµÂ·Ã¦Â»Â¨Ã¥ÂºÂ¦Ã¥Ââ€¡Ã¦Ââ€˜Ã¯Â¼Å’Ã§Â§ÂÃ¤ÂºÂºÃ¦Å½Â¥Ã©â‚¬ÂÃ¯Â¼Å’Ã§Â»â€œÃ¥ÂË†Ã¤Â¼Å¡Ã¥Â®â€°Ã¥ÂÂ¤Ã©â€¢â€¡Ã¥â€™Å’Ã¦â€”Â Ã©Å¡Å“Ã§Â¢ÂÃ¦â„¢Â¯Ã§â€šÂ¹Ã£â‚¬â€š" }
  },
  "quy-nhon-roadtrip": {
    en: { name: "Quy Nhon Roadtrip", summary: "Coastal road, Eo Gio, Ky Co and local seafood restaurants for freedom lovers." },
    "zh-CN": { name: "Ã¥Â½â€™Ã¤Â»ÂÃ¥â€¦Â¬Ã¨Â·Â¯Ã¦â€”â€¦Ã¨Â¡Å’", summary: "Ã¦Â²Â¿Ã¦ÂµÂ·Ã¥â€¦Â¬Ã¨Â·Â¯Ã¯Â¼Å’Eo GioÃ¯Â¼Å’Ky Co Ã¥â€™Å’Ã©â‚¬â€šÃ¥ÂË†Ã¨â€¡ÂªÃ§â€Â±Ã§Ë†Â±Ã¥Â¥Â½Ã¨â‚¬â€¦Ã§Å¡â€žÃ¥Â½â€œÃ¥Å“Â°Ã¦ÂµÂ·Ã©Â²Å“Ã©Â¤ÂÃ¥Å½â€¦Ã£â‚¬â€š" }
  },
  "da-lat-san-may": {
    en: { name: "Da Lat Cloud Hunting", summary: "Cloud hunting, forest cafe, night market and homestay with communal space." },
    "zh-CN": { name: "Ã¥Â¤Â§Ã¥ÂÂ»Ã¥Â¯Â»Ã¤Âºâ€˜", summary: "Ã¥Â¯Â»Ã¤Âºâ€˜Ã¯Â¼Å’Ã¦Â£Â®Ã¦Å¾â€”Ã¥â€™â€“Ã¥â€¢Â¡Ã©Â¦â€ Ã¯Â¼Å’Ã¥Â¤Å“Ã¥Â¸â€šÃ¥â€™Å’Ã¥Â¸Â¦Ã¥â€¦Â¬Ã¥â€¦Â±Ã§Â©ÂºÃ©â€”Â´Ã§Å¡â€žÃ¥Â¯â€žÃ¥Â®Â¿Ã¥Â®Â¶Ã¥ÂºÂ­Ã£â‚¬â€š" }
  },
  "con-dao-nghi-duong-rieng-tu": {
    en: { name: "Con Dao Private Retreat", summary: "Quiet beach space, private resort, suitable for families needing rest and recharge." },
    "zh-CN": { name: "Ã¦Ëœâ€ Ã¤Â»â€˜Ã¥Â²â€ºÃ§Â§ÂÃ¤ÂºÂºÃ¥ÂºÂ¦Ã¥Ââ€¡", summary: "Ã¥Â®â€°Ã©Ââ„¢Ã§Å¡â€žÃ¦ÂµÂ·Ã¦Â»Â©Ã§Â©ÂºÃ©â€”Â´Ã¯Â¼Å’Ã§Â§ÂÃ¤ÂºÂºÃ¥ÂºÂ¦Ã¥Ââ€¡Ã¦Ââ€˜Ã¯Â¼Å’Ã©â‚¬â€šÃ¥ÂË†Ã©Å“â‚¬Ã¨Â¦ÂÃ¤Â¼â€˜Ã¦ÂÂ¯Ã¥â€™Å’Ã¥â€¦â€¦Ã§â€ÂµÃ§Å¡â€žÃ¥Â®Â¶Ã¥ÂºÂ­Ã£â‚¬â€š" }
  },
  "ha-long-gia-dinh-du-thuyen": {
    en: { name: "Ha Long Family Cruise", summary: "Overnight bay experience, light meals and itinerary suitable for multi-generational families." },
    "zh-CN": { name: "Ã¤Â¸â€¹Ã©Â¾â„¢Ã¦Â¹Â¾Ã¥Â®Â¶Ã¥ÂºÂ­Ã¦Â¸Â¸Ã¨Â½Â®", summary: "Ã¨Â¿â€¡Ã¥Â¤Å“Ã¦ÂµÂ·Ã¦Â¹Â¾Ã¤Â½â€œÃ©ÂªÅ’Ã¯Â¼Å’Ã¤Â¾Â¿Ã©Â¤ÂÃ¥â€™Å’Ã©â‚¬â€šÃ¥ÂË†Ã¥Â¤Å¡Ã¤Â»Â£Ã¥Â®Â¶Ã¥ÂºÂ­Ã§Å¡â€žÃ¨Â¡Å’Ã§Â¨â€¹Ã£â‚¬â€š" }
  },
  "phu-yen-tuoi-tre-bien-xanh": {
    en: { name: "Phu Yen Youth Blue Sea", summary: "Coastal route, local seafood and check-in spots for freedom-loving friend groups." },
    "zh-CN": { name: "Ã¥Â¯Å’Ã¥Â®â€°Ã©Ââ€™Ã¦ËœÂ¥Ã§Â¢Â§Ã¦ÂµÂ·", summary: "Ã¦Â²Â¿Ã¦ÂµÂ·Ã¨Â·Â¯Ã§ÂºÂ¿Ã¯Â¼Å’Ã¥Â½â€œÃ¥Å“Â°Ã¦ÂµÂ·Ã©Â²Å“Ã¥â€™Å’Ã©â‚¬â€šÃ¥ÂË†Ã§Æ’Â­Ã§Ë†Â±Ã¨â€¡ÂªÃ§â€Â±Ã§Å¡â€žÃ¦Å“â€¹Ã¥Ââ€¹Ã¥â€ºÂ¢Ã¤Â½â€œÃ§Å¡â€žÃ¦â€°â€œÃ¥ÂÂ¡Ã§â€šÂ¹Ã£â‚¬â€š" }
  },
  "hoi-an-dem-pho-co": {
    en: { name: "Hoi An Old Town Night", summary: "Old town photography, lantern release, craft workshop and optimal itinerary for young groups." },
    "zh-CN": { name: "Ã¤Â¼Å¡Ã¥Â®â€°Ã¥ÂÂ¤Ã©â€¢â€¡Ã¤Â¹â€¹Ã¥Â¤Å“", summary: "Ã¥ÂÂ¤Ã©â€¢â€¡Ã¦â€˜â€žÃ¥Â½Â±Ã¯Â¼Å’Ã¦â€Â¾Ã¥Â­â€Ã¦ËœÅ½Ã§ÂÂ¯Ã¯Â¼Å’Ã¦â€°â€¹Ã¥Â·Â¥Ã¨â€°ÂºÃ¤Â½Å“Ã¥ÂÅ Ã¥â€™Å’Ã©â‚¬â€šÃ¥ÂË†Ã¥Â¹Â´Ã¨Â½Â»Ã¥â€ºÂ¢Ã¤Â½â€œÃ§Å¡â€žÃ¦Å“â‚¬Ã¤Â½Â³Ã¨Â¡Å’Ã§Â¨â€¹Ã£â‚¬â€š" }
  },
  "sa-pa-mua-may": {
    en: { name: "Sa Pa Cloud Season", summary: "Terraced fields, highland villages, cloud hunting and Northwest cultural experience." },
    "zh-CN": { name: "Ã¦Â²â„¢Ã¥ÂÂÃ¤Âºâ€˜Ã¥Â­Â£", summary: "Ã¦Â¢Â¯Ã§â€Â°Ã¯Â¼Å’Ã©Â«ËœÃ¥Å“Â°Ã¦Ââ€˜Ã¥Âºâ€žÃ¯Â¼Å’Ã¥Â¯Â»Ã¤Âºâ€˜Ã¥â€™Å’Ã¨Â¥Â¿Ã¥Å’â€”Ã¦â€“â€¡Ã¥Å’â€“Ã¤Â½â€œÃ©ÂªÅ’Ã£â‚¬â€š" }
  },
  "ninh-binh-di-san-xanh": {
    en: { name: "Ninh Binh Green Heritage", summary: "Trang An, Mua Cave, Tam Coc and typical Northern green viewpoints." },
    "zh-CN": { name: "Ã¥Â®ÂÃ¥Â¹Â³Ã§Â»Â¿Ã¨â€°Â²Ã©Ââ€”Ã¤ÂºÂ§", summary: "Ã©â€¢Â¿Ã¥Â®â€°Ã¯Â¼Å’Mua CaveÃ¯Â¼Å’Tam Coc Ã¥â€™Å’Ã¥â€¦Â¸Ã¥Å¾â€¹Ã§Å¡â€žÃ¥Å’â€”Ã¦â€“Â¹Ã§Â»Â¿Ã¨â€°Â²Ã¨Â§â€šÃ¦â„¢Â¯Ã§â€šÂ¹Ã£â‚¬â€š" }
  }
};

function fromStaticPackage(item: any, locale = "vi"): PublicPackage {
  const normalizedLocale = normalizeLocale(locale);
  const translated = staticPackageTranslations[item.slug]?.[normalizedLocale];

  return {
    id: item.id,
    slug: item.slug,
    name: translated?.name || item.name,
    destination: item.destination,
    rawDestination: item.destination,
    duration: item.duration,
    price: formatPriceText(item.price || "", locale),
    summary: translated?.summary || item.summary,
    description: translated?.summary || item.description || item.summary,
    minPeople: null,
    maxPeople: null,
    peopleNote: "",
    offer: null,
    image: item.image,
    status: item.status,
  };
}

function fromDbPackage(item: any, locale = "vi"): PublicPackage {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    destination: typeof item.destination === "string" ? item.destination : item.destination?.name || "",
    rawDestination: item.rawDestination || (typeof item.destination === "string" ? item.destination : item.destination?.name || ""),
    duration: item.duration || "",
    price: formatPriceText(item.priceText || item.price || "", locale),
    summary: item.summary || "",
    description: item.description || item.summary || "",
    minPeople: item.minPeople ?? null,
    maxPeople: item.maxPeople ?? null,
    peopleNote: item.peopleNote || "",
    offer: item.offer ? { id: item.offer.id, title: item.offer.title, description: item.offer.description || "", tag: item.offer.tag || "" } : null,
    image: item.imageUrl || item.image || fallbackImage,
    status: item.status,
    detailContent: item.detail || item.detailContent,
  };
}

function localizeCollectionCopy(collection: { eyebrow: string; title: string; description: string; accent: string }, locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const translated = collectionTranslations[collection.accent]?.[normalizedLocale];
  return translated ? { ...collection, ...translated } : collection;
}

function uniquePackages(items: PublicPackage[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.slug || String(item.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueCollections(collections: PublicPackageCollection[]) {
  const seen = new Set<string>();
  return collections.filter((collection) => {
    const key = collection.accent || collection.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ensureMinimumCollectionItems(items: PublicPackage[], fallbackItems: PublicPackage[], minItems = 5) {
  const sourceItems = uniquePackages(items);
  const baseItems = sourceItems.length > 0 ? sourceItems : uniquePackages(fallbackItems);
  if (baseItems.length === 0) return [];

  const result = [...baseItems];
  let index = 0;
  while (result.length < minItems) {
    result.push(baseItems[index % baseItems.length]);
    index += 1;
  }
  return result;
}

export async function getPublicPackages(locale = "vi") {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { id: "asc" },
      include: { destination: true, offer: true, detail: true },
    });
    if (packages.length === 0) return allPackages.map((item) => fromStaticPackage(item, locale));

    const localized = await Promise.all(
      packages.map(async (pkg) => {
        const source = { ...pkg, destination: pkg.destination?.name || "", rawDestination: pkg.destination?.name || "" } as any;
        return fromDbPackage(await localizeContent("package", source, locale), locale);
      }),
    );
    return localized;
  } catch (error) {
    console.error("Failed to load public packages:", error);
    return allPackages.map((item) => fromStaticPackage(item, locale));
  }
}

export async function getPublicPackageBySlug(slug: string, locale = "vi") {
  try {
    const pkg = await prisma.package.findUnique({
      where: { slug },
      include: { destination: true, offer: true, detail: true },
    });
    if (!pkg) {
      const fallback = allPackages.find((item) => item.slug === slug);
      return fallback ? fromStaticPackage(fallback, locale) : null;
    }
    const source = { ...pkg, destination: pkg.destination?.name || "", rawDestination: pkg.destination?.name || "" } as any;
    return fromDbPackage(await localizeContent("package", source, locale), locale);
  } catch (error) {
    console.error("Failed to load public package:", error);
    const fallback = allPackages.find((item) => item.slug === slug);
    return fallback ? fromStaticPackage(fallback, locale) : null;
  }
}

export async function getPublicPackageCollections(locale = "vi"): Promise<PublicPackageCollection[]> {
  const packages = await getPublicPackages(locale);
  const bySlug = new Map(packages.map((pkg) => [pkg.slug, pkg]));

  try {
    const collections = await prisma.packageCollection.findMany({
      orderBy: { id: "asc" },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: { package: { include: { destination: true, offer: true, detail: true } } },
        },
      },
    });

    if (collections.length === 0) throw new Error("NO_COLLECTIONS");

    const mappedCollections = collections.map((collection, index) => {
      const copy = localizeCollectionCopy(
        {
          eyebrow: collection.eyebrow || "",
          title: collection.title,
          description: collection.description || "",
          accent: collection.accent || "collection",
        },
        locale,
      );

      return {
        key: collection.accent || `db-${collection.id}-${index}`,
        ...copy,
        items: ensureMinimumCollectionItems(collection.items.map((item) => bySlug.get(item.package.slug) || fromDbPackage(item.package, locale)).filter(Boolean), packages, 5),
      };
    });

    return uniqueCollections(mappedCollections);
  } catch {
    const mappedCollections = staticCollections.map((collection, index) => {
      const copy = localizeCollectionCopy(collection, locale);
      return {
        key: collection.accent || `static-${index}`,
        ...copy,
        items: ensureMinimumCollectionItems(collection.items.map((item) => bySlug.get(item.slug) || fromStaticPackage(item, locale)), packages, 5),
      };
    });

    return uniqueCollections(mappedCollections);
  }
}



