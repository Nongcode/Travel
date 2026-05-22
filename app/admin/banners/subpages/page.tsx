"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

export default function SubpagesBannersPage() {
  const { banners, isAuthenticated, addBanner, updateBanner, removeBanner } = useAdmin();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBanner, setEditingBanner] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // Filter subpages banners
  const subpageBanners = banners.filter((b) => b.type === "subpage");
  const filteredBanners = subpageBanners.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image.trim()) return;

    const bannerData = {
      type: "subpage" as const,
      title: title.trim(),
      subtitle: subtitle.trim(),
      image: image.trim(),
      link: link.trim() || "#",
      status: "Đang mở",
    };

    if (editingBanner) {
      updateBanner(editingBanner.id, {
        ...bannerData,
        status: editingBanner.status,
      });
      setEditingBanner(null);
    } else {
      addBanner(bannerData);
    }

    setTitle("");
    setSubtitle("");
    setImage("");
    setLink("");
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "Đang mở" ? "Tạm đóng" : "Đang mở";
    updateBanner(id, { status: nextStatus });
  };

  const startEdit = (b: any) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setImage(b.image);
    setLink(b.link);
  };

  const cancelEdit = () => {
    setEditingBanner(null);
    setTitle("");
    setSubtitle("");
    setImage("");
    setLink("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
          Quản lý Banner Trang con
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Thiết lập các banner kích thước trung bình hiển thị ở đầu các trang danh mục như Tin tức, Gói du lịch, Liên hệ... Kích thước khuyến nghị: 1920x400px.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm sticky top-24">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
              {editingBanner ? "Cập nhật Banner" : "Thêm Banner Trang con"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                  Tiêu đề Banner (Title)
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Cẩm nang du lịch Việt Nam..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                  Mô tả phụ (Subtitle)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ví dụ: Bí kíp từ các chuyên gia bản địa..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                  Đường dẫn ảnh (Image URL)
                </label>
                <input
                  type="text"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Ví dụ: /news-banner.jpg hoặc link online..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono text-slate-600 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                  Đường dẫn liên kết (Link)
                </label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Ví dụ: /tin-tuc..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono text-slate-600 text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all"
                >
                  {editingBanner ? "Lưu thay đổi" : "Thêm Banner"}
                </button>
                {editingBanner && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Table */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Danh sách Banner ({subpageBanners.length})
            </h4>
            <div className="relative w-full max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tiêu đề..."
                className="w-full pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Hình ảnh</th>
                    <th className="px-6 py-4">Thông tin Banner</th>
                    <th className="px-6 py-4">Liên kết</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                  {filteredBanners.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-slate-400 font-medium"
                      >
                        Không tìm thấy banner trang con nào.
                      </td>
                    </tr>
                  ) : (
                    filteredBanners.map((b) => (
                      <tr
                        key={b.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 w-28">
                          <div className="w-20 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative shadow-sm">
                            <img
                              src={b.image}
                              alt={b.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=300&auto=format&fit=crop";
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-[240px]">
                          <h5 className="font-bold text-slate-800 truncate">
                            {b.title}
                          </h5>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {b.subtitle || "—"}
                          </p>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500 truncate max-w-[120px]">
                          {b.link}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(b.id, b.status)}
                            className={
                              "px-2.5 py-1 rounded-full text-xs font-bold transition-all " +
                              (b.status === "Đang mở"
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-rose-50 text-rose-600 hover:bg-rose-100")
                            }
                          >
                            {b.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => startEdit(b)}
                              className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg transition-colors"
                              aria-label="Sửa"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Bạn có chắc chắn muốn xóa banner "${b.title}"?`
                                  )
                                ) {
                                  removeBanner(b.id);
                                }
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                              aria-label="Xóa"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
