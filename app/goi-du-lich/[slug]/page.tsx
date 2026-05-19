import { notFound } from "next/navigation";
import { LeadForm } from "../../components/LeadForm";
import { SiteHeader } from "../../components/SiteHeader";
import {
  allPackages,
  destinations,
  packageDetailExtras,
} from "../../data/travel";

type PackageDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return allPackages.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: PackageDetailPageProps) {
  const { slug } = await params;
  const item = allPackages.find((packageItem) => packageItem.slug === slug);

  if (!item) {
    return {
      title: "Không tìm thấy gói du lịch | VietVista",
    };
  }

  return {
    title: `${item.name} | VietVista`,
    description: item.summary,
  };
}

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { slug } = await params;
  const item = allPackages.find((packageItem) => packageItem.slug === slug);

  if (!item) {
    notFound();
  }

  const gallery = [item.image, ...packageDetailExtras.gallery].slice(0, 5);

  return (
    <main>
      <SiteHeader variant="hero" />
      <section className="package-detail-hero">
        <div className="detail-hero-copy">
          <p className="eyebrow">{item.destination}</p>
          <h1>{item.name}</h1>
          <p>{item.summary}</p>
          <div className="detail-hero-actions">
            <a href="#detail-consult">Nhận tư vấn gói này</a>
            <span>{item.price}</span>
          </div>
        </div>
        <div className="detail-gallery" aria-label="Ảnh giới thiệu gói du lịch">
          {gallery.map((image, index) => (
            <div
              className={index === 0 ? "gallery-main" : "gallery-thumb"}
              key={`${image}-${index}`}
              style={{ backgroundImage: `url(${image})` }}
            >
              {index === 4 ? <span>+{packageDetailExtras.gallery.length}</span> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="package-detail-shell">
        <aside className="detail-summary-card">
          <span>{item.status}</span>
          <h2>{item.price}</h2>
          <dl>
            <div>
              <dt>Điểm đến</dt>
              <dd>{item.destination}</dd>
            </div>
            <div>
              <dt>Thời lượng</dt>
              <dd>{item.duration}</dd>
            </div>
            <div>
              <dt>Hình thức</dt>
              <dd>Tư vấn theo yêu cầu</dd>
            </div>
          </dl>
          <a href="#detail-consult">Gửi yêu cầu tư vấn</a>
        </aside>

        <div className="detail-content">
          <section>
            <p className="eyebrow">Tổng quan</p>
            <h2>Gói này phù hợp với ai?</h2>
            <p>
              {item.summary} Lịch trình có thể điều chỉnh theo số lượng khách,
              thời gian rảnh, phong cách nghỉ dưỡng và ngân sách mong muốn.
            </p>
          </section>

          <section className="detail-grid-section">
            <div>
              <p className="eyebrow">Ưu đãi</p>
              <h2>Điểm cộng khi để lại thông tin sớm</h2>
              <ul>
                {packageDetailExtras.offers.map((offer) => (
                  <li key={offer}>{offer}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow">Tiện ích</p>
              <h2>Bao gồm trong gói tư vấn</h2>
              <ul>
                {packageDetailExtras.included.map((included) => (
                  <li key={included}>{included}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <p className="eyebrow">Lịch trình mẫu</p>
            <h2>Khung hành trình tham khảo</h2>
            <div className="itinerary-list">
              {packageDetailExtras.itinerary.map((step, index) => (
                <article key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{step}</p>
                </article>
              ))}
            </div>
          </section>

          <section>
            <p className="eyebrow">Lý do nên chọn</p>
            <h2>Những hỗ trợ trước chuyến đi</h2>
            <div className="benefit-grid">
              {packageDetailExtras.benefits.map((benefit) => (
                <article key={benefit}>{benefit}</article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="consult-section" id="detail-consult">
        <div className="consult-copy">
          <p className="eyebrow">Tư vấn riêng</p>
          <h2>Muốn nhận lịch trình chi tiết cho {item.name}?</h2>
          <p>
            Để lại email hoặc số điện thoại. Đội ngũ tư vấn sẽ liên hệ để xác
            nhận nhu cầu, không yêu cầu thanh toán trên website.
          </p>
        </div>
        <LeadForm destinations={destinations} />
      </section>
    </main>
  );
}
