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

type DestinationTabsProps = {
  destinations: string[];
  packages: PackageItem[];
};

function toTabId(destination: string) {
  return `destination-${destination
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

export function DestinationTabs({ destinations, packages }: DestinationTabsProps) {
  const fallbackPackages = packages.slice(0, 3);
  const tabStyles = destinations
    .map((destination) => {
      const tabId = toTabId(destination);
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

  return (
    <div className="destination-tabs">
      <style>{tabStyles}</style>
      <div className="destination-tab-list" role="tablist" aria-label="Chọn điểm đến">
        {destinations.map((destination, index) => {
          const tabId = toTabId(destination);

          return (
            <div className="destination-tab-item" key={destination}>
              <input
                defaultChecked={index === 0}
                id={tabId}
                name="destination-tab"
                type="radio"
              />
              <label className="destination-tab-label" htmlFor={tabId}>
                {destination}
              </label>
            </div>
          );
        })}
      </div>

      <div className="destination-panels">
        {destinations.map((destination) => {
          const tabId = toTabId(destination);
          const matchedPackages = packages.filter(
            (item) => item.destination === destination,
          );
          const visiblePackages =
            matchedPackages.length > 0 ? matchedPackages : fallbackPackages;

          return (
            <section className="destination-panel" data-tab={tabId} key={destination}>
              <div className="destination-result">
                <div className="destination-result-heading">
                  <p className="eyebrow">Gợi ý tại {destination}</p>
                </div>
                <div className="destination-package-grid">
                  {visiblePackages.slice(0, 3).map((item) => (
                    <PackageCard item={item} key={item.id} />
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
