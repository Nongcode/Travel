import Link from "next/link";
import { DestinationTabs } from "./components/DestinationTabs";
import { PackageCarousel } from "./components/PackageCarousel";
import { PostCard } from "./components/PostCard";
import { SiteHeader } from "./components/SiteHeader";
import {
  allPackages,
  destinations,
  packageCollections,
  posts,
  tripStyles,
} from "./data/travel";

export default function Home() {
  return (
    <main>
      <section className="hero-section">
        <SiteHeader variant="hero" />

        <div className="hero-content" id="top">
          <p className="eyebrow">Blog du lịch & hành trình chọn lọc</p>
          <h2>Những chuyến đi theo bạn như một kí ức đẹp không thể quên.</h2>
          <p className="hero-copy">
            Blog du lịch hiện đại dành cho người muốn tìm cảm hứng, 
            đọc kinh nghiệm thực tế và để lại thông tin khi cần gợi ý lịch trình phù hợp.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#travel-packages">
              Đọc bài mới
            </a>
            <Link className="secondary-action" href="/goi-du-lich">
              Xem gói du lịch
            </Link>
          </div>
          <form className="hero-search" id="trip-search" action="/goi-du-lich">
            <label>
              Điểm đến
              <input suppressHydrationWarning name="destination" placeholder="Bạn muốn đi đâu?" />
            </label>
            <label>
              Phong cách
              <select suppressHydrationWarning name="style" defaultValue="">
                <option value="">Chọn trải nghiệm</option>
                <option value="family">Gia đình</option>
                <option value="friends">Nhóm bạn</option>
                <option value="resort">Nghỉ dưỡng</option>
                <option value="photo">Chụp ảnh</option>
              </select>
            </label>
            <label>
              Thời gian
              <input suppressHydrationWarning name="date" type="month" />
            </label>
            <button type="submit">Tìm chuyến đi</button>
          </form>
        </div>
      </section>

      <section className="package-showcase" id="travel-packages">
        <div className="package-showcase-heading">
          <h2>Chọn hành trình theo người đi cùng bạn</h2>
          <Link href="/goi-du-lich">Xem tất cả gói du lịch</Link>
        </div>

        <div className="collection-stack">
          {packageCollections.map((collection) => (
            <section
              className={`package-collection ${collection.accent}`}
              key={collection.title}
            >
              <div className="collection-copy">
                <p className="eyebrow">{collection.eyebrow}</p>
                <h3>{collection.title}</h3>
                <p>{collection.description}</p>
                <Link href="/lien-he">Nhận tư vấn nhóm gói này</Link>
              </div>
              <PackageCarousel items={collection.items} />
            </section>
          ))}
        </div>
      </section>

      <section className="feature-band" id="destinations">
        <div className="feature-copy">
          <p className="slogan-kicker">VietVista journeys</p>
          <h2>
            Chọn điểm đến theo cảm xúc,
            <span>không chỉ theo địa danh.</span>
          </h2>
          <p>Vì đó là kỉ niệm mà bạn sẽ đem theo mãi bên mình.</p>
        </div>
        <DestinationTabs destinations={destinations} packages={allPackages} />
      </section>

      <section className="section-shell">
        <div className="section-heading compact">
          <p className="eyebrow">Trải nghiệm và Lợi ích của 1 chuyến đi đem lại</p>
        </div>
        <div className="style-grid">
          {tripStyles.map((item) => (
            <article key={item.title}>
              <div
                className="style-image"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="news-section" id="stories">
        <div className="news-heading">
          <div>
            <p className="eyebrow">Câu chuyện du lịch</p>
            <h2>Bài viết nổi bật</h2>
          </div>
          <p>
            Những bài viết được chọn để gợi ý lịch trình, mùa đi đẹp và trải
            nghiệm bản địa trước khi bạn để lại thông tin tư vấn.
          </p>
        </div>

        <div className="post-grid news-grid">
          {posts.slice(0, 3).map((post) => (
            <PostCard post={post} key={post.id} />
          ))}
        </div>
      </section>
    </main>
  );
}
