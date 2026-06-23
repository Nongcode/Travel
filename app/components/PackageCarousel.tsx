"use client";

import { useRef } from "react";
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
};

export function PackageCarousel({ items }: PackageCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: "prev" | "next") {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const firstCard = carousel.querySelector<HTMLElement>(".package-card");
    const cardWidth = firstCard ? firstCard.offsetWidth + 14 : 320;
    carousel.scrollBy({
      left: direction === "next" ? cardWidth : -cardWidth,
      behavior: "smooth",
    });
  }

  return (
    <div className="package-carousel">
      <button
        className="package-carousel-nav prev"
        type="button"
        aria-label="Xem gói trước"
        onClick={() => scrollByCard("prev")}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div className="package-carousel-viewport" ref={carouselRef}>
        <div className="package-carousel-track">
          {items.map((item) => (
            <PackageCard item={item} key={item.slug} />
          ))}
        </div>
      </div>

      <button
        className="package-carousel-nav next"
        type="button"
        aria-label="Xem gói tiếp theo"
        onClick={() => scrollByCard("next")}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
