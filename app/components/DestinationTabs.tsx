"use client";

import { useState, type ReactNode } from "react";
import { PackageCard } from "./PackageCard";
import { ScrollProgressIndicator, useHorizontalScrollProgress } from "./ScrollProgressIndicator";

type PackageItem = {
  id: number;
  slug: string;
  name: string;
  destination: string;
  rawDestination: string;
  duration: string;
  price: string;
  summary: string;
  image: string;
  status: string;
};

type DestinationTabsProps = {
  destinations: string[];
  packages: PackageItem[];
};

function toTabId(destination: string, index = 0) {
  const base = destination
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0111\u0110]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `destination-${base || "item"}-${index}`;
}

function DestinationPackageScroller({ children, active }: { children: ReactNode; active: boolean }) {
  const { viewportRef, hasOverflow, progress } =
    useHorizontalScrollProgress<HTMLDivElement>(active);

  return (
    <>
      <div className="destination-package-grid" ref={viewportRef}>
        {children}
      </div>
      {hasOverflow ? (
        <ScrollProgressIndicator
          className="destination-scroll-indicator"
          label="Destination package position"
          progress={progress}
        />
      ) : null}
    </>
  );
}


export function DestinationTabs({ destinations, packages }: DestinationTabsProps) {
  const [activeTab, setActiveTab] = useState(() => destinations.length > 0 ? toTabId(destinations[0], 0) : "");
  const fallbackPackages = packages.slice(0, 3);
  const tabStyles = destinations
    .map((destination, index) => {
      const tabId = toTabId(destination, index);
      return `
        .destination-tabs:has(#${tabId}:checked) .destination-tab-label[for="${tabId}"] {
          background: var(--green);
          color: #fffdf7;
          transform: translateY(-1px);
        }

        .destination-tabs:has(#${tabId}:checked) .destination-panel[data-tab="${tabId}"] {
          display: block;
        }
      `;
    })
    .join("\n");

  const getTranslatedDestination = (dest: string) => {
    const matched = packages.find((item) => item.rawDestination === dest);
    return matched ? matched.destination : dest;
  };

  return (
    <div className="destination-tabs">
      <style>{tabStyles}</style>
      <div className="destination-tab-list" role="tablist" aria-label="Ch\u1ecdn \u0111i\u1ec3m \u0111\u1ebfn">
        {destinations.map((destination, index) => {
          const tabId = toTabId(destination, index);

          return (
            <div className="destination-tab-item" key={`${destination}-${index}`}>
              <input suppressHydrationWarning defaultChecked={index === 0} id={tabId} name="destination-tab" type="radio" onChange={() => setActiveTab(tabId)} />
              <label className="destination-tab-label" htmlFor={tabId}>
                {getTranslatedDestination(destination)}
              </label>
            </div>
          );
        })}
      </div>

      <div className="destination-panels">
        {destinations.map((destination, index) => {
          const tabId = toTabId(destination, index);
          const matchedPackages = packages.filter((item) => item.rawDestination === destination);
          const visiblePackages = matchedPackages.length > 0 ? matchedPackages : fallbackPackages;

          return (
            <section className="destination-panel" data-tab={tabId} key={`${destination}-${index}`}>
              <div className="destination-result">
                <div className="destination-result-heading">
                  <p className="eyebrow">{getTranslatedDestination(destination)}</p>
                </div>
                <DestinationPackageScroller active={activeTab === tabId}>
                  {visiblePackages.slice(0, 3).map((item, packageIndex) => (
                    <PackageCard item={item} key={`${item.id}-${item.slug}-${packageIndex}`} />
                  ))}
                </DestinationPackageScroller>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}