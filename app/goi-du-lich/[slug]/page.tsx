import { notFound } from "next/navigation";
import { LeadForm } from "../../components/LeadForm";
import { PackageDetailGallery } from "../../components/PackageDetailGallery";
import { SiteHeader } from "../../components/SiteHeader";
import {
  allPackages,
  destinations,
  packageDetailExtras,
  packageDetailMediaBySlug,
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
      title: "Khong tim thay goi du lich | VietVista",
    };
  }

  return {
    title: `${item.name} | VietVista`,
    description: item.summary,
  };
}

export default async function PackageDetailPage({
  params,
}: PackageDetailPageProps) {
  const { slug } = await params;
  const item = allPackages.find((packageItem) => packageItem.slug === slug);

  if (!item) {
    notFound();
  }

  const media = packageDetailMediaBySlug[item.slug];
  const gallery =
    media?.gallery?.length
      ? media.gallery
      : [item.image, ...packageDetailExtras.gallery].slice(0, 5);
  const quickFacts = [
    { icon: "calendar", label: "Thoi luong", value: item.duration },
    { icon: "pin", label: "Diem den", value: item.destination },
    { icon: "spark", label: "Hinh thuc", value: "Tu van linh hoat" },
    { icon: "wallet", label: "Ngan sach", value: item.price },
  ];
  const experienceMoments = [
    {
      title: "Không gian lưu trú lý tưởng",
      description:
        "Ưu tiên nơi có vị trí thuận tiện, dễ nghỉ ngơi và phù hợp với nhịp chuyển động.",
      image: gallery[1] ?? gallery[0],
    },
    {
      title: "Điểm dừng nổi bật",
      description:
        "Gợi ý các khung cảnh đáng trải nghiệm và lịch tham quan không bị đơn điệu.",
      image: gallery[2] ?? gallery[0],
    },
    {
      title: "Khoảnh khắc đáng nhớ",
      description:
        "Bổ sung góc chụp đẹp, trải nghiệm địa phương và thời gian tự do hợp lý.",
      image: gallery[3] ?? gallery[0],
    },
  ];

  return (
    <main>
      <SiteHeader variant="hero" />

      <section
        className="page-hero detail-hero"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(10, 20, 17, 0.78), rgba(10, 20, 17, 0.26)), url(${media?.banner ?? gallery[0]})`
        }}
      >
        <p className="eyebrow">Điểm đến đặc trưng</p>
        <h1>{item.destination}</h1>
        <p>Khung cảnh, ánh sáng và những điểm dừng chân phù hợp nhất với tinh thần của hành trình này.</p>
      </section>

      <section className="package-detail-hero">
        <div className="detail-hero-copy">
          <p className="eyebrow">Chi tiết hành trình</p>
          <h1>{item.name}</h1>
          <p>{item.summary}</p>
          <div className="detail-hero-actions">
            <a href="#detail-consult">Nhận tư vấn ngay</a>
            <span>{item.price}</span>
          </div>

          <div className="detail-quick-facts">
            {quickFacts.map((fact) => (
              <article className="detail-fact-card" key={fact.label}>
                <span
                  className={`detail-fact-icon ${fact.icon}`}
                  aria-hidden="true"
                />
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
          <span>{item.status}</span>
          <h2>{item.price}</h2>
          <dl>
            <div>
              <dt>Điểm đến</dt>
              <dd>{item.destination}</dd>
            </div>
            <div>
              <dt>Thời gian</dt>
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
            <h2>Gói này phù hợp với ?</h2>
            <p>
              {item.summary} Lịch trình có thể điều chỉnh theo số lượng khách,
              thời gian rảnh, phong cách nghỉ dưỡng và ngân sách mong muốn.
            </p>
          </section>

          <section>
            <p className="eyebrow">Trải nghiệm nổi bật</p>
            <h2>Nội dung nên có trong hành trình</h2>
            <div className="detail-experience-grid">
              {experienceMoments.map((moment) => (
                <article className="detail-experience-card" key={moment.title}>
                  <div
                    className="detail-experience-image"
                    style={{ backgroundImage: `url(${moment.image})` }}
                  />
                  <div className="detail-experience-copy">
                    <h3>{moment.title}</h3>
                    <p>{moment.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="detail-grid-section">
            <div>
              <p className="eyebrow">Ưu đãi</p>
              <h2>Điểm cộng khi đặt chỗ sớm</h2>
              <ul className="detail-icon-list offers-list">
                {packageDetailExtras.offers.map((offer, index) => (
                  <li key={offer}>
                    <span
                      className={`detail-list-icon offer-icon-${index + 1}`}
                      aria-hidden="true"
                    />
                    <p>{offer}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow">Tiện ích</p>
              <h2>Bao gồm trong gói tư vấn</h2>
              <ul className="detail-icon-list included-list">
                {packageDetailExtras.included.map((included, index) => (
                  <li key={included}>
                    <span
                      className={`detail-list-icon included-icon-${(index % 3) + 1}`}
                      aria-hidden="true"
                    />
                    <p>{included}</p>
                  </li>
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
              {packageDetailExtras.benefits.map((benefit, index) => (
                <article key={benefit}>
                  <span
                    className={`benefit-icon benefit-icon-${index + 1}`}
                    aria-hidden="true"
                  />
                  <p>{benefit}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="detail-consult-band" id="detail-consult">
        <div className="detail-consult-copy">
          <p className="eyebrow">Liên hệ tư vấn</p>
          <h2>Giữ lại gói này và nhận tư vấn phù hợp với nhu cầu thực tế.</h2>
          <p>
            Chỉ cần để lại email hoặc số điện thoại. VietVista sẽ liên hệ để
            định chỉnh lịch trình, gợi ý ngân sách và chọn điểm lưu trú phù hợp.
          </p>
          <div className="detail-consult-points">
            <span>Không cần thanh toán ngay</span>
            <span>Điều chỉnh theo gia đình hoặc nhóm bạn</span>
            <span>Gửi lại tư vấn trong 24 giờ</span>
          </div>
        </div>
        <LeadForm destinations={destinations} />
      </section>
    </main>
  );
}
