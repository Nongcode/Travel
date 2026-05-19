import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/tin-tuc", label: "Tin tức" },
  { href: "/goi-du-lich", label: "Gói du lịch" },
  { href: "/uu-dai", label: "Ưu đãi" },
  { href: "/lien-he", label: "Liên hệ" },
  { href: "/admin", label: "Admin" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Link className="footer-brand" href="/">
            VietVista
          </Link>
          <p>
            Blog du lịch và kênh tư vấn hành trình Việt Nam. Website chỉ thu
            thập thông tin liên hệ, không xử lý thanh toán trực tuyến.
          </p>
        </div>
        <nav aria-label="Điều hướng chân trang">
          {footerLinks.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="footer-contact">
          <span>Liên hệ tư vấn</span>
          <a href="mailto:hello@vietvista.vn">hello@vietvista.vn</a>
          <a href="tel:+84901234567">090 123 4567</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 VietVista. All rights reserved.</span>
        <span>Travel blog & curated journeys</span>
      </div>
    </footer>
  );
}
