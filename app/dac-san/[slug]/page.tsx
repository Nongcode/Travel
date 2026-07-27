import { absoluteUrl, DEFAULT_OG_IMAGE_PATH, indexRobots, publicAlternates } from "@/lib/seo";
import { headers } from "next/headers";
import { PageDisabled } from "../../components/PageDisabled";
import { notFound } from "next/navigation";
import { JsonLd } from "../../components/JsonLd";
import { LeadForm } from "../../components/LeadForm";
import { PackageDetailGallery } from "../../components/PackageDetailGallery";
import { SiteHeader } from "../../components/SiteHeader";
import { normalizeLocale } from "@/lib/i18n/config";
import { getStaticTranslationMap, translateFromMap, localizeContent } from "@/lib/i18n/server";
import prisma from "@/lib/prisma";
import { isSitePageInactive } from "@/lib/siteSettings";

type SpecialtyDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const specialties = await prisma.localSpecialty.findMany({ where: { status: "Hiển thị" } });
  return specialties.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: SpecialtyDetailPageProps) {
  const { slug } = await params;
  const item = await prisma.localSpecialty.findUnique({ where: { slug } });

  if (!item || item.status !== "Hiển thị") {
    return { title: "Không tìm thấy đặc sản | TimesGreen" };
  }

  const title = item.name + " | TimesGreen";
  const description = item.description || "";
  const path = `/dac-san/${item.slug}`;
  const url = absoluteUrl(path);
  const imageUrl = item.imageUrl || absoluteUrl(DEFAULT_OG_IMAGE_PATH);

  return {
    title,
    description,
    alternates: publicAlternates(path),
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: imageUrl }],
    },
    robots: indexRobots,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function SpecialtyDetailPage({ params }: SpecialtyDetailPageProps) {
  if (await isSitePageInactive("page_local_specialties_status")) {
    return <PageDisabled pageName="Đặc sản địa phương" />;
  }

  const { slug } = await params;
  const locale = normalizeLocale((await headers()).get("x-locale"));
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);
  const local = (values: Record<string, string>) => values[locale] || values.vi;

  const itemRaw = await prisma.localSpecialty.findUnique({
    where: { slug },
    include: { detail: true },
  });

  if (!itemRaw || itemRaw.status !== "Hiển thị") notFound();

  // Fetch translations
  const item = await localizeContent("local_specialty", itemRaw, locale);

  const detailRaw = itemRaw.detail;
  const detailLocalized = detailRaw ? await localizeContent("local_specialty_detail", detailRaw, locale) : null;
  const detail = {
    bannerImageUrl: detailLocalized?.bannerImageUrl || "",
    overview: detailLocalized?.overview || "",
    history: detailLocalized?.history || "",
    ingredients: detailLocalized?.ingredients || "",
    howToUse: detailLocalized?.howToUse || "",
    preservation: detailLocalized?.preservation || "",
  };

  const allSpecialtiesRaw = await prisma.localSpecialty.findMany({ where: { status: "Hiển thị" } });

  const specialtyNames = await Promise.all(
    allSpecialtiesRaw.map(async (s) => {
      const localized = await localizeContent("local_specialty", s, locale);
      return localized.name;
    })
  );

  const bannerImage = detail.bannerImageUrl || item.imageUrl || "https://images.unsplash.com/photo-1555931202-3c1a7042fbd1?auto=format&fit=crop&q=80&w=1600";
  const gallery = [bannerImage]; // We don't have multiple images for specialties yet, just the main and banner

  const quickFacts = [
    { icon: "wallet", label: t("localSpecialty", "price", "Giá tham khảo"), value: item.priceText },
    { icon: "pin", label: t("localSpecialty", "whereToBuy", "Nơi mua"), value: item.whereToBuy },
  ];

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://timesgreen.net";
  const canonicalUrl = `${baseUrl}/dac-san/${item.slug}`;
  const specialtyImage = item.imageUrl || `${baseUrl}/uploads/logos/logo-1784804267099-cda8540c.png`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: item.name,
        description: item.description || "",
        image: [specialtyImage],
        url: canonicalUrl,
        brand: {
          "@type": "Organization",
          name: "TimesGreen",
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "VND",
          price: item.priceText ? item.priceText.replace(/[^0-9]/g, "") || "0" : "0",
          availability: "https://schema.org/InStock",
          url: canonicalUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "TimesGreen", item: baseUrl },
          { "@type": "ListItem", position: 2, name: "Dac san", item: `${baseUrl}/dac-san` },
          { "@type": "ListItem", position: 3, name: item.name, item: canonicalUrl },
        ],
      },
    ],
  };

  return (
    <main>
      <JsonLd data={jsonLd} />
      <SiteHeader variant="hero" />

      <section className="page-hero detail-hero" style={{ backgroundImage: "linear-gradient(90deg, rgba(10, 20, 17, 0.78), rgba(10, 20, 17, 0.26)), url(" + bannerImage + ")" }}>
        <p className="eyebrow">{t("localSpecialty", "hero_eyebrow", "Tinh hoa địa phương")}</p>
        <h1>{item.name}</h1>
        <p>{item.description}</p>
      </section>

      <section className="package-detail-hero">
        <div className="detail-hero-copy">
          <p className="eyebrow">{t("localSpecialty", "detail_eyebrow", "Khám phá đặc sản")}</p>
          <h2>{item.name}</h2>
          <p>{item.description}</p>
          <div className="detail-hero-actions">
            <a href="#detail-consult">{t("localSpecialty", "consult_now", "Liên hệ mua hàng")}</a>
            <span>{item.priceText}</span>
          </div>

          <div className="detail-quick-facts">
            {quickFacts.map((fact) => (
              <article className="detail-fact-card" key={`${fact.icon}-${fact.label}`}>
                <span className={"detail-fact-icon " + fact.icon} aria-hidden="true" />
                <div>
                  <strong>{fact.value}</strong>
                  <small>{fact.label}</small>
                </div>
              </article>
            ))}
          </div>
        </div>

        <PackageDetailGallery images={gallery} title={item.name} />
      </section>

      <section className="package-detail-shell">
        <aside className="detail-summary-card">
          <span className="status-badge available">{item.type === "FOOD" ? t("localSpecialty", "type_food", "Ẩm thực") : t("localSpecialty", "type_handicraft", "Thủ công mỹ nghệ")}</span>
          <h2>{item.priceText}</h2>
          <dl>
            <div><dt>{t("localSpecialty", "whereToBuy", "Nơi mua")}</dt><dd>{item.whereToBuy}</dd></div>
          </dl>
          <a href="#detail-consult">{local({ vi: "Nhận báo giá", en: "Get quotation", "zh-CN": "获取报价" })}</a>
        </aside>

        <div className="detail-content">
          <section>
            <p className="eyebrow">{local({ vi: "Tổng quan", en: "Overview", "zh-CN": "概览" })}</p>
            <h2>{item.name}</h2>
            <p>{detail.overview || item.description}</p>
          </section>

          {detail.history && (
            <section>
              <p className="eyebrow">{local({ vi: "Lịch sử & Nguồn gốc", en: "History & Origin", "zh-CN": "历史与起源" })}</p>
              <h2>{local({ vi: "Câu chuyện đằng sau", en: "The story behind", "zh-CN": "背后的故事" })}</h2>
              <p>{detail.history}</p>
            </section>
          )}

          {detail.ingredients && (
            <section>
              <p className="eyebrow">{local({ vi: "Thành phần", en: "Ingredients", "zh-CN": "成分" })}</p>
              <h2>{local({ vi: "Nguyên liệu làm nên đặc sản", en: "Materials used", "zh-CN": "使用的材料" })}</h2>
              <p>{detail.ingredients}</p>
            </section>
          )}

          {detail.howToUse && (
            <section className="detail-grid-section">
              <div>
                <p className="eyebrow">{local({ vi: "Hướng dẫn sử dụng", en: "How to use", "zh-CN": "如何使用" })}</p>
                <h2>{local({ vi: "Cách thưởng thức trọn vẹn", en: "How to enjoy", "zh-CN": "如何享受" })}</h2>
                <p>{detail.howToUse}</p>
              </div>
              {detail.preservation && (
                <div>
                  <p className="eyebrow">{local({ vi: "Bảo quản", en: "Preservation", "zh-CN": "保存" })}</p>
                  <h2>{local({ vi: "Lưu ý bảo quản", en: "Preservation notes", "zh-CN": "保存注意事项" })}</h2>
                  <p>{detail.preservation}</p>
                </div>
              )}
            </section>
          )}
        </div>
      </section>

      <section className="detail-consult-band" id="detail-consult">
        <div className="detail-consult-copy">
          <p className="eyebrow">{local({ vi: "Liên hệ đặt hàng", en: "Order contact", "zh-CN": "订单联系" })}</p>
          <h2>{local({ vi: "Bạn muốn mua đặc sản này?", en: "Want to buy this specialty?", "zh-CN": "想买这个特产吗？" })}</h2>
          <p>{local({ vi: "Để lại thông tin, nhân viên tư vấn sẽ liên hệ để báo giá chi tiết và hỗ trợ đặt hàng.", en: "Leave your information, our consultant will contact you with a detailed quote and support your order.", "zh-CN": "留下您的信息，我们的顾问将联系您提供详细报价并支持您的订单。" })}</p>
          <div className="detail-consult-points">
            <span>{local({ vi: "Giao hàng tận nơi", en: "Delivery", "zh-CN": "送货上门" })}</span>
            <span>{local({ vi: "Đảm bảo chất lượng", en: "Quality guarantee", "zh-CN": "质量保证" })}</span>
          </div>
        </div>
        <LeadForm packages={specialtyNames} defaultPackage={item.name} />
      </section>
    </main>
  );
}
