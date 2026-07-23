import { headers } from "next/headers";
import { PageDisabled } from "../components/PageDisabled";
import { SiteHeader } from "../components/SiteHeader";
import { LocalSpecialtyExplorer } from "../components/LocalSpecialtyExplorer";
import prisma from "@/lib/prisma";
import { isSitePageInactive } from "@/lib/siteSettings";
import { normalizeLocale } from "@/lib/i18n/config";
import { getStaticTranslationMap, translateFromMap, localizeContent } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function LocalSpecialtiesPage() {
  if (await isSitePageInactive("page_local_specialties_status")) {
    return <PageDisabled pageName="Đặc sản địa phương" />;
  }

  const locale = normalizeLocale((await headers()).get("x-locale"));
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);

  // Fetch local specialties with status "Hiển thị"
  const specialtiesRaw = await prisma.localSpecialty.findMany({
    where: { status: "Hiển thị" },
    orderBy: { createdAt: "desc" },
    include: { destination: true },
  });

  // Fetch translations for these items
  const specialties = await Promise.all(
    specialtiesRaw.map(async (item) => {
      const localized = await localizeContent("local_specialty", item, locale);
      return {
        id: localized.id,
        slug: localized.slug,
        name: localized.name,
        type: localized.type,
        description: localized.description || "",
        imageUrl: localized.imageUrl || "",
        priceText: localized.priceText || "",
        whereToBuy: localized.whereToBuy || "",
        destinationName: item.destination?.name || "",
      };
    })
  );

  return (
    <main className="specialty-page">
      <SiteHeader variant="hero" />
      <section className="page-hero offers-hero" style={{ backgroundImage: "linear-gradient(90deg, rgba(10, 20, 17, 0.78), rgba(10, 20, 17, 0.26)), url('https://images.unsplash.com/photo-1555931202-3c1a7042fbd1?auto=format&fit=crop&q=80&w=1600')" }}>
        <p className="eyebrow">{t("localSpecialty", "hero_eyebrow", "Đặc sản địa phương")}</p>
        <h1>{t("localSpecialty", "hero_title", "Tinh hoa văn hóa qua từng hương vị và sản phẩm thủ công.")}</h1>
        <p>{t("localSpecialty", "hero_copy", "Khám phá các đặc sản vùng miền, nơi lưu giữ tinh hoa ẩm thực và nghệ thuật truyền thống của người Việt.")}</p>
      </section>

      <LocalSpecialtyExplorer specialties={specialties} />
    </main>
  );
}
