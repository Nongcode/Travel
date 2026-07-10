"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../../components/admin/AdminContext";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";

export default function PostCategoriesPage() {
  const { postCategories, posts, isAuthenticated, addPostCategory, updatePostCategory, removePostCategory } = useAdmin();
  const router = useRouter();

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal: Thêm danh mục
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addSlug, setAddSlug] = useState("");

  // Modal: Sửa danh mục
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // Lọc danh mục theo ô tìm kiếm
  const filteredCategories = postCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Phân trang
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset trang hiện tại khi thay đổi tìm kiếm
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Submit tạo mới
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;

    if (postCategories.some((c) => c.name.toLowerCase() === addName.trim().toLowerCase())) {
      alert("Danh m?c n?y ?? t?n t?i!");
      return;
    }

    addPostCategory(addName.trim(), addSlug.trim());
    setAddName("");
    setAddSlug("");
    setShowAddModal(false);
  };

  // Submit sửa
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || editingId === null) return;

    if (postCategories.some((c) => c.id !== editingId && c.name.toLowerCase() === editName.trim().toLowerCase())) {
      alert("Danh m?c kh?c ?? s? d?ng t?n n?y!");
      return;
    }

    updatePostCategory(editingId, editName.trim(), editSlug.trim());
    setEditingId(null);
    setEditName("");
    setEditSlug("");
    setShowEditModal(false);
  };

  const openEditModal = (id: number, name: string, slug: string) => {
    setEditingId(id);
    setEditName(name);
    setEditSlug(slug);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-[24px] font-bold text-slate-800 tracking-tight leading-7">Quản lý Danh mục bài viết</h2>
          <p className="text-xs text-slate-500 mt-1">Phân loại các chủ đề tin tức, cẩm nang và hành trình du lịch.</p>
        </div>
        <button
          onClick={() => {
            setAddName("");
            setShowAddModal(true);
          }}
          className="w-fit flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm danh mục mới
        </button>
      </div>

      {/* Control Tools */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
          Danh mục hiện có ({totalItems})
        </h4>
        <div className="relative w-full sm:max-w-xs shrink-0">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm danh mục..."
            className="w-full pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700"
          />
        </div>
      </div>

      {/* Main Full-width Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-xs uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Tên danh mục</th>
                <th className="px-6 py-4">Đường dẫn tĩnh (Slug)</th>
                <th className="px-6 py-4">Số lượng bài viết</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {currentCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy danh mục nào.
                  </td>
                </tr>
              ) : (
                currentCategories.map((cat) => {
                  const postCount = posts.filter((p) => p.category === cat.name).length;
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{cat.name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{cat.slug}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                          {postCount} bài viết
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(cat.id, cat.name, cat.slug)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                          title="Sửa danh mục"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            if (postCount > 0) {
                              alert("Không thể xóa danh mục này vì đang có bài viết thuộc danh mục này!");
                              return;
                            }
                            if (confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`)) {
                              removePostCategory(cat.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                          title="Xóa danh mục"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/75 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} trong tổng số {totalItems} danh mục
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors cursor-pointer"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentPage === page
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Thêm danh mục mới */}
      {showAddModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg tracking-tight">Thêm Danh Mục Mới</h3>
                <p className="text-xs text-emerald-200/80 mt-0.5">Tạo chuyên mục để phân loại bài viết.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-100 hover:text-white transition-all cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                  Tên danh mục
                </label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => {
                    setAddName(e.target.value);
                    setAddSlug(slugify(e.target.value));
                  }}
                  placeholder="Ví dụ: Cẩm nang ẩm thực, Mẹo du lịch..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                  Đường dẫn tĩnh (Slug)
                </label>
                <input
                  type="text"
                  required
                  value={addSlug}
                  onChange={(e) => setAddSlug(e.target.value)}
                  placeholder="Ví dụ: cam-nang-am-thuc, meo-du-lich..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all cursor-pointer"
                >
                  Tạo danh mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Chỉnh sửa danh mục */}
      {showEditModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg tracking-tight">Sửa Tên Danh Mục</h3>
                <p className="text-xs text-emerald-200/80 mt-0.5">Thay đổi tên chuyên mục hiện có.</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingId(null);
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-100 hover:text-white transition-all cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                  Tên danh mục mới
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    setEditSlug(slugify(e.target.value));
                  }}
                  placeholder="Nhập tên mới cho chuyên mục..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                  Đường dẫn tĩnh mới (Slug)
                </label>
                <input
                  type="text"
                  required
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  placeholder="Ví dụ: cam-nang-am-thuc, meo-du-lich..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingId(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
