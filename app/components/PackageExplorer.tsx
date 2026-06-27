"use client";

import { useMemo, useState } from "react";
import { PackageCard } from "./PackageCard";

type TravelPackage = {
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

type PackageCollection = {
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  items: TravelPackage[];
};

type PackageExplorerProps = {
  packages: TravelPackage[];
  collections: PackageCollection[];
  destinations: string[];
};

const durationOptions = [
  { value: "", label: "Mọi thời lượng" },
  { value: "short", label: "1 - 2 ngày" },
  { value: "medium", label: "3 - 4 ngày" },
  { value: "long", label: "5 ngày trở lên" },
];

const budgetOptions = [
  { value: "", label: "Mọi ngân sách" },
  { value: "under5", label: "Dưới 5 triệu" },
  { value: "5to7", label: "5 - 7 triệu" },
  { value: "over7", label: "Trên 7 triệu" },
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function getDurationDays(duration: string) {
  const match = duration.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function getPriceInMillions(price: string) {
  const match = price.match(/[\d.]+/);
  if (!match) {
    return 0;
  }

  return Number(match[0].replace(/\./g, "")) / 1000000;
}

export function PackageExplorer({ packages, collections, destinations }: PackageExplorerProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");

  const activeCollection = collections.find((collection) => collection.accent === activeTab);
  const basePackages = activeCollection ? activeCollection.items : packages;
  const normalizedQuery = normalizeText(query.trim());

  const filteredPackages = useMemo(() => {
    return basePackages.filter((item) => {
      const searchableText = normalizeText(`${item.name} ${item.destination} ${item.summary}`);
      const itemDays = getDurationDays(item.duration);
      const itemPrice = getPriceInMillions(item.price);

      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
      const matchesDestination = !destination || item.destination === destination;
      const matchesDuration =
        !duration ||
        (duration === "short" && itemDays <= 2) ||
        (duration === "medium" && itemDays >= 3 && itemDays <= 4) ||
        (duration === "long" && itemDays >= 5);
      const matchesBudget =
        !budget ||
        (budget === "under5" && itemPrice < 5) ||
        (budget === "5to7" && itemPrice >= 5 && itemPrice <= 7) ||
        (budget === "over7" && itemPrice > 7);

      return matchesQuery && matchesDestination && matchesDuration && matchesBudget;
    });
  }, [basePackages, budget, destination, duration, normalizedQuery]);

  const resetFilters = () => {
    setQuery("");
    setDestination("");
    setDuration("");
    setBudget("");
  };

  return (
    <section className="package-finder" id="package-finder">
      <div className="package-finder-heading">
        <div>
          <p className="eyebrow">Tìm gói phù hợp</p>
          <h2>Lọc nhanh hành trình theo nhu cầu của bạn</h2>
        </div>
        <p>
          Chọn nhóm du lịch, điểm đến, thời lượng hoặc ngân sách để xem các gói đang phù hợp nhất.
        </p>
      </div>

      <div className="package-filter-panel">
        <form className="package-search-form" onSubmit={(event) => event.preventDefault()}>
          <label className="search-field wide-field">
            Từ khóa
            <input suppressHydrationWarning
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ví dụ: Phú Quốc, gia đình, roadtrip..."
              type="search"
            />
          </label>
          <label className="search-field">
            Điểm đến
            <select suppressHydrationWarning value={destination} onChange={(event) => setDestination(event.target.value)}>
              <option value="">Tất cả điểm đến</option>
              {destinations.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            Thời lượng
            <select suppressHydrationWarning value={duration} onChange={(event) => setDuration(event.target.value)}>
              {durationOptions.map((item) => (
                <option value={item.value} key={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            Ngân sách
            <select suppressHydrationWarning value={budget} onChange={(event) => setBudget(event.target.value)}>
              {budgetOptions.map((item) => (
                <option value={item.value} key={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <button suppressHydrationWarning type="button" onClick={resetFilters}>
            Xóa lọc
          </button>
        </form>

        <div className="package-tab-list" aria-label="Lọc theo nhóm gói du lịch">
          <button
            suppressHydrationWarning
            className={activeTab === "all" ? "active" : ""}
            type="button"
            onClick={() => setActiveTab("all")}
          >
            Tất cả gói
          </button>
          {collections.map((collection) => (
            <button
              suppressHydrationWarning
              className={activeTab === collection.accent ? "active" : ""}
              type="button"
              key={collection.accent}
              onClick={() => setActiveTab(collection.accent)}
            >
              {collection.eyebrow}
            </button>
          ))}
        </div>
      </div>

      <div className="package-result-bar">
        <span>{filteredPackages.length} gói phù hợp</span>
        <strong>{activeCollection ? activeCollection.title : "Tất cả hành trình đang có"}</strong>
      </div>

      {filteredPackages.length > 0 ? (
        <div className="package-grid wide">
          {filteredPackages.map((item) => (
            <PackageCard item={item} key={item.slug} />
          ))}
        </div>
      ) : (
        <div className="empty-package-state">
          <h3>Chưa có gói trùng bộ lọc</h3>
          <p>Thử đổi điểm đến, thời lượng hoặc ngân sách để xem thêm gợi ý phù hợp.</p>
          <button suppressHydrationWarning type="button" onClick={resetFilters}>
            Xem lại tất cả gói
          </button>
        </div>
      )}
    </section>
  );
}