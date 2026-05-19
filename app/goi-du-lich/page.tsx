import { LeadForm } from "../components/LeadForm";
import { PackageCard } from "../components/PackageCard";
import { SiteHeader } from "../components/SiteHeader";
import { allPackages, destinations } from "../data/travel";

export default function PackagesPage() {
  return (
    <main>
      <SiteHeader />
      <section className="page-hero packages-hero">
        <p className="eyebrow">Gói du lịch</p>
        <h1>Sản phẩm du lịch để tham khảo và nhận tư vấn riêng.</h1>
        <p>
          Mỗi gói du lịch được trình bày như nội dung giới thiệu. Khách hàng để
          lại liên hệ nếu cần báo giá, điều chỉnh lịch trình hoặc nhận gợi ý
          theo ngân sách.
        </p>
      </section>

      <section className="section-shell">
        <div className="package-grid wide">
          {allPackages.map((item) => (
            <PackageCard item={item} key={item.id} />
          ))}
        </div>
      </section>

      <section className="consult-section">
        <div className="consult-copy">
          <p className="eyebrow">Yêu cầu báo giá</p>
          <h2>Cần điều chỉnh gói du lịch?</h2>
          <p>
            Để lại thông tin liên hệ và mong muốn của bạn. Chúng tôi sẽ gọi lại
            để tư vấn, không yêu cầu thanh toán trên website.
          </p>
        </div>
        <LeadForm destinations={destinations} />
      </section>
    </main>
  );
}
