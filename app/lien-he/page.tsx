import Image from "next/image";
import { headers } from "next/headers";
import { LeadForm } from "../components/LeadForm";
import { ReviewsHeader } from "../components/ReviewsHeader";
import { SiteHeader } from "../components/SiteHeader";
import { destinations } from "../data/travel";
import { normalizeLocale } from "@/lib/i18n/config";
import { getStaticTranslationMap, translateFromMap } from "@/lib/i18n/server";
import { getPublicPackages } from "@/lib/packages";
import prisma from "@/lib/prisma";

export default async function ContactPage() {
  const locale = normalizeLocale((await headers()).get("x-locale"));
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);

  const reviewTranslations: Record<string, Record<string, { comment: string; package: string }>> = {
    "Emily Watson": {
      en: { comment: "An absolutely wonderful experience. The cooking class on the river bank was the highlight of our trip!", package: "Slow-paced Hoi An" },
      "zh-CN": { comment: "绝佳的体验。河畔烹饪课程是我们这趟旅行的亮点！", package: "慢节奏会安" }
    },
    "Marcus Aurelius": {
      en: { comment: "Breathtaking landscapes and extremely professional organization. The tour guide was very knowledgeable.", package: "Ha Giang Photo Tour" },
      "zh-CN": { comment: "令人惊叹的风景和极其专业的组织。导游知识非常渊博。", package: "河江摄影之旅" }
    },
    "Jeanne d'Arc": {
      en: { comment: "The resort was top-notch, very child friendly. Transfer service could be slightly faster.", package: "Phu Quoc Family Holiday" },
      "zh-CN": { comment: "度假村是一流的，对儿童非常友好。接送服务可以再快一点。", package: "富国岛家庭假期" }
    }
  };

  const dbReviews = await prisma.review.findMany({
    where: { status: "Hiển thị" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const packages = await getPublicPackages(locale);
  const packageNames = packages.map((p) => p.name);

  return (
    <main>
      <SiteHeader variant="hero" />

      <section className="contact-hero">
        <div className="contact-hero-copy">
          <p className="eyebrow">{t("contact", "hero_eyebrow", "Liên hệ tư vấn")}</p>
          <h1>{t("contact", "hero_title", "Bắt đầu chuyến đi của bạn ngay từ bây giờ nhé!")}</h1>
          <p>{t("contact", "hero_copy", "Cho VietVista biết điểm đến, thời gian du lịch và phong cách chuyến đi bạn mong muốn. Chúng tôi sẽ liên hệ lại để gợi ý lịch trình phù hợp, không yêu cầu thanh toán trực tuyến.")}</p>
        </div>
      </section>

      <section className="contact-info-band">
        <article>
          <span>01</span>
          <h2>{t("contact", "card1_title", "Phản hồi trong 24h")}</h2>
          <p>{t("contact", "card1_copy", "Đội ngũ tư vấn sẽ liên hệ qua email hoặc số điện thoại bạn để lại.")}</p>
        </article>
        <article>
          <span>02</span>
          <h2>{t("contact", "card2_title", "Lịch trình linh hoạt")}</h2>
          <p>{t("contact", "card2_copy", "Gợi ý có thể điều chỉnh theo số người, ngân sách và nhịp nghỉ mong muốn.")}</p>
        </article>
        <article>
          <span>03</span>
          <h2>{t("contact", "card3_title", "Không cần thanh toán online")}</h2>
          <p>{t("contact", "card3_copy", "Website chỉ thu thập thông tin liên hệ để tư vấn và xác nhận nhu cầu.")}</p>
        </article>
      </section>

      <section className="contact-form-section">
        <div className="contact-form-wrapper">
          <div className="contact-form-header">
            <h2>{t("contact", "form_title", "Gửi yêu cầu tư vấn hành trình")}</h2>
            <p>{t("contact", "form_copy", "Hãy điền thông tin dưới đây. Các chuyên gia hành trình của VietVista sẽ liên hệ lại để gợi ý lịch trình phù hợp với nhu cầu thực tế của bạn.")}</p>
          </div>

          <div className="contact-form-content">
            <div className="contact-form-container">
              <LeadForm packages={packageNames} />
            </div>

            <div className="contact-form-image">
              <Image
                src="/vietnam-map-light.png"
                alt="VietVista destination map"
                width={720}
                height={720}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="reviews-section section-shell">
        <ReviewsHeader
          eyebrow={t("home", "reviews_eyebrow", "Đánh giá từ khách hàng")}
          destinations={packageNames}
        />
        
        {dbReviews.length > 0 && (
          <div className="reviews-grid" style={{ marginBottom: "56px" }}>
            {dbReviews.map((review) => {
              const localizedComment = reviewTranslations[review.customerName]?.[locale]?.comment || review.comment;
              const localizedPackage = reviewTranslations[review.customerName]?.[locale]?.package || review.packageName;

              return (
                <article key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-avatar" style={{ backgroundImage: `url(${review.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=150&q=80'})` }} />
                    <div className="review-meta">
                      <h4>{review.customerName}</h4>
                      <span className="review-package">{localizedPackage}</span>
                    </div>
                    <div className="review-rating">
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </div>
                  </div>
                  <p className="review-comment">"{localizedComment}"</p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}


