"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

export default function PostsAdminPage() {
  const { posts, isAuthenticated, addPost, updatePost, removePost, postCategories } = useAdmin();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState("");

  // Set default category when categories load
  useEffect(() => {
    if (postCategories.length > 0 && !postCategory) {
      setPostCategory(postCategories[0].name);
    }
  }, [postCategories, postCategory]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // Filter logic
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tất cả" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) return;
    addPost({
      title: postTitle,
      category: postCategory || (postCategories[0]?.name ?? "Chưa phân loại"),
      status: "Bản nháp",
    });
    setPostTitle("");
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "Đã xuất bản" ? "Bản nháp" : "Đã xuất bản";
    updatePost(id, { status: nextStatus });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Quản lý bài viết</h2>
          <p className="text-xs text-slate-500 mt-1">Đăng tải, chỉnh sửa bài viết cẩm nang du lịch và tin tức lữ hành.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Add New Post */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm sticky top-24">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Tạo bài viết mới</h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Tiêu đề bài viết</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Nhập tiêu đề tin bài mới..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Khu vực / Chuyên mục</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                >
                  {postCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all"
              >
                Tạo bản nháp mới
              </button>
            </form>
          </div>
        </div>

        {/* Right side: Search, Filters & Table */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Controls Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Category Filter */}
            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
               {["Tất cả", ...postCategories.map(c => c.name)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-100"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs shrink-0">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tiêu đề bài viết..."
                className="w-full pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          {/* List Table Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Bài viết</th>
                    <th className="px-6 py-4">Chuyên mục</th>
                    <th className="px-6 py-4">Ngày đăng</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                        Không tìm thấy bài viết nào.
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <strong className="text-slate-800 font-bold block">{post.title}</strong>
                          <span className="text-xs text-slate-400 mt-0.5 block">ID: {post.id}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold">{post.category}</td>
                        <td className="px-6 py-4 text-slate-500">{post.date}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                              post.status === "Đã xuất bản"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(post.id, post.status)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold rounded-lg text-xs transition-colors"
                            >
                              Đổi trạng thái
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
                                  removePost(post.id);
                                }
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                              aria-label="Xóa"
                            >
                              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
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
