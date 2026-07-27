import { packageDetailExtras } from "@/app/data/travel";
import { normalizeLegacyText } from "@/lib/text/encoding";

export type PackageDetailContent = {
  gallery: string[];
  overviewSuffix: string;
  moments: Array<{ title: string; description: string }>;
  offers: string[];
  included: string[];
  itinerary: string[];
  benefits: string[];
  consultTitle: string;
  consultCopy: string;
  consultPoints: string[];
  seoTitle?: string;
  seoDescription?: string;
  bannerImageUrl?: string;
};

export const defaultPackageDetailContent: PackageDetailContent = {
  gallery: packageDetailExtras.gallery,
  overviewSuffix: "Lịch trình cụ thể có thể điều chỉnh theo số lượng khách, thời gian rảnh, phong cách nghỉ dưỡng và ngân sách mong muốn.",
  moments: [
    {
      title: "Không gian lưu trú lý tưởng",
      description: "Ưu tiên nơi có vị trí thuận tiện, dễ nghỉ ngơi và phù hợp với nhịp chuyến đi.",
    },
    {
      title: "Điểm dừng nổi bật",
      description: "Gợi ý các khung cảnh đáng trải nghiệm và lịch tham quan không bị đơn điệu.",
    },
    {
      title: "Khoảnh khắc đáng nhớ",
      description: "Bổ sung góc chụp đẹp, trải nghiệm địa phương và thời gian tự do hợp lý.",
    },
  ],
  offers: packageDetailExtras.offers,
  included: packageDetailExtras.included,
  itinerary: packageDetailExtras.itinerary,
  benefits: packageDetailExtras.benefits,
  consultTitle: "Giữ lại gói này và nhận tư vấn phù hợp với nhu cầu thực tế.",
  consultCopy: "Chỉ cần để lại email hoặc số điện thoại. TimesGreen sẽ liên hệ để điều chỉnh lịch trình, gợi ý ngân sách và chọn điểm lưu trú phù hợp.",
  consultPoints: [
    "Không cần thanh toán ngay",
    "Điều chỉnh theo gia đình hoặc nhóm bạn",
    "Gửi lại tư vấn trong 24 giờ",
  ],
};

const zhPackageDetailContent: Omit<PackageDetailContent, "gallery" | "seoTitle" | "seoDescription" | "bannerImageUrl"> = {
  overviewSuffix: "具体行程可根据客人数、空闲时间、度假风格和预算灵活调整。",
  moments: [
    {
      title: "理想住宿空间",
      description: "优先选择位置便利、便于休息且符合旅行节奏的住宿。",
    },
    {
      title: "精选停留点",
      description: "推荐值得体验的景色与不单调的参观安排。",
    },
    {
      title: "难忘时刻",
      description: "补充适合拍照的角度、当地体验和合理自由时间。",
    },
  ],
  offers: [
    "首次行程咨询免费",
    "优先为 4 人以上团队推荐合适房型",
    "赠送按目的地整理的行李准备清单",
  ],
  included: [
    "按天参考行程",
    "精选目的地清单",
    "交通方式建议",
    "餐厅与本地体验建议",
    "出发前支持调整行程",
    "网站不要求在线付款",
  ],
  itinerary: [
    "第 1 天：接客、办理入住并体验市中心附近景点。",
    "第 2 天：参观亮点、品尝当地美食并安排自由时间。",
    "第 3 天：休息、购买当地礼物并按需求调整行程。",
  ],
  benefits: [
    "根据人数和预算调整行程咨询",
    "推荐酒店、餐饮地点和合理参观时段",
    "出发前协助准备行李清单",
  ],
  consultTitle: "保留这个套餐，并获得更贴合实际需求的咨询。",
  consultCopy: "只需留下邮箱或电话号码。TimesGreen 会联系你，帮助调整行程、建议预算并选择合适的住宿地点。",
  consultPoints: [
    "无需立即付款",
    "可按家庭或朋友团队调整",
    "24 小时内发送咨询回复",
  ],
};

function normalizeStringArray(items: string[]) {
  return items.map((item) => normalizeLegacyText(item));
}

function normalizeMoments(items: Array<{ title: string; description: string }>) {
  return items.map((item) => ({
    title: normalizeLegacyText(item.title),
    description: normalizeLegacyText(item.description),
  }));
}

function normalizePackageDetailText(content: PackageDetailContent): PackageDetailContent {
  return {
    ...content,
    overviewSuffix: normalizeLegacyText(content.overviewSuffix),
    moments: normalizeMoments(content.moments),
    offers: normalizeStringArray(content.offers),
    included: normalizeStringArray(content.included),
    itinerary: normalizeStringArray(content.itinerary),
    benefits: normalizeStringArray(content.benefits),
    consultTitle: normalizeLegacyText(content.consultTitle),
    consultCopy: normalizeLegacyText(content.consultCopy),
    consultPoints: normalizeStringArray(content.consultPoints),
    seoTitle: content.seoTitle ? normalizeLegacyText(content.seoTitle) : undefined,
    seoDescription: content.seoDescription ? normalizeLegacyText(content.seoDescription) : undefined,
  };
}

function asStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : fallback;
}

function asMoments(value: unknown) {
  if (!Array.isArray(value)) return defaultPackageDetailContent.moments;
  const moments = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      return {
        title: typeof record.title === "string" ? record.title : "",
        description: typeof record.description === "string" ? record.description : "",
      };
    })
    .filter((item): item is { title: string; description: string } => Boolean(item?.title || item?.description));
  return moments.length ? moments : defaultPackageDetailContent.moments;
}

export function normalizePackageDetailContent(value: unknown): PackageDetailContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaultPackageDetailContent;
  const record = value as Record<string, unknown>;
  const overview = typeof record.overview === "string" ? record.overview : "";
  const overviewSuffix = typeof record.overviewSuffix === "string" ? record.overviewSuffix : overview;

  return normalizePackageDetailText({
    gallery: asStringArray(record.gallery, defaultPackageDetailContent.gallery),
    overviewSuffix: overviewSuffix || defaultPackageDetailContent.overviewSuffix,
    moments: asMoments(record.highlights || record.moments),
    offers: asStringArray(record.offers, defaultPackageDetailContent.offers),
    included: asStringArray(record.included, defaultPackageDetailContent.included),
    itinerary: asStringArray(record.itinerary, defaultPackageDetailContent.itinerary),
    benefits: asStringArray(record.benefits, defaultPackageDetailContent.benefits),
    consultTitle: typeof record.consultTitle === "string" ? record.consultTitle : defaultPackageDetailContent.consultTitle,
    consultCopy: typeof record.consultCopy === "string" ? record.consultCopy : defaultPackageDetailContent.consultCopy,
    consultPoints: asStringArray(record.consultPoints, defaultPackageDetailContent.consultPoints),
    seoTitle: typeof record.seoTitle === "string" ? record.seoTitle : undefined,
    seoDescription: typeof record.seoDescription === "string" ? record.seoDescription : undefined,
    bannerImageUrl: typeof record.bannerImageUrl === "string" ? record.bannerImageUrl : undefined,
  });
}

export function localizePackageDetailContent(content: PackageDetailContent, locale: string): PackageDetailContent {
  if (locale !== "zh-CN") return normalizePackageDetailText(content);

  return {
    ...content,
    ...zhPackageDetailContent,
    gallery: content.gallery,
    seoTitle: content.seoTitle,
    seoDescription: content.seoDescription,
    bannerImageUrl: content.bannerImageUrl,
  };
}