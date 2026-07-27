import { publicPageMetadata } from "@/lib/seo";
import { PageDisabled } from "./components/PageDisabled";
import Link from "next/link";
import { JsonLd } from "./components/JsonLd";
import { DestinationTabs } from "./components/DestinationTabs";
import { PackageCarousel } from "./components/PackageCarousel";
import { PostCarousel } from "./components/PostCarousel";
import { CustomSelect } from "./components/CustomSelect";
import { SiteHeader } from "./components/SiteHeader";
import { destinations, tripStyles } from "./data/travel";
import prisma from "@/lib/prisma";
import { isSitePageInactive } from "@/lib/siteSettings";
import { withLocalePrefix } from "@/lib/i18n/config";
import { getRequestLocale, getStaticTranslationMap, localizeContent, translateFromMap } from "@/lib/i18n/server";
import { getPublicPackageCollections, getPublicPackages } from "@/lib/packages";

export const dynamic = "force-dynamic";

export const metadata = publicPageMetadata({
  title: "TimesGreen | Blog du lịch & Hành trình chọn lọc",
  description: "Khám phá Việt Nam qua lăng kính TimesGreen. Những chuyến đi, lịch trình, đặc sản và cẩm nang hữu ích.",
  path: "/",
});

const legacyDecoder = new TextDecoder("windows-1252");
const toLegacyMojibake = (value: string) => legacyDecoder.decode(Buffer.from(value, "utf8"));
const toDoubleLegacyMojibake = (value: string) => toLegacyMojibake(toLegacyMojibake(value));

const PUBLISHED_STATUS = "Đã xuất bản";
const OPEN_STATUS = "Đang mở";
const PUBLISHED_STATUSES = [PUBLISHED_STATUS, toLegacyMojibake(PUBLISHED_STATUS), toDoubleLegacyMojibake(PUBLISHED_STATUS)];
const OPEN_STATUSES = [OPEN_STATUS, toLegacyMojibake(OPEN_STATUS), toDoubleLegacyMojibake(OPEN_STATUS)];

export default async function Home() {
  if (await isSitePageInactive("page_home_status")) {
    return <PageDisabled pageName="Trang chủ" />;
  }

  const locale = await getRequestLocale();
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);
  const href = (path: string) => withLocalePrefix(path, locale);
  const packageGroupHref = (group: string) => `${href("/goi-du-lich")}?group=${encodeURIComponent(group)}`;
  const [allPackages, packageCollections] = await Promise.all([getPublicPackages(locale), getPublicPackageCollections(locale)]);

  const dbPosts = await prisma.post.findMany({
    where: { status: { in: PUBLISHED_STATUSES } },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { category: true },
  });

  const dbReviews = await prisma.review.findMany({
    where: { status: "Hiển thị" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const homepageBanner = await prisma.banner.findFirst({
    where: { bannerType: "homepage", status: { in: OPEN_STATUSES } },
    orderBy: { updatedAt: "desc" },
  });

  const heroMedia = homepageBanner ? homepageBanner.imageUrl : "/Drone_flight_Vietnam_landscapes_202606220932.mp4";
  const heroMediaType = heroMedia.match(/\.(mp4|webm|mov)(\?|$)/i) ? "video" : "image";
  const heroTitle = locale === "vi" && homepageBanner?.title ? homepageBanner.title : t("home", "hero_title", "Những chuyến đi cùng bạn như một kí ức đẹp không thể quên.");
  const heroSubtitle = locale === "vi" && homepageBanner?.subtitle ? homepageBanner.subtitle : t("home", "hero_subtitle", "Blog du lịch hiện đại dành cho người muốn tìm cảm hứng, đọc kinh nghiệm thực tế và để lại thông tin khi cần gợi ý lịch trình phù hợp.");

  const localizedDbPosts = await Promise.all(dbPosts.map((post) => localizeContent("post", post, locale)));

  const posts = localizedDbPosts.map((p) => ({
    id: p.id,
    category: p.category?.name || "Chưa phân loại",
    title: p.title,
    excerpt: p.excerpt || "",
    image: p.imageUrl || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1000&q=80",
    readTime: p.readTime || "5 phút đọc",
    date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("vi-VN") : new Date(p.createdAt).toLocaleDateString("vi-VN"),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://timesgreen.net",
        name: "TimesGreen",
        description: "Blog du lịch hiện đại về điểm đến, lịch trình và tư vấn gói du lịch Việt Nam không thanh toán online.",
        publisher: {
          "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://timesgreen.net"}/#organization`
        }
      },
      {
        "@type": "Organization",
        "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://timesgreen.net"}/#organization`,
        name: "TimesGreen",
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://timesgreen.net",
        logo: {
          "@type": "ImageObject",
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://timesgreen.net"}/uploads/logos/logo-1784804267099-cda8540c.png`
        }
      }
    ]
  };

  return (
    <main>
      <JsonLd data={jsonLd} />
      <section className="hero-section">
        {heroMediaType === "video" ? (
          <video autoPlay loop muted playsInline className="hero-video">
            <source src={heroMedia} />
          </video>
        ) : (
          <div
            className="hero-video"
            style={{
              backgroundImage: `url(${heroMedia})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: -1,
            }}
          />
        )}
        <div className="hero-overlay" />
        <SiteHeader variant="hero" />

        <div className="hero-content" id="top">
          <p className="eyebrow">{t("home", "hero_eyebrow", "Blog du l\u1ecbch & h\u00e0nh tr\u00ecnh ch\u1ecdn l\u1ecdc")}</p>
          <h1>{heroTitle}</h1>
          <p className="hero-copy">{heroSubtitle}</p>
          <div className="hero-actions">
            <a className="primary-action" href="#travel-packages">
              {t("home", "hero_cta_primary", "Đọc bài mới")}
            </a>
            <Link className="secondary-action" href={href("/goi-du-lich")}>
              {t("home", "hero_cta_secondary", "Xem gói du lịch")}
            </Link>
          </div>
          <form className="hero-search" id="trip-search" action={href("/goi-du-lich")}>
            <label>
              {t("home", "search_destination", "Điểm đến")}
              <input suppressHydrationWarning name="destination" placeholder={t("home", "search_destination_placeholder", "Bạn muốn đi đâu?")} />
            </label>
            <div className="hero-search-field">
              <span className="hero-search-label">{t("home", "search_style", "Phong cách")}</span>
              <CustomSelect
                name="style"
                defaultValue=""
                placeholder={t("home", "search_style_placeholder", "Chọn trải nghiệm")}
                options={[
                  { value: "", label: t("home", "search_style_placeholder", "Chọn trải nghiệm") },
                  { value: "family", label: t("home", "style_family", "Gia đình") },
                  { value: "friends", label: t("home", "style_friends", "Nhóm bạn") },
                  { value: "resort", label: t("home", "style_resort", "Nghỉ dưỡng") },
                  { value: "photo", label: t("home", "style_photo", "Chụp ảnh") },
                ]}
              />
            </div>
            <label>
              {t("home", "search_time", "Thời gian")}
              <input suppressHydrationWarning name="date" type="month" />
            </label>
            <button suppressHydrationWarning type="submit">{t("home", "search_submit", "Tìm chuyến đi")}</button>
          </form>
        </div>
      </section>

      <section className="package-showcase" id="travel-packages">
        <div className="package-showcase-heading">
          <h2>{t("home", "package_heading", "Chọn hành trình theo người đi cùng bạn")}</h2>
          <Link href={href("/goi-du-lich")}>{t("home", "package_all", "Xem tất cả gói du lịch")}</Link>
        </div>

        <div className="collection-stack">
          {packageCollections.map((collection, collectionIndex) => (
            <section className={`package-collection ${collection.accent}`} key={collection.key || `${collection.accent}-${collectionIndex}`}>
              <div className="collection-copy">
                <p className="eyebrow">{collection.eyebrow}</p>
                <h3>{collection.title}</h3>
                <p>{collection.description}</p>
                <Link href={packageGroupHref(collection.key || collection.accent)}>{t("home", "package_view_current", "Xem gói này")}</Link>
              </div>
              <PackageCarousel items={collection.items} fallbackItems={allPackages} minItems={5} />
            </section>
          ))}
        </div>
      </section>

      <section className="feature-band" id="destinations">
        <div className="feature-copy">
          <p className="slogan-kicker">TimesGreen journeys</p>
          <h2>
            {t("home", "feature_title", "Chọn điểm đến theo cảm xúc,")}
            <span>{t("home", "feature_title_span", "không chỉ theo địa danh.")}</span>
          </h2>
          <p>{t("home", "feature_copy", "Vì đó là kỷ niệm mà bạn sẽ đem theo mãi bên mình.")}</p>
        </div>
        <DestinationTabs destinations={destinations} packages={allPackages} />
      </section>

      <section className="section-shell">
        <div className="section-heading compact">
          <p className="eyebrow">{t("home", "benefits_eyebrow", "Trải nghiệm và lợi ích của một chuyến đi đem lại")}</p>
        </div>
        <div className="style-grid">
          {tripStyles.map((item, index) => {
            const tk = item.title === "Nghỉ dưỡng tinh gọn" ? "style_resort" :
              item.title === "Khám phá bản địa" ? "style_local" :
                item.title === "Chuyến đi chụp ảnh" ? "style_photo" :
                  item.title === "Du lịch cùng gia đình" ? "style_family" :
                    item.title === "Thanh xuân cùng bạn bè" ? "style_friends" :
                      "style_seasonal";
            return (
              <article key={`${item.title}-${index}`}>
                <div className="style-image" style={{ backgroundImage: `url(${item.image})` }} />
                <h3>{t("home", `${tk}_title`, item.title)}</h3>
                <p>{t("home", `${tk}_detail`, item.detail)}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="news-section" id="stories">
        <div className="news-heading">
          <div>
            <p className="eyebrow">{t("home", "news_eyebrow", "Câu chuyện du lịch")}</p>
            <h2>{t("home", "news_title", "Bài viết nổi bật")}</h2>
          </div>
          <p>{t("home", "news_copy", "Những bài viết được chọn để gợi ý lịch trình, mùa đi đẹp và trải nghiệm bản địa trước khi bạn để lại thông tin tư vấn.")}</p>
        </div>

        <PostCarousel posts={posts} />
      </section>
    </main>
  );
}
