"use client";

import { useMemo, useRef } from "react";
import { PackageCard } from "./PackageCard";

type PackageItem = {
  id: number;
  slug: string;
  name: string;
  destination: string;
  duration: string;
  price: string;
  summary: string;
  image: string;
  status: string;
};

type PackageCarouselProps = {
  items: PackageItem[];
  fallbackItems?: PackageItem[];
  minItems?: number;
};

function uniquePackages(items: PackageItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.slug || String(item.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildDisplayItems(items: PackageItem[], fallbackItems: PackageItem[] = [], minItems: number) {
  const baseItems = uniquePackages(items).length > 0 ? uniquePackages(items) : uniquePackages(fallbackItems);
  if (baseItems.length === 0) return [];

  const displayItems = [...baseItems];
  let index = 0;
  while (displayItems.length < minItems) {
    displayItems.push(baseItems[index % baseItems.length]);
    index += 1;
  }
  return displayItems;
}

export function PackageCarousel({ items, fallbackItems = [], minItems = 5 }: PackageCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const displayItems = useMemo(() => buildDisplayItems(items, fallbackItems, minItems), [fallbackItems, items, minItems]);
  const loopItems = useMemo(() => [...displayItems, ...displayItems], [displayItems]);

  function scrollByCard(direction: "prev" | "next") {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const firstCard = carousel.querySelector<HTMLElement>(".package-card");
    const cardWidth = firstCard ? firstCard.offsetWidth + 14 : 320;
    carousel.scrollBy({
      left: direction === "next" ? cardWidth * 1.25 : -cardWidth * 1.25,
      behavior: "smooth",
    });
  }

  if (displayItems.length === 0) return null;

  return (
    <div className="package-carousel">
      <button className="package-carousel-nav prev" type="button" aria-label="Xem g\u00f3i tr\u01b0\u1edbc" onClick={() => scrollByCard("prev")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div className="package-carousel-viewport" ref={carouselRef}>
        <div
          className="package-carousel-track"
          style={{ animationDuration: `${displayItems.length * 15}s` }}
        >
          {loopItems.map((item, index) => (
            <PackageCard item={item} key={`${item.slug}-${item.id}-${index}`} />
          ))}
        </div>
      </div>

      <button className="package-carousel-nav next" type="button" aria-label="Xem g\u00f3i ti\u1ebfp theo" onClick={() => scrollByCard("next")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
