/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { allPackages, packageCollections as staticCollections } from "@/app/data/travel";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizeContent } from "@/lib/i18n/server";
import { normalizeLegacyText } from "@/lib/text/encoding";

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
    "zh-CN": { name: "慢节奏会安", summary: "慢节奏行程，精品酒店，烹饪课程和淮河日落游船。" }
  },
  "cung-duong-anh-ha-giang": {
    en: { name: "Ha Giang Photo Tour", summary: "Sunrise photography route, terraced fields, Dong Van old town and Hmong villages." },
    "zh-CN": { name: "河江摄影之旅", summary: "日出摄影路线，梯田，同文古镇和苗族村落。" }
  },
  "ky-nghi-gia-dinh-phu-quoc": {
    en: { name: "Phu Quoc Family Holiday", summary: "Beachfront resort, minimal travel itinerary, kid-friendly restaurant recommendations." },
    "zh-CN": { name: "富国岛家庭假期", summary: "海滨度假村，极简行程，适合儿童的餐厅推荐。" }
  },
  "ninh-binh-cuoi-tuan": {
    en: { name: "Ninh Binh Weekend", summary: "Trang An boat trip, green resort stay and just enough itinerary for families with kids." },
    "zh-CN": { name: "宁平周末", summary: "长安乘船游览，绿色度假村住宿以及适合有孩子的家庭的行程。" }
  },
  "da-nang-nghi-duong-bien": {
    en: { name: "Da Nang Beach Retreat", summary: "Beachfront resort, private transfer, combined with Hoi An ancient town and accessible attractions." },
    "zh-CN": { name: "岘港海滩度假", summary: "海滨度假村，私人接送，结合会安古镇和无障碍景点。" }
  },
  "quy-nhon-roadtrip": {
    en: { name: "Quy Nhon Roadtrip", summary: "Coastal road, Eo Gio, Ky Co and local seafood restaurants for freedom lovers." },
    "zh-CN": { name: "归仁公路旅行", summary: "沿海公路，Eo Gio，Ky Co 和适合自由爱好者的当地海鲜餐厅。" }
  },
  "da-lat-san-may": {
    en: { name: "Da Lat Cloud Hunting", summary: "Cloud hunting, forest cafe, night market and homestay with communal space." },
    "zh-CN": { name: "大叻寻云", summary: "寻云，森林咖啡馆，夜市和带公共空间的寄宿家庭。" }
  },
  "con-dao-nghi-duong-rieng-tu": {
    en: { name: "Con Dao Private Retreat", summary: "Quiet beach space, private resort, suitable for families needing rest and recharge." },
    "zh-CN": { name: "昆仑岛私人度假", summary: "安静的海滩空间，私人度假村，适合需要休息和充电的家庭。" }
  },
  "ha-long-gia-dinh-du-thuyen": {
    en: { name: "Ha Long Family Cruise", summary: "Overnight bay experience, light meals and itinerary suitable for multi-generational families." },
    "zh-CN": { name: "下龙湾家庭游轮", summary: "过夜海湾体验，便餐和适合多代家庭的行程。" }
  },
  "phu-yen-tuoi-tre-bien-xanh": {
    en: { name: "Phu Yen Youth Blue Sea", summary: "Coastal route, local seafood and check-in spots for freedom-loving friend groups." },
    "zh-CN": { name: "富安青春碧海", summary: "沿海路线，当地海鲜和适合热爱自由的朋友团体的打卡点。" }
  },
  "hoi-an-dem-pho-co": {
    en: { name: "Hoi An Old Town Night", summary: "Old town photography, lantern release, craft workshop and optimal itinerary for young groups." },
    "zh-CN": { name: "会安古镇之夜", summary: "古镇摄影，放孔明灯，手工艺作坊和适合年轻团体的最佳行程。" }
  },
  "sa-pa-mua-may": {
    en: { name: "Sa Pa Cloud Season", summary: "Terraced fields, highland villages, cloud hunting and Northwest cultural experience." },
    "zh-CN": { name: "沙坝云季", summary: "梯田，高地村庄，寻云和西北文化体验。" }
  },
  "ninh-binh-di-san-xanh": {
    en: { name: "Ninh Binh Green Heritage", summary: "Trang An, Mua Cave, Tam Coc and typical Northern green viewpoints." },
    "zh-CN": { name: "宁平绿色遗产", summary: "长安，Mua Cave，Tam Coc 和典型的北方绿色观景点。" }
  }
};

function fromStaticPackage(item: any, locale = "vi"): PublicPackage {
  const normalizedLocale = normalizeLocale(locale);
  const translated = staticPackageTranslations[item.slug]?.[normalizedLocale];

  return {
    id: item.id,
    slug: item.slug,
    name: normalizeLegacyText(translated?.name || item.name),
    destination: normalizeLegacyText(item.destination),
    rawDestination: normalizeLegacyText(item.destination),
    duration: normalizeLegacyText(item.duration),
    price: formatPriceText(item.price || "", locale),
    summary: normalizeLegacyText(translated?.summary || item.summary),
    description: normalizeLegacyText(translated?.summary || item.description || item.summary),
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
    name: normalizeLegacyText(item.name),
    destination: normalizeLegacyText(typeof item.destination === "string" ? item.destination : item.destination?.name || ""),
    rawDestination: normalizeLegacyText(item.rawDestination || (typeof item.destination === "string" ? item.destination : item.destination?.name || "")),
    duration: normalizeLegacyText(item.duration || ""),
    price: formatPriceText(item.priceText || item.price || "", locale),
    summary: normalizeLegacyText(item.summary || ""),
    description: normalizeLegacyText(item.description || item.summary || ""),
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



