import { LeadForm } from "../components/LeadForm";
import { PackageExplorer } from "../components/PackageExplorer";
import { SiteHeader } from "../components/SiteHeader";
import { allPackages, destinations, packageCollections } from "../data/travel";

export default function PackagesPage() {
  return (
    <main>
      <SiteHeader variant="hero" />
      <section className="page-hero packages-hero">
        <p className="eyebrow">Gói du lịch</p>
        <h1>Hành trình gửi gắm — Gợi ý &amp; tư vấn theo mong muốn của bạn</h1>
        <p>
          Mỗi gói là một đề xuất khởi đầu — hãy cho chúng tôi biết số người,
          phong cách và ngân sách. Chúng tôi sẽ hoàn thiện hành trình để trở
          thành kỷ niệm đáng nhớ của bạn.
        </p>
      </section>

      <PackageExplorer
        packages={allPackages}
        collections={packageCollections}
        destinations={destinations}
      />
    </main>
  );
}
