import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { offers } from "../data/travel";

export default function OffersPage() {
  return (
    <main>
      <SiteHeader variant="hero" />
      <section className="page-hero offers-hero">
        <p className="eyebrow">Ưu đãi</p>
        <h1>Chương trình nổi bật cho mùa du lịch mới.</h1>
        <p>
          Các ưu đãi chỉ dùng để khách để lại thông tin tìm hiểu. Đội ngũ tư vấn
          sẽ xác nhận chi tiết, tình trạng chỗ và chi phí qua email hoặc điện
          thoại.
        </p>
      </section>

      <section className="section-shell">
        <div className="offer-grid">
          {offers.map((offer) => (
            <article className="offer-card" key={offer.id}>
              <div
                className="offer-image"
                style={{ backgroundImage: `url(${offer.image})` }}
              >
                <span>{offer.tag}</span>
              </div>
              <div className="offer-body">
                <h2>{offer.title}</h2>
                <p>{offer.description}</p>
                <div className="offer-footer">
                  <strong>Hiệu lực đến {offer.validUntil}</strong>
                  <Link href="/#consult">Nhận thông tin</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
