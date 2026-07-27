import { absoluteUrl, publicPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { PageDisabled } from "../components/PageDisabled";
import { JsonLd } from "../components/JsonLd";
import { headers } from "next/headers";
import { NewsPostGrid } from "../components/NewsPostGrid";
import { SiteHeader } from "../components/SiteHeader";
import prisma from "@/lib/prisma";
import { isSitePageInactive } from "@/lib/siteSettings";
import { normalizeLocale, withLocalePrefix } from "@/lib/i18n/config";
import { getStaticTranslationMap, localizeContent, translateFromMap } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export const metadata = publicPageMetadata({
  title: "Vietnam Travel Guides, Tips & Local Stories | TimesGreen",
  description: "Read practical Vietnam travel guides, local food stories, itinerary ideas, seasonal tips and cultural notes curated by TimesGreen for first-time and returning international travelers.",
  path: "/tin-tuc",
});


const legacyDecoder = new TextDecoder("windows-1252");
const toLegacyMojibake = (value: string) => legacyDecoder.decode(Buffer.from(value, "utf8"));
const toDoubleLegacyMojibake = (value: string) => toLegacyMojibake(toLegacyMojibake(value));
const PUBLISHED_STATUS = "Đã xuất bản";
const PUBLISHED_STATUSES = [PUBLISHED_STATUS, toLegacyMojibake(PUBLISHED_STATUS), toDoubleLegacyMojibake(PUBLISHED_STATUS)];

function getDateLocale(locale: string) {
  if (locale === "en") return "en-US";
  if (locale === "zh-CN") return "zh-CN";
  return "vi-VN";
}

export default async function NewsPage() {
  if (await isSitePageInactive("page_news_status")) {
    return <PageDisabled pageName="Tin tức & Cẩm nang" />;
  }

  const locale = normalizeLocale((await headers()).get("x-locale"));
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);

  const dbPosts = await prisma.post.findMany({
    where: { status: { in: PUBLISHED_STATUSES } },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  const localizedDbPosts = await Promise.all(dbPosts.map((post) => localizeContent("post", post, locale)));
  const dateLocale = getDateLocale(locale);

  const posts = localizedDbPosts.map((post) => ({
    id: post.id,
    category: post.category?.name || t("news", "fallback_category", "Cẩm nang"),
    title: post.title,
    excerpt: post.excerpt || "",
    image: post.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    readTime: post.readTime || t("news", "read_time_default", "5 phút đọc"),
    date: post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString(dateLocale)
      : new Date(post.createdAt).toLocaleDateString(dateLocale),
  }));

  const leadPost = posts[0] || {
    id: 0,
    category: t("news", "fallback_category", "Cẩm nang"),
    title: t("news", "empty_title", "Chưa có bài viết nào"),
    excerpt: t("news", "empty_excerpt", "Vui lòng đăng bài viết mới ở trang quản trị."),
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    readTime: t("news", "read_time_zero", "0 phút đọc"),
    date: "",
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("news", "all_title", "Tất cả bài viết"),
    url: absoluteUrl("/tin-tuc"),
    itemListElement: posts.slice(0, 50).map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: post.title,
      url: absoluteUrl(`/tin-tuc/${post.id}`),
    })),
  };

  return (
    <main className="news-page">
      <JsonLd data={itemListJsonLd} />
      <SiteHeader variant="hero" />
      <section className="page-hero news-hero">
        <p className="eyebrow">{t("news", "hero_eyebrow", "Tin tức & cẩm nang")}</p>
        <h1>{t("news", "hero_title", "Góc đọc trước khi lên đường.")}</h1>
        <p>{t("news", "hero_copy", "Tổng hợp bài viết về lịch trình, mùa du lịch, trải nghiệm địa phương và cách chọn gói phù hợp cho từng kiểu khách.")}</p>
      </section>

      <section className="editorial-lead">
        <div
          className="editorial-image"
          style={{ backgroundImage: `url(${leadPost.image})` }}
        />
        <div className="editorial-copy">
          <p className="eyebrow">{leadPost.category}</p>
          <h2>{leadPost.title}</h2>
          <p>{leadPost.excerpt}</p>
          <Link href={withLocalePrefix("/#consult", locale)}>{t("news", "lead_cta", "Cần tư vấn lịch trình này")}</Link>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading compact">
          <p className="eyebrow">{t("news", "latest_eyebrow", "Bài mới nhất")}</p>
          <h2>{t("news", "all_title", "Tất cả bài viết")}</h2>
        </div>
        <NewsPostGrid posts={posts.length > 1 ? posts.slice(1) : []} />
      </section>
    </main>
  );
}
