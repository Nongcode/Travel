import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { LeadForm } from "../../components/LeadForm";
import { PackageDetailGallery } from "../../components/PackageDetailGallery";
import { SiteHeader } from "../../components/SiteHeader";
import { destinations, packageDetailExtras, packageDetailMediaBySlug } from "../../data/travel";
import { normalizeLocale } from "@/lib/i18n/config";
import { getStaticTranslationMap, translateFromMap } from "@/lib/i18n/server";
import { normalizePackageDetailContent } from "@/lib/packageDetailContent";
import { getPublicPackageBySlug, getPublicPackages } from "@/lib/packages";

type PackageDetailPageProps = {
  params: Promise<{ slug: string }>;
};

import { getStatusStyleAndLabel } from "@/lib/status";

export async function generateStaticParams() {
  const packages = await getPublicPackages("vi");
  return packages.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PackageDetailPageProps) {
  const { slug } = await params;
  const item = await getPublicPackageBySlug(slug, "vi");

  if (!item) {
    return { title: "Không tìm thấy gói du lịch | VietVista" };
  }

  return {
    title: item.name + " | VietVista",
    description: item.description || item.summary,
  };
}

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { slug } = await params;
  const locale = normalizeLocale((await headers()).get("x-locale"));
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);
  const local = (values: Record<string, string>) => values[locale] || values.vi;
  const item = await getPublicPackageBySlug(slug, locale);

  if (!item) notFound();

  const packages = await getPublicPackages(locale);
  const packageNames = packages.map((p) => p.name);

  const media = packageDetailMediaBySlug[item.slug];
  const detailContent = normalizePackageDetailContent(item.detailContent);
  const detailGallery = detailContent.gallery.length ? detailContent.gallery : [];
  const gallery = detailGallery.length ? detailGallery : media?.gallery?.length ? media.gallery : [item.image, ...packageDetailExtras.gallery].slice(0, 5);
  const flexibleConsulting = t("packageDetail", "flexible", "Tư vấn linh hoạt");
  const { statusClass, statusLabel } = getStatusStyleAndLabel(item.status, locale, t);
  const peopleRange = item.peopleNote || (item.minPeople && item.maxPeople ? `${item.minPeople} - ${item.maxPeople} khách` : item.minPeople ? `Từ ${item.minPeople} khách` : "");
  const quickFacts = [
    { icon: "calendar", label: t("packageDetail", "duration", "Thời lượng"), value: item.duration },
    { icon: "pin", label: t("packageDetail", "destination", "Điểm đến"), value: item.destination },
    ...(peopleRange ? [{ icon: "spark", label: t("packageDetail", "people", "Số người phù hợp"), value: peopleRange }] : []),
    { icon: "spark", label: t("packageDetail", "type", "Hình thức"), value: flexibleConsulting },
    { icon: "wallet", label: t("packageDetail", "budget", "Ngân sách"), value: item.price },
  ];
  const experienceMoments = detailContent.moments.map((moment, index) => ({
    ...moment,
    image: gallery[index + 1] ?? gallery[0],
  }));

  return (
    <main>
      <SiteHeader variant="hero" />

      <section className="page-hero detail-hero" style={{ backgroundImage: "linear-gradient(90deg, rgba(10, 20, 17, 0.78), rgba(10, 20, 17, 0.26)), url(" + (detailContent.bannerImageUrl || media?.banner || gallery[0]) + ")" }}>
        <p className="eyebrow">{t("packageDetail", "hero_eyebrow", "Điểm đến đặc trưng")}</p>
        <h1>{item.destination}</h1>
        <p>{t("packageDetail", "hero_copy", "Khung cảnh, ánh sáng và những điểm dừng chân phù hợp nhất với tinh thần của hành trình này.")}</p>
      </section>

      <section className="package-detail-hero">
        <div className="detail-hero-copy">
          <p className="eyebrow">{t("packageDetail", "detail_eyebrow", "Chi tiết hành trình")}</p>
          <h2>{item.name}</h2>
          <p>{item.description || item.summary}</p>
          <div className="detail-hero-actions">
            <a href="#detail-consult">{t("packageDetail", "consult_now", "Nhận tư vấn ngay")}</a>
            <span>{item.price}</span>
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
          <span className={statusClass}>{statusLabel}</span>
          <h2>{item.price}</h2>
          <dl>
            <div><dt>{t("packageDetail", "destination", "Điểm đến")}</dt><dd>{item.destination}</dd></div>
            <div><dt>{t("packageDetail", "duration", "Thời gian")}</dt><dd>{item.duration}</dd></div>
            {peopleRange && <div><dt>{t("packageDetail", "people", "Số người phù hợp")}</dt><dd>{peopleRange}</dd></div>}
            <div><dt>{t("packageDetail", "type", "Hình thức")}</dt><dd>{flexibleConsulting}</dd></div>
          </dl>
          <a href="#detail-consult">{local({ vi: "Gửi yêu cầu tư vấn", en: "Send consultation request", "zh-CN": "发送咨询请求" })}</a>
        </aside>

        <div className="detail-content">
          <section>
            <p className="eyebrow">{local({ vi: "Tổng quan", en: "Overview", "zh-CN": "概览" })}</p>
            <h2>{local({ vi: "Gói này phù hợp với ai?", en: "Who is this package for?", "zh-CN": "这个套餐适合谁？" })}</h2>
            <p>{item.description || item.summary} {detailContent.overviewSuffix}</p>
          </section>

          <section>
            <p className="eyebrow">{local({ vi: "Trải nghiệm nổi bật", en: "Highlights", "zh-CN": "亮点体验" })}</p>
            <h2>{local({ vi: "Nội dung nên có trong hành trình", en: "Recommended elements for the journey", "zh-CN": "行程中的推荐内容" })}</h2>
            <div className="detail-experience-grid">
              {experienceMoments.map((moment, index) => (
                <article className="detail-experience-card" key={`${moment.title}-${index}`}>
                  <div className="detail-experience-image" style={{ backgroundImage: "url(" + moment.image + ")" }} />
                  <div className="detail-experience-copy"><h3>{moment.title}</h3><p>{moment.description}</p></div>
                </article>
              ))}
            </div>
          </section>

          <section className="detail-grid-section">
            <div>
              <p className="eyebrow">{local({ vi: "Ưu đãi", en: "Offers", "zh-CN": "优惠" })}</p>
              <h2>{local({ vi: "Điểm cộng khi đặt chỗ sớm", en: "Perks for early planning", "zh-CN": "提前规划的好处" })}</h2>
              <ul className="detail-icon-list offers-list">
                {detailContent.offers.map((offer, index) => <li key={`${offer}-${index}`}><span className={"detail-list-icon offer-icon-" + (index + 1)} aria-hidden="true" /><p>{offer}</p></li>)}
              </ul>
            </div>
            <div>
              <p className="eyebrow">{local({ vi: "Tiện ích", en: "Included", "zh-CN": "包含" })}</p>
              <h2>{local({ vi: "Bao gồm trong gói tư vấn", en: "Included in the consultation", "zh-CN": "咨询服务包含" })}</h2>
              <ul className="detail-icon-list included-list">
                {detailContent.included.map((included, index) => <li key={`${included}-${index}`}><span className={"detail-list-icon included-icon-" + ((index % 3) + 1)} aria-hidden="true" /><p>{included}</p></li>)}
              </ul>
            </div>
          </section>

          <section>
            <p className="eyebrow">{local({ vi: "Lịch trình mẫu", en: "Sample itinerary", "zh-CN": "参考行程" })}</p>
            <h2>{local({ vi: "Khung hành trình tham khảo", en: "Suggested itinerary frame", "zh-CN": "建议行程框架" })}</h2>
            <div className="itinerary-list">
              {detailContent.itinerary.map((step, index) => <article key={`${step}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></article>)}
            </div>
          </section>

          <section>
            <p className="eyebrow">{local({ vi: "Lý do nên chọn", en: "Why choose this", "zh-CN": "选择理由" })}</p>
            <h2>{local({ vi: "Những hỗ trợ trước chuyến đi", en: "Support before the journey", "zh-CN": "出行前支持" })}</h2>
            <div className="benefit-grid">
              {detailContent.benefits.map((benefit, index) => <article key={`${benefit}-${index}`}><span className={"benefit-icon benefit-icon-" + (index + 1)} aria-hidden="true" /><p>{benefit}</p></article>)}
            </div>
          </section>
        </div>
      </section>

      <section className="detail-consult-band" id="detail-consult">
        <div className="detail-consult-copy">
          <p className="eyebrow">{local({ vi: "Liên hệ tư vấn", en: "Consultation contact", "zh-CN": "咨询联系" })}</p>
          <h2>{detailContent.consultTitle}</h2>
          <p>{detailContent.consultCopy}</p>
          <div className="detail-consult-points">
            {detailContent.consultPoints.map((point, index) => <span key={`${point}-${index}`}>{point}</span>)}
          </div>
        </div>
        <LeadForm packages={packageNames} defaultPackage={item.name} />
      </section>
    </main>
  );
}