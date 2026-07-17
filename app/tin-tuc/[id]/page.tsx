import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SiteHeader } from "../../components/SiteHeader";
import { ReadingProgressBar } from "../../components/PostProgress";
import { PostSidebar } from "../../components/PostSidebar";
import { PostCard } from "../../components/PostCard";
import { ContentBlock } from "../../data/postsContent";
import prisma from "@/lib/prisma";
import { normalizeLocale, withLocalePrefix } from "@/lib/i18n/config";
import { getStaticTranslationMap, localizeContent, translateFromMap } from "@/lib/i18n/server";
import { getPublicPackageBySlug } from "@/lib/packages";

export const dynamic = "force-dynamic";

type PostDetailPageProps = {
  params: Promise<{ id: string }>;
};

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

export async function generateStaticParams() {
  const dbPosts = await prisma.post.findMany({
    where: { status: { in: PUBLISHED_STATUSES } },
    select: { id: true },
  });
  return dbPosts.map((post) => ({ id: String(post.id) }));
}

export async function generateMetadata({ params }: PostDetailPageProps) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id: Number(id) } });

  if (!post || !PUBLISHED_STATUSES.includes(post.status)) {
    return { title: "Không tìm thấy bài viết | VietVista" };
  }

  return {
    title: `${post.title} | Cẩm nang VietVista`,
    description: post.seoDescription || post.summary || undefined,
  };
}

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const locale = normalizeLocale((await headers()).get("x-locale"));
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);
  const dateLocale = getDateLocale(locale);

  const dbPost = await prisma.post.findUnique({
    where: { id: Number(id) },
    include: {
      category: true,
      author: true,
      relatedPackage: true,
    },
  });

  if (!dbPost || !PUBLISHED_STATUSES.includes(dbPost.status)) {
    notFound();
  }

  const localizedDbPost = await localizeContent("post", dbPost, locale);
  const post = {
    id: localizedDbPost.id,
    category: localizedDbPost.category?.name || t("news", "fallback_category", "Cẩm nang"),
    title: localizedDbPost.title,
    date: localizedDbPost.publishedAt
      ? new Date(localizedDbPost.publishedAt).toLocaleDateString(dateLocale)
      : new Date(localizedDbPost.createdAt).toLocaleDateString(dateLocale),
    readTime: localizedDbPost.readTime || t("news", "read_time_default", "5 phút đọc"),
    author: {
      name: localizedDbPost.author?.name || "VietVista Editor",
      avatar: localizedDbPost.author?.avatarUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80",
      role: localizedDbPost.author?.role || "Travel Writer",
    },
    image: localizedDbPost.imageUrl || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=85",
    summary: localizedDbPost.summary || "",
    relatedPackageSlug: localizedDbPost.relatedPackage?.slug || null,
    blocks: (localizedDbPost.contentBlocks as unknown as ContentBlock[]) || [],
  };

  const headings = post.blocks
    .filter((block): block is Extract<ContentBlock, { type: "heading-2" }> => block.type === "heading-2")
    .map((block) => ({ id: slugify(block.text), text: block.text }));

  const relatedPackage = post.relatedPackageSlug ? await getPublicPackageBySlug(post.relatedPackageSlug, locale) : null;

  const dbRelatedPosts = await prisma.post.findMany({
    where: {
      status: { in: PUBLISHED_STATUSES },
      id: { not: post.id },
    },
    orderBy: { createdAt: "desc" },
    take: 2,
    include: { category: true },
  });

  const localizedRelatedPosts = await Promise.all(dbRelatedPosts.map((item) => localizeContent("post", item, locale)));
  const relatedPosts = localizedRelatedPosts.map((relatedPost) => ({
    id: relatedPost.id,
    category: relatedPost.category?.name || t("news", "fallback_category", "Cẩm nang"),
    title: relatedPost.title,
    excerpt: relatedPost.excerpt || "",
    image: relatedPost.imageUrl || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1000&q=80",
    readTime: relatedPost.readTime || t("news", "read_time_default", "5 phút đọc"),
    date: relatedPost.publishedAt
      ? new Date(relatedPost.publishedAt).toLocaleDateString(dateLocale)
      : new Date(relatedPost.createdAt).toLocaleDateString(dateLocale),
  }));

  return (
    <main className="post-detail-page">
      <ReadingProgressBar />
      <SiteHeader variant="hero" />

      <section
        className="page-hero post-hero"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(10, 20, 17, 0.6) 0%, rgba(10, 20, 17, 0.85) 100%), url(${post.image})`,
        }}
      >
        <div className="post-hero-content">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href={withLocalePrefix("/", locale)}>{t("postDetail", "home", "Trang chủ")}</Link>
            <span className="separator">/</span>
            <Link href={withLocalePrefix("/tin-tuc", locale)}>{t("postDetail", "news", "Tin tức")}</Link>
            <span className="separator">/</span>
            <span className="current">{post.category}</span>
          </nav>

          <p className="eyebrow">{post.category}</p>
          <h1>{post.title}</h1>

          <div className="post-author-meta">
            <img src={post.author.avatar} alt={post.author.name} className="author-avatar" />
            <div className="author-info">
              <strong>{post.author.name}</strong>
              <span>{post.author.role}</span>
            </div>
            <div className="meta-divider" />
            <div className="post-time-meta">
              <span>{post.date}</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="post-detail-shell">
        <div className="post-detail-layout">
          <PostSidebar headings={headings} title={post.title} />

          <article className="article-body">
            <p className="article-lead-summary">{post.summary}</p>

            {post.blocks.map((block, index) => {
              switch (block.type) {
                case "paragraph":
                  return <p key={index}>{block.text}</p>;
                case "heading-2":
                  return (
                    <h2 key={index} id={slugify(block.text)}>
                      {block.text}
                    </h2>
                  );
                case "heading-3":
                  return <h3 key={index}>{block.text}</h3>;
                case "blockquote":
                  return (
                    <blockquote key={index}>
                      <p>{block.text}</p>
                      {block.author && <cite>{block.author}</cite>}
                    </blockquote>
                  );
                case "image":
                  return (
                    <figure key={index} className="article-figure">
                      <img src={block.url} alt={block.caption} />
                      <figcaption>{block.caption}</figcaption>
                    </figure>
                  );
                case "tip-box":
                  return (
                    <div key={index} className="article-tip-box">
                      <h4>{block.title}</h4>
                      <p>{block.text}</p>
                    </div>
                  );
                case "list":
                  return (
                    <ul key={index} className="article-list">
                      {block.items.map((item, itemIndex) => (
                        <li key={`${item}-${itemIndex}`}>{item}</li>
                      ))}
                    </ul>
                  );
                default:
                  return null;
              }
            })}

            {relatedPackage && (
              <div className="article-cta-package">
                <div className="cta-package-image" style={{ backgroundImage: `url(${relatedPackage.image})` }} />
                <div className="cta-package-content">
                  <span className="cta-badge">{t("postDetail", "package_badge", "Gợi ý hành trình")}</span>
                  <h3>{t("postDetail", "package_title_prefix", "Hành trình VietVista")}: {relatedPackage.name}</h3>
                  <p>{relatedPackage.summary}</p>
                  <div className="cta-package-details">
                    <span>{relatedPackage.duration}</span>
                    <span>{relatedPackage.price}</span>
                  </div>
                  <div className="cta-package-actions">
                    <Link href={withLocalePrefix("/goi-du-lich/" + relatedPackage.slug, locale)} className="cta-primary">
                      {t("postDetail", "view_package", "Xem chi tiết lịch trình")}
                    </Link>
                    <Link href={withLocalePrefix("/lien-he", locale)} className="cta-secondary">
                      {t("postDetail", "consult_group", "Nhận tư vấn nhóm")}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="related-posts-section">
        <div className="section-container">
          <div className="section-heading compact">
            <p className="eyebrow">{t("postDetail", "related_eyebrow", "Đọc tiếp cẩm nang")}</p>
            <h2>{t("postDetail", "related_title", "Bài viết liên quan bạn có thể thích")}</h2>
          </div>

          <div className="post-grid">
            {relatedPosts.map((relatedPost) => (
              <PostCard post={relatedPost} key={relatedPost.id} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

