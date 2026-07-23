
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "./I18nProvider";
import { DEFAULT_SITE_CHROME_CONFIG } from "@/lib/siteChromeShared";

export function SiteFooter() {
  const pathname = usePathname();
  const { locale, t, href, hiddenPageKeys, siteChrome } = useI18n();

  if (pathname?.startsWith("/admin")) return null;

  const visibleFooterLinks = siteChrome.footer.menu.filter((item) => !item.settingKey || !hiddenPageKeys.includes(item.settingKey));
  const footerDescription = siteChrome.footer.description === DEFAULT_SITE_CHROME_CONFIG.footer.description
    ? t("footer", "description", DEFAULT_SITE_CHROME_CONFIG.footer.description)
    : siteChrome.footer.description;
  const footerCopyright = siteChrome.footer.copyright === DEFAULT_SITE_CHROME_CONFIG.footer.copyright
    ? t("footer", "rights", DEFAULT_SITE_CHROME_CONFIG.footer.copyright)
    : siteChrome.footer.copyright;

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Link className="footer-brand" href={href("/")} aria-label={siteChrome.header.companyName}>
            <Image src={siteChrome.header.logoUrl} alt={siteChrome.header.logoAlt} width={180} height={118} />
          </Link>
          <p>{footerDescription}</p>
        </div>
        <nav aria-label="Footer navigation">
          {visibleFooterLinks.map((item) => (
            <Link href={item.url.startsWith("/") ? href(item.url) : item.url} key={item.id}>
              {item.translationKey && locale !== "vi" ? t("nav", item.translationKey, item.label) : item.label}
            </Link>
          ))}
        </nav>
        <div className="footer-contact">
          <span>{t("footer", "consult", "Liên hệ tư vấn")}</span>
          {siteChrome.footer.address && <span>{siteChrome.footer.address}</span>}
          {siteChrome.footer.email && <a href={`mailto:${siteChrome.footer.email}`}>{siteChrome.footer.email}</a>}
          {siteChrome.footer.phone && <a href={`tel:${siteChrome.footer.phone.replace(/[^+\d]/g, "")}`}>{siteChrome.footer.phone}</a>}
          {siteChrome.footer.facebook && <a href={siteChrome.footer.facebook} target="_blank" rel="noreferrer">Facebook</a>}
          {siteChrome.footer.instagram && <a href={siteChrome.footer.instagram} target="_blank" rel="noreferrer">Instagram</a>}
          {siteChrome.footer.twitter && <a href={siteChrome.footer.twitter} target="_blank" rel="noreferrer">Twitter / X</a>}
        </div>
      </div>
      <div className="footer-bottom">
        <span>{footerCopyright}</span>
        <span>Travel blog & curated journeys</span>
      </div>
    </footer>
  );
}
