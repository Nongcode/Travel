import Link from "next/link";
import { PostCard } from "../components/PostCard";
import { SiteHeader } from "../components/SiteHeader";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  // Lấy danh sách bài viết đã xuất bản từ database
  const dbPosts = await prisma.post.findMany({
    where: { status: "Đã xuất bản" },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  // Chuyển đổi dữ liệu sang định dạng hiển thị ở Front-end
  const posts = dbPosts.map((post) => ({
    id: post.id,
    category: post.category?.name || "Chưa phân loại",
    title: post.title,
    excerpt: post.excerpt || "",
    image: post.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    readTime: post.readTime || "5 phút đọc",
    date: post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString("vi-VN")
      : new Date(post.createdAt).toLocaleDateString("vi-VN"),
  }));

  const leadPost = posts[0] || {
    id: 0,
    category: "Cẩm nang",
    title: "Chưa có bài viết nào",
    excerpt: "Vui lòng đăng bài viết mới ở trang quản trị.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    readTime: "0 phút đọc",
    date: "",
  };

  return (
    <main>
      <SiteHeader variant="hero" />
      <section className="page-hero news-hero">
        <p className="eyebrow">Tin tức & cẩm nang</p>
        <h1>Góc đọc trước khi lên đường.</h1>
        <p>
          Tổng hợp bài viết về lịch trình, mùa du lịch, trải nghiệm địa phương
          và cách chọn gói phù hợp cho từng kiểu khách.
        </p>
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
          <Link href="/#consult">Cần tư vấn lịch trình này</Link>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading compact">
          <p className="eyebrow">Bài mới nhất</p>
          <h2>Tất cả bài viết</h2>
        </div>
        <div className="post-grid">
          {posts.map((post) => (
            <PostCard post={post} key={post.id} />
          ))}
        </div>
      </section>
    </main>
  );
}
