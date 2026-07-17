import Link from "next/link";
import { headers } from "next/headers";
import { SiteHeader } from "../components/SiteHeader";
import prisma from "@/lib/prisma";
import { normalizeLocale, withLocalePrefix } from "@/lib/i18n/config";
import { getStaticTranslationMap, translateFromMap, localizeContent } from "@/lib/i18n/server";

export default async function LocalSpecialtiesPage() {
  const locale = normalizeLocale((await headers()).get("x-locale"));
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);

  // Fetch local specialties with status "Hiển thị"
  const specialtiesRaw = await prisma.localSpecialty.findMany({
    where: { status: "Hiển thị" },
    orderBy: { createdAt: "desc" },
  });

  // Fetch translations for these items
  const specialties = await Promise.all(
    specialtiesRaw.map(async (item) => {
      // Create a localized copy
      return localizeContent("local_specialty", item, locale);
    })
  );

  return (
    <main>
      <SiteHeader variant="hero" />
      <section className="page-hero offers-hero" style={{ backgroundImage: "linear-gradient(90deg, rgba(10, 20, 17, 0.78), rgba(10, 20, 17, 0.26)), url('https://images.unsplash.com/photo-1555931202-3c1a7042fbd1?auto=format&fit=crop&q=80&w=1600')" }}>
        <p className="eyebrow">{t("localSpecialty", "hero_eyebrow", "Đặc sản địa phương")}</p>
        <h1>{t("localSpecialty", "hero_title", "Tinh hoa văn hóa qua từng hương vị và sản phẩm thủ công.")}</h1>
        <p>{t("localSpecialty", "hero_copy", "Khám phá các đặc sản vùng miền, nơi lưu giữ tinh hoa ẩm thực và nghệ thuật truyền thống của người Việt.")}</p>
      </section>

      <section className="section-shell">
        <div className="offer-grid">
          {specialties.map((item) => (
            <article className="offer-card" key={item.id}>
              <div
                className="offer-image"
                style={{ backgroundImage: `url(${item.imageUrl || ''})` }}
              >
                <span>{item.type === "FOOD" ? t("localSpecialty", "type_food", "Ẩm thực") : t("localSpecialty", "type_handicraft", "Thủ công mỹ nghệ")}</span>
              </div>
              <div className="offer-body">
                <h2>{item.name}</h2>
                <p>{item.description}</p>
                <div className="offer-footer">
                  <strong>{item.priceText}</strong>
                  <Link href={withLocalePrefix(`/dac-san/${item.slug}`, locale)}>{t("localSpecialty", "view_detail", "Xem chi tiết")}</Link>
                </div>
              </div>
            </article>
          ))}
          {specialties.length === 0 && (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem 0", color: "#666" }}>
              {t("localSpecialty", "no_items", "Hiện chưa có đặc sản nào được hiển thị.")}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
