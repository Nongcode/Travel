import { headers } from "next/headers";
import { PackageExplorer } from "../components/PackageExplorer";
import { SiteHeader } from "../components/SiteHeader";
import { destinations } from "../data/travel";
import { normalizeLocale } from "@/lib/i18n/config";
import { getStaticTranslationMap, translateFromMap } from "@/lib/i18n/server";
import { getPublicPackageCollections, getPublicPackages } from "@/lib/packages";

export default async function PackagesPage() {
  const locale = normalizeLocale((await headers()).get("x-locale"));
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);
  const [packages, collections] = await Promise.all([getPublicPackages(locale), getPublicPackageCollections(locale)]);

  return (
    <main>
      <SiteHeader variant="hero" />
      <section className="page-hero packages-hero">
        <p className="eyebrow">{t("packages", "hero_eyebrow", "Gói du lịch")}</p>
        <h1>{t("packages", "hero_title", "Hành trình gói gọn - Gợi ý & tư vấn theo mong muốn của bạn")}</h1>
        <p>{t("packages", "hero_copy", "Mỗi gói là một đề xuất khởi đầu. Hãy cho chúng tôi biết số người, phong cách và ngân sách để hoàn thiện hành trình phù hợp nhất.")}</p>
      </section>

      <PackageExplorer packages={packages} collections={collections} destinations={destinations} />
    </main>
  );
}
