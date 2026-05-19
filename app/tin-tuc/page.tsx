import Link from "next/link";
import { PostCard } from "../components/PostCard";
import { SiteHeader } from "../components/SiteHeader";
import { posts } from "../data/travel";

export default function NewsPage() {
  const leadPost = posts[0];

  return (
    <main>
      <SiteHeader />
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
