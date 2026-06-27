import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "../../components/SiteHeader";
import { ReadingProgressBar } from "../../components/PostProgress";
import { PostSidebar } from "../../components/PostSidebar";
import { PostCard } from "../../components/PostCard";
import { allPackages } from "../../data/travel";
import { ContentBlock } from "../../data/postsContent";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

// Generate static params for all posts to build static pages
export async function generateStaticParams() {
  const dbPosts = await prisma.post.findMany({
    where: { status: "Đã xuất bản" },
    select: { id: true },
  });
  return dbPosts.map((post) => ({
    id: String(post.id),
  }));
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PostDetailPageProps) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
  });

  if (!post || post.status !== "Đã xuất bản") {
    return {
      title: "Không tìm thấy bài viết | VietVista",
    };
  }

  return {
    title: `${post.title} | Cẩm nang VietVista`,
    description: post.seoDescription || post.summary || undefined,
  };
}

// Helper to convert Vietnamese heading text to a clean URL slug/anchor ID
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const dbPost = await prisma.post.findUnique({
    where: { id: Number(id) },
    include: {
      category: true,
      author: true,
      relatedPackage: true,
    },
  });

  if (!dbPost || dbPost.status !== "Đã xuất bản") {
    notFound();
  }

  const post = {
    id: dbPost.id,
    category: dbPost.category?.name || "Chưa phân loại",
    title: dbPost.title,
    date: dbPost.publishedAt
      ? new Date(dbPost.publishedAt).toLocaleDateString("vi-VN")
      : new Date(dbPost.createdAt).toLocaleDateString("vi-VN"),
    readTime: dbPost.readTime || "5 phút đọc",
    author: {
      name: dbPost.author?.name || "VietVista Editor",
      avatar: dbPost.author?.avatarUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80",
      role: dbPost.author?.role || "Travel Writer",
    },
    image: dbPost.imageUrl || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=85",
    summary: dbPost.summary || "",
    relatedPackageSlug: dbPost.relatedPackage?.slug || null,
    blocks: (dbPost.contentBlocks as unknown as ContentBlock[]) || [],
  };

  // Collect heading-2 blocks for the Table of Contents
  const headings = post.blocks
    .filter((b): b is Extract<ContentBlock, { type: "heading-2" }> => b.type === "heading-2")
    .map((b) => ({
      id: slugify(b.text),
      text: b.text,
    }));

  // Find the related package details if configured
  const relatedPackage = post.relatedPackageSlug
    ? allPackages.find((pkg) => pkg.slug === post.relatedPackageSlug)
    : null;

  // Filter 2 related posts from database
  const dbRelatedPosts = await prisma.post.findMany({
    where: {
      status: "Đã xuất bản",
      id: { not: post.id },
    },
    orderBy: { createdAt: "desc" },
    take: 2,
    include: { category: true },
  });

  const relatedPosts = dbRelatedPosts.map((p) => ({
    id: p.id,
    category: p.category?.name || "Chưa phân loại",
    title: p.title,
    excerpt: p.excerpt || "",
    image: p.imageUrl || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1000&q=80",
    readTime: p.readTime || "5 phút đọc",
    date: p.publishedAt
      ? new Date(p.publishedAt).toLocaleDateString("vi-VN")
      : new Date(p.createdAt).toLocaleDateString("vi-VN"),
  }));

  return (
    <main className="post-detail-page">
      {/* Scroll Progress Bar */}
      <ReadingProgressBar />
      
      <SiteHeader variant="hero" />

      {/* Hero Section */}
      <section
        className="page-hero post-hero"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(10, 20, 17, 0.6) 0%, rgba(10, 20, 17, 0.85) 100%), url(${post.image})`,
        }}
      >
        <div className="post-hero-content">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span className="separator">/</span>
            <Link href="/tin-tuc">Tin tức</Link>
            <span className="separator">/</span>
            <span className="current">{post.category}</span>
          </nav>
          
          <p className="eyebrow">{post.category}</p>
          <h1>{post.title}</h1>
          
          <div className="post-author-meta">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="author-avatar"
            />
            <div className="author-info">
              <strong>{post.author.name}</strong>
              <span>{post.author.role}</span>
            </div>
            <div className="meta-divider" />
            <div className="post-time-meta">
              <span>📅 {post.date}</span>
              <span>⏱️ {post.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout: Sidebar + Article */}
      <section className="post-detail-shell">
        <div className="post-detail-layout">
          
          {/* Sticky Sidebar with TOC and Share panel */}
          <PostSidebar headings={headings} title={post.title} />

          {/* Article content */}
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
                      <p>“{block.text}”</p>
                      {block.author && <cite>— {block.author}</cite>}
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
                      <h4>💡 {block.title}</h4>
                      <p>{block.text}</p>
                    </div>
                  );
                case "list":
                  return (
                    <ul key={index} className="article-list">
                      {block.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  );
                default:
                  return null;
              }
            })}

            {/* In-article Package Recommendation CTA */}
            {relatedPackage && (
              <div className="article-cta-package">
                <div
                  className="cta-package-image"
                  style={{ backgroundImage: `url(${relatedPackage.image})` }}
                />
                <div className="cta-package-content">
                  <span className="cta-badge">Gợi ý hành trình</span>
                  <h3>Hành trình VietVista: {relatedPackage.name}</h3>
                  <p>{relatedPackage.summary}</p>
                  <div className="cta-package-details">
                    <span>⏳ {relatedPackage.duration}</span>
                    <span>💰 {relatedPackage.price}</span>
                  </div>
                  <div className="cta-package-actions">
                    <Link href={`/goi-du-lich/${relatedPackage.slug}`} className="cta-primary">
                      Xem chi tiết lịch trình
                    </Link>
                    <Link href="/lien-he" className="cta-secondary">
                      Nhận tư vấn nhóm
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </article>
        </div>
      </section>

      {/* Related Posts Section */}
      <section className="related-posts-section">
        <div className="section-container">
          <div className="section-heading compact">
            <p className="eyebrow">Đọc tiếp cẩm nang</p>
            <h2>Bài viết liên quan bạn có thể thích</h2>
          </div>
          
          <div className="post-grid">
            {relatedPosts.map((rPost) => (
              <PostCard post={rPost} key={rPost.id} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
