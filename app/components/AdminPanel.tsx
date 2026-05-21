"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAdmin } from "./admin/AdminContext";

export function AdminPanel() {
  const { posts, packages, addPost, updatePost, removePost, addPackage, updatePackage, removePackage } = useAdmin();

  const [filterCategory, setFilterCategory] = useState<string>("All");

  const categories = useMemo(() => ["All", ...Array.from(new Set(posts.map((p) => p.category)))], [posts]);

  function handleAddPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const category = String(form.get("category") ?? "").trim();

    if (!title || !category) return;

    addPost({ title, category, status: String(form.get("status") ?? "Bản nháp") });
    event.currentTarget.reset();
  }

  function handleAddPackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const destination = String(form.get("destination") ?? "").trim();

    if (!name || !destination) return;

    addPackage({
      name,
      destination,
      duration: String(form.get("duration") ?? "3 ngày 2 đêm"),
      price: String(form.get("price") ?? "Liên hệ"),
      status: String(form.get("status") ?? "Đang mở"),
    });

    event.currentTarget.reset();
  }

  // Posts editing
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editStatus, setEditStatus] = useState("Bản nháp");

  function startEditPost(id: number) {
    const p = posts.find((x) => x.id === id);
    if (!p) return;
    setEditingPostId(id);
    setEditTitle(p.title);
    setEditCategory(p.category);
    setEditStatus(p.status ?? "Bản nháp");
  }

  function cancelEditPost() {
    setEditingPostId(null);
    setEditTitle("");
    setEditCategory("");
    setEditStatus("Bản nháp");
  }

  function saveEditPost(e: FormEvent) {
    e.preventDefault();
    if (!editingPostId) return;
    updatePost(editingPostId, { title: editTitle, category: editCategory, status: editStatus });
    cancelEditPost();
  }

  // Packages editing
  const [editingPackageId, setEditingPackageId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editPackageStatus, setEditPackageStatus] = useState("Đang mở");

  function startEditPackage(id: number) {
    const it = packages.find((x) => x.id === id);
    if (!it) return;
    setEditingPackageId(id);
    setEditName(it.name);
    setEditDestination(it.destination);
    setEditDuration(it.duration ?? "");
    setEditPrice(it.price ?? "");
    setEditPackageStatus(it.status ?? "Đang mở");
  }

  function cancelEditPackage() {
    setEditingPackageId(null);
    setEditName("");
    setEditDestination("");
    setEditDuration("");
    setEditPrice("");
    setEditPackageStatus("Đang mở");
  }

  function saveEditPackage(e: FormEvent) {
    e.preventDefault();
    if (!editingPackageId) return;
    updatePackage(editingPackageId, { name: editName, destination: editDestination, duration: editDuration, price: editPrice, status: editPackageStatus });
    cancelEditPackage();
  }

  const filteredPosts = filterCategory === "All" ? posts : posts.filter((p) => p.category === filterCategory);

  return (
    <section className="admin-layout">
      <div className="admin-sidebar">
        <p className="eyebrow">Bảng điều khiển</p>
        <h2>Quản trị nội dung</h2>
        <div className="admin-stat">
          <strong>{posts.length}</strong>
          <span>Bài viết</span>
        </div>
        <div className="admin-stat">
          <strong>{packages.length}</strong>
          <span>Gói du lịch</span>
        </div>
        <p>
          Dữ liệu trong bản demo được lưu trên trình duyệt bằng localStorage.
          Bạn có thể nối API và database sau khi chốt luồng quản trị.
        </p>
      </div>

      <div className="admin-workspace">
        <section className="admin-panel-card">
          <div className="admin-panel-heading">
            <h3>Thêm / Quản lý bài viết</h3>
            <span>Quản lý tin tức</span>
          </div>

          <form className="admin-form" onSubmit={handleAddPost}>
            <input name="title" placeholder="Tiêu đề bài viết" required />
            <input name="category" placeholder="Chuyên mục" required />
            <select name="status" defaultValue="Bản nháp">
              <option>Bản nháp</option>
              <option>Đã xuất bản</option>
            </select>
            <button type="submit">Thêm bài viết</button>
          </form>

          <div style={{ marginTop: 12, marginBottom: 8 }}>
            <label>
              Lọc theo chuyên mục: 
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <form onSubmit={saveEditPost}>
            <div className="admin-table" role="table" aria-label="Danh sách bài viết">
              {filteredPosts.map((post) => (
                <div className="admin-row" role="row" key={post.id}>
                  {editingPostId === post.id ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%" }}>
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                      <input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
                      <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                        <option>Bản nháp</option>
                        <option>Đã xuất bản</option>
                      </select>
                      <div>
                        <button type="submit">Lưu</button>
                        <button type="button" onClick={cancelEditPost}>
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <strong>{post.title}</strong>
                        <span>
                          {post.category} / {post.date}
                        </span>
                      </div>
                      <em>{post.status}</em>
                      <div>
                        <button type="button" onClick={() => startEditPost(post.id)}>
                          Sửa
                        </button>
                        <button type="button" onClick={() => removePost(post.id)}>
                          Xóa
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </form>
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-heading">
            <h3>Thêm / Quản lý gói du lịch</h3>
            <span>Quản lý sản phẩm</span>
          </div>

          <form className="admin-form product-form" onSubmit={handleAddPackage}>
            <input name="name" placeholder="Tên gói du lịch" required />
            <input name="destination" placeholder="Điểm đến" required />
            <input name="duration" placeholder="Thời lượng" />
            <input name="price" placeholder="Giá tham khảo" />
            <select name="status" defaultValue="Đang mở">
              <option>Đang mở</option>
              <option>Sắp hết chỗ</option>
              <option>Tạm dừng</option>
            </select>
            <button type="submit">Thêm gói</button>
          </form>

          <form onSubmit={saveEditPackage}>
            <div className="admin-table" role="table" aria-label="Danh sách gói du lịch">
              {packages.map((item) => (
                <div className="admin-row" role="row" key={item.id}>
                  {editingPackageId === item.id ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%" }}>
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                      <input value={editDestination} onChange={(e) => setEditDestination(e.target.value)} />
                      <input value={editDuration} onChange={(e) => setEditDuration(e.target.value)} />
                      <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                      <select value={editPackageStatus} onChange={(e) => setEditPackageStatus(e.target.value)}>
                        <option>Đang mở</option>
                        <option>Sắp hết chỗ</option>
                        <option>Tạm dừng</option>
                      </select>
                      <div>
                        <button type="submit">Lưu</button>
                        <button type="button" onClick={cancelEditPackage}>
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <strong>{item.name}</strong>
                        <span>
                          {item.destination} / {item.duration} / {item.price}
                        </span>
                      </div>
                      <em>{item.status}</em>
                      <div>
                        <button type="button" onClick={() => startEditPackage(item.id)}>
                          Sửa
                        </button>
                        <button type="button" onClick={() => removePackage(item.id)}>
                          Xóa
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </form>
        </section>
      </div>
    </section>
  );
}
