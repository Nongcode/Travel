"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

export default function ReviewsAdminPage() {
  const { reviews, isAuthenticated, addReview, updateReview, removeReview } = useAdmin();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("Tất cả");

  // Form States
  const [customerName, setCustomerName] = useState("");
  const [packageName, setPackageName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [avatar, setAvatar] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !packageName.trim() || !comment.trim()) return;

    addReview({
      customerName,
      packageName,
      rating,
      comment,
      status: "Hiển thị",
      avatar: avatar.trim() || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    });

    // Reset Form
    setCustomerName("");
    setPackageName("");
    setRating(5);
    setComment("");
    setAvatar("");
    setShowAddForm(false);
  };

  const handleToggleStatus = (id: number, currentStatus: "Hiển thị" | "Ẩn") => {
    const nextStatus = currentStatus === "Hiển thị" ? "Ẩn" : "Hiển thị";
    updateReview(id, { status: nextStatus });
  };

  // Filter Reviews
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating =
      ratingFilter === "Tất cả" || r.rating === parseInt(ratingFilter);

    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Quản lý Đánh giá & Phản hồi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Duyệt và điều hành ý kiến phản hồi (Social Proof) từ khách du lịch nước ngoài hiển thị trên website.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all self-start sm:self-center"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {showAddForm ? "Ẩn Form thêm" : "Thêm đánh giá thủ công"}
        </button>
      </section>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-in slide-in-from-top-4 duration-200">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
            Thêm Phản Hồi Mới
          </h3>
          <form onSubmit={handleCreateReview} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Tên khách hàng</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ví dụ: Emily Watson"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Gói tour đánh giá</label>
              <input
                type="text"
                required
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="Ví dụ: Hội An đi chậm"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Đánh giá sao</label>
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 sao)</option>
                <option value={4}>⭐⭐⭐⭐ (4 sao)</option>
                <option value={3}>⭐⭐⭐ (3 sao)</option>
                <option value={2}>⭐⭐ (2 sao)</option>
                <option value={1}>⭐ (1 sao)</option>
              </select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Nội dung bình luận</label>
              <textarea
                required
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Nhập ý kiến đánh giá chi tiết của khách hàng..."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Link ảnh đại diện (Tùy chọn)</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition-all"
              >
                Thêm đánh giá
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controls */}
      <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Rating filter */}
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-slate-50 rounded-xl">
          {["Tất cả", "5", "4", "3", "2", "1"].map((stars) => (
            <button
              key={stars}
              onClick={() => setRatingFilter(stars)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                ratingFilter === stars
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {stars === "Tất cả" ? "Tất cả" : `${stars} ★`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm khách hàng, tour, nội dung..."
            className="w-full pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700"
          />
        </div>
      </section>

      {/* Grid of Reviews */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 font-medium">
            Không tìm thấy đánh giá nào phù hợp bộ lọc.
          </div>
        ) : (
          filteredReviews.map((r) => (
            <div
              key={r.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                r.status === "Ẩn" ? "border-slate-200 bg-slate-50/50 opacity-75" : "border-slate-100"
              }`}
            >
              <div className="space-y-3">
                {/* Review Header (Customer & Rating) */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={r.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                      alt={r.customerName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-100"
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-snug">{r.customerName}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">{r.date}</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-0.5 text-xs text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100/50">
                    {r.rating} ★
                  </span>
                </div>

                {/* Tour Package Tag */}
                <div className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-extrabold rounded-lg uppercase tracking-wider border border-emerald-100/30">
                  {r.packageName}
                </div>

                {/* Comment */}
                <p className="text-slate-600 text-xs leading-relaxed italic">
                  "{r.comment}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                    r.status === "Hiển thị"
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-slate-500 bg-slate-100"
                  }`}
                >
                  Trạng thái: {r.status}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleStatus(r.id, r.status)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                      r.status === "Hiển thị"
                        ? "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200/50"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
                    }`}
                  >
                    {r.status === "Hiển thị" ? "Ẩn" : "Phê duyệt"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Xóa phản hồi này vĩnh viễn?")) {
                        removeReview(r.id);
                      }
                    }}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-100/50"
                    aria-label="Xóa"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
