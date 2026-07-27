import { packageDetailExtras } from "@/app/data/travel";

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

  return {
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
  };
}
