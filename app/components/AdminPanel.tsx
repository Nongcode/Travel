"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { packages as seedPackages, posts as seedPosts } from "../data/travel";

type AdminPost = {
  id: number;
  title: string;
  category: string;
  date: string;
  status: string;
};

type AdminPackage = {
  id: number;
  name: string;
  destination: string;
  duration: string;
  price: string;
  status: string;
};

const postStorageKey = "vietvista-admin-posts";
const packageStorageKey = "vietvista-admin-packages";

export function AdminPanel() {
  const initialPosts = useMemo(
    () =>
      seedPosts.map(({ id, title, category, date, status }) => ({
        id,
        title,
        category,
        date,
        status,
      })),
    [],
  );
  const initialPackages = useMemo(
    () =>
      seedPackages.map(({ id, name, destination, duration, price, status }) => ({
        id,
        name,
        destination,
        duration,
        price,
        status,
      })),
    [],
  );

  const [posts, setPosts] = useState<AdminPost[]>(() => {
    if (typeof window === "undefined") {
      return initialPosts;
    }

    const savedPosts = window.localStorage.getItem(postStorageKey);
    return savedPosts ? (JSON.parse(savedPosts) as AdminPost[]) : initialPosts;
  });
  const [packages, setPackages] = useState<AdminPackage[]>(() => {
    if (typeof window === "undefined") {
      return initialPackages;
    }

    const savedPackages = window.localStorage.getItem(packageStorageKey);
    return savedPackages
      ? (JSON.parse(savedPackages) as AdminPackage[])
      : initialPackages;
  });

  useEffect(() => {
    window.localStorage.setItem(postStorageKey, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    window.localStorage.setItem(packageStorageKey, JSON.stringify(packages));
  }, [packages]);

  function addPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const category = String(form.get("category") ?? "").trim();

    if (!title || !category) {
      return;
    }

    setPosts((current) => [
      {
        id: Date.now(),
        title,
        category,
        date: new Date().toLocaleDateString("vi-VN"),
        status: String(form.get("status") ?? "Bản nháp"),
      },
      ...current,
    ]);
    event.currentTarget.reset();
  }

  function addPackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const destination = String(form.get("destination") ?? "").trim();

    if (!name || !destination) {
      return;
    }

    setPackages((current) => [
      {
        id: Date.now(),
        name,
        destination,
        duration: String(form.get("duration") ?? "3 ngày 2 đêm"),
        price: String(form.get("price") ?? "Liên hệ"),
        status: String(form.get("status") ?? "Đang mở"),
      },
      ...current,
    ]);
    event.currentTarget.reset();
  }

  function removePost(id: number) {
    setPosts((current) => current.filter((post) => post.id !== id));
  }

  function removePackage(id: number) {
    setPackages((current) => current.filter((item) => item.id !== id));
  }

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
            <h3>Thêm bài viết tin tức</h3>
            <span>Quản lý tin tức</span>
          </div>
          <form className="admin-form" onSubmit={addPost}>
            <input name="title" placeholder="Tiêu đề bài viết" required />
            <input name="category" placeholder="Chuyên mục" required />
            <select name="status" defaultValue="Bản nháp">
              <option>Bản nháp</option>
              <option>Đã xuất bản</option>
            </select>
            <button type="submit">Thêm bài viết</button>
          </form>
          <div className="admin-table" role="table" aria-label="Danh sách bài viết">
            {posts.map((post) => (
              <div className="admin-row" role="row" key={post.id}>
                <div>
                  <strong>{post.title}</strong>
                  <span>
                    {post.category} / {post.date}
                  </span>
                </div>
                <em>{post.status}</em>
                <button type="button" onClick={() => removePost(post.id)}>
                  Xóa
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-heading">
            <h3>Thêm gói sản phẩm du lịch</h3>
            <span>Quản lý sản phẩm</span>
          </div>
          <form className="admin-form product-form" onSubmit={addPackage}>
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
          <div className="admin-table" role="table" aria-label="Danh sách gói du lịch">
            {packages.map((item) => (
              <div className="admin-row" role="row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.destination} / {item.duration} / {item.price}
                  </span>
                </div>
                <em>{item.status}</em>
                <button type="button" onClick={() => removePackage(item.id)}>
                  Xóa
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
