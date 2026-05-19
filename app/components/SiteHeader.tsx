"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/tin-tuc", label: "Tin tức" },
  { href: "/goi-du-lich", label: "Gói du lịch" },
  { href: "/uu-dai", label: "Ưu đãi" },
  { href: "/lien-he", label: "Liên hệ" },
  { href: "/admin", label: "Admin" },
];

type SiteHeaderProps = {
  variant?: "hero" | "solid";
};

export function SiteHeader({ variant = "solid" }: SiteHeaderProps) {
  const [hasScrolledPastHero, setHasScrolledPastHero] = useState(false);
  const isHeroHeader = variant === "hero";

  useEffect(() => {
    if (!isHeroHeader) {
      return;
    }

    const updateHeaderState = () => {
      const heroSection = document.querySelector<HTMLElement>(".hero-section");
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

  const headerClassName = [
    "site-header",
    variant === "solid" ? "solid-header" : "",
    isHeroHeader && hasScrolledPastHero ? "scrolled-header" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClassName}>
      <Link className="brand" href="/" aria-label="Về trang chủ">
        VietVista
      </Link>
      <nav aria-label="Điều hướng chính">
        {navItems.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}