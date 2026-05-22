"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

export default function PostCategoriesPage() {
  const { postCategories, posts, isAuthenticated, addPostCategory, removePostCategory } = useAdmin();
  const router = useRouter();

  const [categoryName, setCategoryName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // Filter list
  const filteredCategories = postCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    
    // Check duplicate
    if (postCategories.some(c => c.name.toLowerCase() === categoryName.trim().toLowerCase())) {
      alert("Danh mục này đã tồn tại!");
      return;
    }

    addPostCategory(categoryName.trim());
    setCategoryName("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Quản lý Danh mục bài viết</h2>
        <p className="text-xs text-slate-500 mt-1">Phân loại các chủ đề tin tức, cẩm nang và hành trình du lịch.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Add Category */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm sticky top-24">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Thêm danh mục mới</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Tên danh mục</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ví dụ: Cẩm nang ẩm thực, Mẹo du lịch..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all"
              >
                Tạo danh mục mới
              </button>
            </form>
          </div>
        </div>

        {/* Right Table */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Search Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Danh mục hiện có ({postCategories.length})</h4>
            <div className="relative w-full max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm danh mục..."
                className="w-full pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Tên danh mục</th>
                  <th className="px-6 py-4">Đường dẫn tĩnh (Slug)</th>
                  <th className="px-6 py-4">Số lượng bài viết</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Không tìm thấy danh mục nào.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => {
                    const postCount = posts.filter(p => p.category === cat.name).length;
                    return (
                      <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{cat.name}</td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{cat.slug}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold">
                            {postCount} bài viết
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
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
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                            aria-label="Xóa"
                          >
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}
