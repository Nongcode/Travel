"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { stripLocaleFromPath, withLocalePrefix } from "@/lib/i18n/config";
import { useI18n } from "./I18nProvider";

type SiteHeaderProps = {
  variant?: "hero" | "solid";
};

function getFlagIcon(code: string) {
  switch (code) {
    case "vi":
      return (
        <svg viewBox="0 0 30 20" width="20" height="14" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: "2px", display: "inline-block", verticalAlign: "middle" }}>
          <rect width="30" height="20" fill="#da251d"/>
          <polygon points="15,4 16.2,8.8 21.2,8.8 17.2,11.8 18.7,16.6 15,13.6 11.3,16.6 12.8,11.8 8.8,8.8 13.8,8.8" fill="#ffff00"/>
        </svg>
      );
    case "en":
    case "gb":
      return (
        <svg viewBox="0 0 50 30" width="20" height="12" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: "2px", display: "inline-block", verticalAlign: "middle" }}>
          <rect width="50" height="30" fill="#012169"/>
          <path d="M0,0 L50,30 M50,0 L0,30" stroke="#fff" strokeWidth="6"/>
          <path d="M0,0 L50,30 M50,0 L0,30" stroke="#c8102e" strokeWidth="4"/>
          <path d="M25,0 V30 M0,15 H50" stroke="#fff" strokeWidth="10"/>
          <path d="M25,0 V30 M0,15 H50" stroke="#c8102e" strokeWidth="6"/>
        </svg>
      );
    case "zh-CN":
    case "cn":
      return (
        <svg viewBox="0 0 30 20" width="20" height="14" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: "2px", display: "inline-block", verticalAlign: "middle" }}>
          <rect width="30" height="20" fill="#de2110"/>
          <path d="M 5 2 L 5.9 4.7 L 8.7 4.7 L 6.4 6.4 L 7.3 9.1 L 5 7.4 L 2.7 9.1 L 3.6 6.4 L 1.3 4.7 L 4.1 4.7 Z" fill="#ffde00" />
          <path d="M 10 1.2 L 10.3 2.1 L 11.2 2.1 L 10.5 2.7 L 10.8 3.6 L 10 3 L 9.2 3.6 L 9.5 2.7 L 8.8 2.1 L 9.7 2.1 Z" fill="#ffde00" />
          <path d="M 12 3.2 L 12.3 4.1 L 13.2 4.1 L 12.5 4.7 L 12.8 5.6 L 12 5 L 11.2 5.6 L 11.5 4.7 L 10.8 4.1 L 11.7 4.1 Z" fill="#ffde00" />
          <path d="M 12 6.2 L 12.3 7.1 L 13.2 7.1 L 12.5 7.7 L 12.8 8.6 L 12 8 L 11.2 8.6 L 11.5 7.7 L 10.8 7.1 L 11.7 7.1 Z" fill="#ffde00" />
          <path d="M 10 8.2 L 10.3 9.1 L 11.2 9.1 L 10.5 9.7 L 10.8 10.6 L 10 10 L 9.2 10.6 L 9.5 9.7 L 8.8 9.1 L 9.7 9.1 Z" fill="#ffde00" />
        </svg>
      );
    default:
      return <span className="font-bold text-xs uppercase">{code}</span>;
  }
}

function LanguageSwitcher() {
  const pathname = usePathname() || "/";
  const { locale, languages } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const stripped = stripLocaleFromPath(pathname).pathname;
  const visibleLanguages = languages.filter((language) => language.isActive);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".custom-language-dropdown")) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("click", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (visibleLanguages.length === 0) return null;

  const currentLanguage = visibleLanguages.find((lang) => lang.code === locale) || visibleLanguages[0];

  const getShortName = (code: string) => {
    if (code === "vi") return "VI";
    if (code === "en") return "EN";
    if (code === "zh-CN") return "ZH";
    return code.toUpperCase();
  };

  return (
    <div className="custom-language-dropdown" aria-label="Chuyển ngôn ngữ">
      <button
        suppressHydrationWarning
        className="dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="flag-wrapper">{getFlagIcon(currentLanguage.code)}</span>
        <span className="lang-text">{getShortName(currentLanguage.code)}</span>
        <svg className={`chevron-icon ${isOpen ? "open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          {visibleLanguages.map((language) => {
            const targetHref = withLocalePrefix(stripped, language.code) || "/";
            const isCurrent = language.code === locale;
            return (
              <a
                key={language.code}
                href={targetHref}
                className={`dropdown-item ${isCurrent ? "active" : ""}`}
                aria-label={language.nativeName || language.name}
                title={language.nativeName || language.name}
              >
                <span className="flag-wrapper">{getFlagIcon(language.code)}</span>
                <span className="item-lang-name">{language.nativeName || language.name}</span>
                {isCurrent && (
                  <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SiteHeader({ variant = "solid" }: SiteHeaderProps) {
  const { locale, t, href, hiddenPageKeys, siteChrome } = useI18n();
  const pathname = usePathname() || "/";
  const strippedPath = stripLocaleFromPath(pathname).pathname;
  const [hasScrolledPastHero, setHasScrolledPastHero] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isHeroHeader = variant === "hero";
  const visibleNavItems = siteChrome.header.menu.filter((item) => !item.settingKey || !hiddenPageKeys.includes(item.settingKey));

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isHeroHeader) return;

    const updateHeaderState = () => {
      const heroSection = document.querySelector<HTMLElement>(".hero-section, .page-hero, .contact-hero, .package-detail-hero");
      const triggerPoint = heroSection ? heroSection.offsetHeight - 96 : 160;
      setHasScrolledPastHero(window.scrollY > triggerPoint);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    window.addEventListener("resize", updateHeaderState);

    return () => {
      window.removeEventListener("scroll", updateHeaderState);
      window.removeEventListener("resize", updateHeaderState);
    };
  }, [isHeroHeader]);

  // Lock body scroll when a mobile overlay is open
  useEffect(() => {
    if (isMobileMenuOpen || isMobileSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, isMobileSearchOpen]);

  useEffect(() => {
    if (!isMobileSearchOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileSearchOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMobileSearchOpen]);

  // Auto-close menu when route changes
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsMobileMenuOpen(false);
      setIsMobileSearchOpen(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useLayoutEffect(() => {
    const resetHorizontalScroll = () => {
      const scrollingElement = document.scrollingElement as HTMLElement | null;
      const scrollRoots = [scrollingElement, document.documentElement, document.body];

      for (const root of scrollRoots) {
        if (root && root.scrollLeft !== 0) {
          root.scrollLeft = 0;
        }
      }

      if (window.scrollX !== 0) {
        window.scrollTo(0, window.scrollY);
      }
    };

    resetHorizontalScroll();
    const firstFrame = window.requestAnimationFrame(resetHorizontalScroll);
    let secondFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(resetHorizontalScroll);
    });
    const stabilizer = window.setInterval(resetHorizontalScroll, 120);
    const stopStabilizer = window.setTimeout(() => window.clearInterval(stabilizer), 1800);

    window.addEventListener("resize", resetHorizontalScroll);
    window.addEventListener("orientationchange", resetHorizontalScroll);
    window.addEventListener("scroll", resetHorizontalScroll, { passive: true });
    window.visualViewport?.addEventListener("resize", resetHorizontalScroll);
    window.visualViewport?.addEventListener("scroll", resetHorizontalScroll);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearInterval(stabilizer);
      window.clearTimeout(stopStabilizer);
      window.removeEventListener("resize", resetHorizontalScroll);
      window.removeEventListener("orientationchange", resetHorizontalScroll);
      window.removeEventListener("scroll", resetHorizontalScroll);
      window.visualViewport?.removeEventListener("resize", resetHorizontalScroll);
      window.visualViewport?.removeEventListener("scroll", resetHorizontalScroll);
    };
  }, [pathname]);

  const headerClassName = [
    "site-header",
    variant === "solid" ? "solid-header" : "",
    isHeroHeader && hasScrolledPastHero ? "scrolled-header" : "",
    isMobileMenuOpen ? "mobile-menu-active" : ""
  ].filter(Boolean).join(" ");

  const mobileOverlays = (
    <>
      <div 
        className={`mobile-menu-backdrop ${isMobileMenuOpen ? "open" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div className={`mobile-menu-drawer ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <Link className="brand" href={href("/")} onClick={() => setIsMobileMenuOpen(false)}>
            <Image src={siteChrome.header.logoUrl} alt={siteChrome.header.logoAlt} width={114} height={75} priority />
          </Link>
          <button 
            className="drawer-close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="close-svg-icon">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <nav className="mobile-nav">
          {visibleNavItems.map((item) => {
            const itemHref = item.url.startsWith("/") ? href(item.url) : item.url;
            const isHome = item.url === "/";
            const isActive = isHome ? strippedPath === "/" : item.url.startsWith("/") && strippedPath.startsWith(item.url);
            return (
              <Link
                href={itemHref}
                key={item.id}
                className={isActive ? "active" : ""}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.translationKey && locale !== "vi" ? t("nav", item.translationKey, item.label) : item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className={`mobile-search-modal-backdrop ${isMobileSearchOpen ? "open" : ""}`}
        onClick={() => setIsMobileSearchOpen(false)}
      />
      <div className={`mobile-search-modal ${isMobileSearchOpen ? "open" : ""}`} role="dialog" aria-modal="true" aria-label={t("nav", "search_trip", "Tìm chuyến đi")}>
        <div className="mobile-search-modal-header">
          <div>
            <p className="mobile-search-kicker">VietVista</p>
            <h2>{t("nav", "search_trip", "Tìm chuyến đi")}</h2>
          </div>
          <button type="button" className="mobile-search-close" onClick={() => setIsMobileSearchOpen(false)} aria-label="Close search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className="mobile-search-form" action={href("/goi-du-lich")}>
          <label>
            <span>{t("home", "search_destination", "Điểm đến")}</span>
            <input name="destination" placeholder={t("home", "search_destination_placeholder", "Bạn muốn đi đâu?")} />
          </label>

          <label>
            <span>{t("home", "search_style", "Phong cách")}</span>
            <select name="style" defaultValue="">
              <option value="">{t("home", "search_style_placeholder", "Chọn trải nghiệm")}</option>
              <option value="family">{t("home", "style_family", "Gia đình")}</option>
              <option value="friends">{t("home", "style_friends", "Nhóm bạn")}</option>
              <option value="resort">{t("home", "style_resort", "Nghỉ dưỡng")}</option>
              <option value="photo">{t("home", "style_photo", "Chụp ảnh")}</option>
            </select>
          </label>

          <label>
            <span>{t("home", "search_time", "Thời gian")}</span>
            <input name="date" type="month" />
          </label>

          <button type="submit">{t("home", "search_submit", "Tìm chuyến đi")}</button>
        </form>
      </div>
    </>
  );

  return (
    <>
    <header className={headerClassName}>
      <Link className="brand" href={href("/")} aria-label={t("nav", "home", "Trang chủ")}>
        <Image src={siteChrome.header.logoUrl} alt={siteChrome.header.logoAlt} width={152} height={100} priority />
      </Link>
      
      {/* Desktop Navigation */}
      <nav className="desktop-nav" aria-label="Điều hướng chính">
        {visibleNavItems.map((item) => {
          const itemHref = item.url.startsWith("/") ? href(item.url) : item.url;
          const isHome = item.url === "/";
          const isActive = isHome ? strippedPath === "/" : item.url.startsWith("/") && strippedPath.startsWith(item.url);
          return (
            <Link
              href={itemHref}
              key={item.id}
              className={isActive ? "active" : ""}
            >
              {item.translationKey && locale !== "vi" ? t("nav", item.translationKey, item.label) : item.label}
            </Link>
          );
        })}
        <Link className="search-nav" href={href("/#trip-search")} aria-label={t("nav", "search_trip", "Tìm chuyến đi")}>
          <span className="search-icon" aria-hidden="true" />
        </Link>
        <LanguageSwitcher />
      </nav>

      <div className="mobile-header-actions" aria-label="Thao tác nhanh">
        <button
          type="button"
          className="mobile-header-search"
          aria-label={t("nav", "search_trip", "Tìm chuyến đi")}
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsMobileSearchOpen(true);
          }}
        >
          <span className="search-icon" aria-hidden="true" />
        </button>

        <div className="mobile-header-language">
          <LanguageSwitcher />
        </div>

        <button 
          className={`mobile-menu-toggle ${isMobileMenuOpen ? "open" : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="hamburger-line line-1" />
          <span className="hamburger-line line-2" />
          <span className="hamburger-line line-3" />
        </button>
      </div>

    </header>
    {isMounted ? createPortal(mobileOverlays, document.body) : null}
    </>
  );
}
