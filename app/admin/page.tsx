import { AdminPanel } from "../components/AdminPanel";
import { SiteHeader } from "../components/SiteHeader";

export default function AdminPage() {
  return (
    <main>
      <SiteHeader />
      <section className="page-hero admin-hero">
        <p className="eyebrow">Admin</p>
        <h1>Quản lý bài viết và gói du lịch.</h1>
        <p>
          Khu vực demo cho biên tập viên tạo nhanh bài viết tin tức, theo dõi
          trạng thái xuất bản và quản lý các gói sản phẩm đang hiển thị trên
          website.
        </p>
      </section>
      <AdminPanel />
    </main>
  );
}
