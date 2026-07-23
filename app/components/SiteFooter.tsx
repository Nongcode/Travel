
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "./I18nProvider";

const footerLinks = [
  { href: "/", key: "home", fallback: "Trang ch?", settingKey: "page_home_status" },
  { href: "/tin-tuc", key: "news", fallback: "Tin t?c", settingKey: "page_news_status" },
  { href: "/goi-du-lich", key: "packages", fallback: "G?i du l?ch", settingKey: "page_tours_status" },
  { href: "/huong-dan-visa", key: "visa", fallback: "Visa", settingKey: "page_visa_status" },
  { href: "/uu-dai", key: "offers", fallback: "?u ??i" },
  { href: "/lien-he", key: "contact", fallback: "Li?n h?", settingKey: "page_contact_status" },
  { href: "/admin", key: "admin", fallback: "Admin" },
];

export function SiteFooter() {
  const pathname = usePathname();
  const { t, href, hiddenPageKeys } = useI18n();

  if (pathname?.startsWith("/admin")) return null;

  const visibleFooterLinks = footerLinks.filter((item) => !item.settingKey || !hiddenPageKeys.includes(item.settingKey));

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Link className="footer-brand" href={href("/")} aria-label={t("nav", "home", "Trang ch?")}>
            <Image src="/vietvista-logo.png" alt="VietVista Travel & Discover" width={180} height={118} />
          </Link>
          <p>{t("footer", "description", "Blog du l?ch v? k?nh t? v?n h?nh tr?nh Vi?t Nam. Website ch? thu th?p th?ng tin li?n h?, kh?ng x? l? thanh to?n tr?c tuy?n.")}</p>
        </div>
        <nav aria-label="Footer navigation">
          {visibleFooterLinks.map((item) => (
            <Link href={href(item.href)} key={item.href}>
              {t("nav", item.key, item.fallback)}
            </Link>
          ))}
        </nav>
        <div className="footer-contact">
          <span>{t("footer", "consult", "Li?n h? t? v?n")}</span>
          <a href="mailto:hello@vietvista.vn">hello@vietvista.vn</a>
          <a href="tel:+84901234567">090 123 4567</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{t("footer", "rights", "? 2026 VietVista. All rights reserved.")}</span>
        <span>Travel blog & curated journeys</span>
      </div>
    </footer>
  );
}
