import Link from "next/link";
import { DestinationTabs } from "./components/DestinationTabs";
import { PackageCarousel } from "./components/PackageCarousel";
import { PostCard } from "./components/PostCard";
import { CustomSelect } from "./components/CustomSelect";
import { SiteHeader } from "./components/SiteHeader";
import { destinations, tripStyles } from "./data/travel";
import prisma from "@/lib/prisma";
import { withLocalePrefix } from "@/lib/i18n/config";
import { getRequestLocale, getStaticTranslationMap, localizeContent, translateFromMap } from "@/lib/i18n/server";
import { getPublicPackageCollections, getPublicPackages } from "@/lib/packages";

export const dynamic = "force-dynamic";

const legacyDecoder = new TextDecoder("windows-1252");
const toLegacyMojibake = (value: string) => legacyDecoder.decode(Buffer.from(value, "utf8"));
const toDoubleLegacyMojibake = (value: string) => toLegacyMojibake(toLegacyMojibake(value));

const PUBLISHED_STATUS = "\u0110\u00e3 xu\u1ea5t b\u1ea3n";
const OPEN_STATUS = "\u0110ang m\u1edf";
const PUBLISHED_STATUSES = [PUBLISHED_STATUS, toLegacyMojibake(PUBLISHED_STATUS), toDoubleLegacyMojibake(PUBLISHED_STATUS)];
const OPEN_STATUSES = [OPEN_STATUS, toLegacyMojibake(OPEN_STATUS), toDoubleLegacyMojibake(OPEN_STATUS)];

export default async function Home() {
  const locale = await getRequestLocale();
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);
  const href = (path: string) => withLocalePrefix(path, locale);
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
    category: p.category?.name || "Ch\u01b0a ph\u00e2n lo\u1ea1i",
    title: p.title,
    excerpt: p.excerpt || "",
    image: p.imageUrl || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1000&q=80",
    readTime: p.readTime || "5 ph\u00fat \u0111\u1ecdc",
    date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("vi-VN") : new Date(p.createdAt).toLocaleDateString("vi-VN"),
  }));

  return (
    <main>
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
              {t("home", "hero_cta_primary", "\u0110\u1ecdc b\u00e0i m\u1edbi")}
            </a>
            <Link className="secondary-action" href={href("/goi-du-lich")}>
              {t("home", "hero_cta_secondary", "Xem g\u00f3i du l\u1ecbch")}
            </Link>
          </div>
          <form className="hero-search" id="trip-search" action={href("/goi-du-lich")}>
            <label>
              {t("home", "search_destination", "\u0110i\u1ec3m \u0111\u1ebfn")}
              <input suppressHydrationWarning name="destination" placeholder={t("home", "search_destination_placeholder", "B\u1ea1n mu\u1ed1n \u0111i \u0111\u00e2u?")} />
            </label>
            <div className="hero-search-field">
              <span className="hero-search-label">{t("home", "search_style", "Phong c\u00e1ch")}</span>
              <CustomSelect
                name="style"
                defaultValue=""
                placeholder={t("home", "search_style_placeholder", "Ch\u1ecdn tr\u1ea3i nghi\u1ec7m")}
                options={[
                  { value: "", label: t("home", "search_style_placeholder", "Ch\u1ecdn tr\u1ea3i nghi\u1ec7m") },
                  { value: "family", label: t("home", "style_family", "Gia \u0111\u00ecnh") },
                  { value: "friends", label: t("home", "style_friends", "Nh\u00f3m b\u1ea1n") },
                  { value: "resort", label: t("home", "style_resort", "Ngh\u1ec9 d\u01b0\u1ee1ng") },
                  { value: "photo", label: t("home", "style_photo", "Ch\u1ee5p \u1ea3nh") },
                ]}
              />
            </div>
            <label>
              {t("home", "search_time", "Th\u1eddi gian")}
              <input suppressHydrationWarning name="date" type="month" />
            </label>
            <button suppressHydrationWarning type="submit">{t("home", "search_submit", "T\u00ecm chuy\u1ebfn \u0111i")}</button>
          </form>
        </div>
      </section>

      <section className="package-showcase" id="travel-packages">
        <div className="package-showcase-heading">
          <h2>{t("home", "package_heading", "Ch\u1ecdn h\u00e0nh tr\u00ecnh theo ng\u01b0\u1eddi \u0111i c\u00f9ng b\u1ea1n")}</h2>
          <Link href={href("/goi-du-lich")}>{t("home", "package_all", "Xem t\u1ea5t c\u1ea3 g\u00f3i du l\u1ecbch")}</Link>
        </div>

        <div className="collection-stack">
          {packageCollections.map((collection, collectionIndex) => (
            <section className={`package-collection ${collection.accent}`} key={collection.key || `${collection.accent}-${collectionIndex}`}>
              <div className="collection-copy">
                <p className="eyebrow">{collection.eyebrow}</p>
                <h3>{collection.title}</h3>
                <p>{collection.description}</p>
                <Link href={href("/lien-he")}>{t("home", "package_consult", "Nh\u1eadn t\u01b0 v\u1ea5n nh\u00f3m g\u00f3i n\u00e0y")}</Link>
              </div>
              <PackageCarousel items={collection.items} fallbackItems={allPackages} minItems={5} />
            </section>
          ))}
        </div>
      </section>

      <section className="feature-band" id="destinations">
        <div className="feature-copy">
          <p className="slogan-kicker">VietVista journeys</p>
          <h2>
            {t("home", "feature_title", "Ch\u1ecdn \u0111i\u1ec3m \u0111\u1ebfn theo c\u1ea3m x\u00fac,")}
            <span>{t("home", "feature_title_span", "kh\u00f4ng ch\u1ec9 theo \u0111\u1ecba danh.")}</span>
          </h2>
          <p>{t("home", "feature_copy", "V\u00ec \u0111\u00f3 l\u00e0 k\u1ec9 ni\u1ec7m m\u00e0 b\u1ea1n s\u1ebd \u0111em theo m\u00e3i b\u00ean m\u00ecnh.")}</p>
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
            <p className="eyebrow">{t("home", "news_eyebrow", "C\u00e2u chuy\u1ec7n du l\u1ecbch")}</p>
            <h2>{t("home", "news_title", "B\u00e0i vi\u1ebft n\u1ed5i b\u1eadt")}</h2>
          </div>
          <p>{t("home", "news_copy", "Nh\u1eefng b\u00e0i vi\u1ebft \u0111\u01b0\u1ee3c ch\u1ecdn \u0111\u1ec3 g\u1ee3i \u00fd l\u1ecbch tr\u00ecnh, m\u00f9a \u0111i \u0111\u1eb9p v\u00e0 tr\u1ea3i nghi\u1ec7m b\u1ea3n \u0111\u1ecba tr\u01b0\u1edbc khi b\u1ea1n \u0111\u1ec3 l\u1ea1i th\u00f4ng tin t\u01b0 v\u1ea5n.")}</p>
        </div>

        <div className="post-grid news-grid">
          {posts.map((post) => (
            <PostCard post={post} key={post.id} />
          ))}
        </div>
      </section>
    </main>
  );
}