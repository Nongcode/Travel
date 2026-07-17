"use client";

import { useMemo, useState } from "react";
import { useI18n } from "./I18nProvider";
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
  key?: string;
  items: TravelPackage[];
};

type PackageExplorerProps = {
  packages: TravelPackage[];
  collections: PackageCollection[];
  destinations: string[];
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/Ã„â€˜/g, "d");
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
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");

  const durationOptions = [
    { value: "", label: t("packages", "duration_all", "Mọi thời lượng") },
    { value: "short", label: t("packages", "duration_short", "1 - 2 ngày") },
    { value: "medium", label: t("packages", "duration_medium", "3 - 4 ngày") },
    { value: "long", label: t("packages", "duration_long", "5 ngày trở lên") },
  ];

  const budgetOptions = [
    { value: "", label: t("packages", "budget_all", "Mọi ngân sách") },
    { value: "under5", label: t("packages", "budget_under5", "Dưới 5 triệu") },
    { value: "5to7", label: t("packages", "budget_5to7", "5 - 7 triệu") },
    { value: "over7", label: t("packages", "budget_over7", "Trên 7 triệu") },
  ];

  const activeCollection = collections.find((collection) => (collection.key || collection.accent) === activeTab);
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
          <p className="eyebrow">{t("packages", "finder_eyebrow", "Tìm gói phù hợp")}</p>
          <h2>{t("packages", "finder_title", "Lọc nhanh hành trình theo nhu cầu của bạn")}</h2>
        </div>
        <p>{t("packages", "finder_copy", "Chọn nhóm du lịch, điểm đến, thời lượng hoặc ngân sách để xem các gói đang phù hợp nhất.")}</p>
      </div>

      <div className="package-filter-panel">
        <form className="package-search-form" onSubmit={(event) => event.preventDefault()}>
          <label className="search-field wide-field">
            {t("packages", "keyword", "Từ khóa")}
            <input
              suppressHydrationWarning
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("packages", "keyword_placeholder", "Ví dụ: Phú Quốc, gia đình, roadtrip...")}
              type="search"
            />
          </label>
          <label className="search-field">
            {t("packages", "destination", "Điểm đến")}
            <select suppressHydrationWarning value={destination} onChange={(event) => setDestination(event.target.value)}>
              <option value="">{t("packages", "all_destinations", "Tất cả điểm đến")}</option>
              {destinations.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            {t("packages", "duration", "Thời lượng")}
            <select suppressHydrationWarning value={duration} onChange={(event) => setDuration(event.target.value)}>
              {durationOptions.map((item) => (
                <option value={item.value} key={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            {t("packages", "budget", "Ngân sách")}
            <select suppressHydrationWarning value={budget} onChange={(event) => setBudget(event.target.value)}>
              {budgetOptions.map((item) => (
                <option value={item.value} key={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <button suppressHydrationWarning type="button" onClick={resetFilters}>
            {t("packages", "reset_filters", "Xóa lọc")}
          </button>
        </form>

        <div className="package-tab-list" aria-label={t("packages", "filter_by_group", "Lọc theo nhóm gói du lịch")}>
          <button
            suppressHydrationWarning
            className={activeTab === "all" ? "active" : ""}
            type="button"
            onClick={() => setActiveTab("all")}
          >
            {t("packages", "all_packages", "Tất cả gói")}
          </button>
          {collections.map((collection, index) => (
            <button
              suppressHydrationWarning
              className={activeTab === (collection.key || collection.accent) ? "active" : ""}
              type="button"
              key={collection.key || `${collection.accent}-${index}`}
              onClick={() => setActiveTab(collection.key || collection.accent)}
            >
              {collection.eyebrow}
            </button>
          ))}
        </div>
      </div>

      <div className="package-result-bar">
        <span>{filteredPackages.length} {t("packages", "matching_suffix", "gói phù hợp")}</span>
        <strong>{activeCollection ? activeCollection.title : t("packages", "all_journeys", "Tất cả hành trình đang có")}</strong>
      </div>

      {filteredPackages.length > 0 ? (
        <div className="package-grid wide">
          {filteredPackages.map((item, index) => (
            <PackageCard item={item} key={`${item.slug}-${item.id}-${index}`} />
          ))}
        </div>
      ) : (
        <div className="empty-package-state">
          <h3>{t("packages", "empty_title", "Chưa có gói trùng bộ lọc")}</h3>
          <p>{t("packages", "empty_copy", "Thử đổi điểm đến, thời lượng hoặc ngân sách để xem thêm gợi ý phù hợp.")}</p>
          <button suppressHydrationWarning type="button" onClick={resetFilters}>
            {t("packages", "empty_button", "Xem lại tất cả gói")}
          </button>
        </div>
      )}
    </section>
  );
}
