"use client";

import Link from "next/link";
import { useI18n } from "./I18nProvider";

type PackageCardProps = {
  item: {
    slug: string;
    name: string;
    destination: string;
    duration: string;
    price: string;
    summary: string;
    image: string;
    status: string;
  };
};

import { getStatusStyleAndLabel } from "@/lib/status";

export function PackageCard({ item }: PackageCardProps) {
  const { t, href, locale } = useI18n();
  const { statusClass, statusLabel } = getStatusStyleAndLabel(item.status, locale, t);

  return (
    <Link className="package-card" href={href("/goi-du-lich/" + item.slug)}>
      <div className="package-image" style={{ backgroundImage: "url(" + item.image + ")" }}>
        <span className={`status-badge ${statusClass}`}>
          {statusLabel}
        </span>
      </div>
      <div className="package-body">
        <p className="package-kicker">{item.destination} / {item.duration}</p>
        <h3>{item.name}</h3>
        <p>{item.summary}</p>
        <div className="package-footer">
          <strong>{item.price}</strong>
          <span>{t("common", "details", "Chi tiết")}</span>
        </div>
      </div>
    </Link>
  );
}
