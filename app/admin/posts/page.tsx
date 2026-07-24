"use client";

import { useEffect, useState } from "react";
import { useAdmin, AdminPost } from "../../components/admin/AdminContext";
import { useRouter } from "next/navigation";
import AdminAssetUploadField from "../../components/admin/AdminAssetUploadField";

export default function PostsAdminPage() {
  const { posts, isAuthenticated, addPost, updatePost, removePost, postCategories } = useAdmin();
  const router = useRouter();

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal: Thêm bài viết mới
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addCategory, setAddCategory] = useState("");
  const [addStatus, setAddStatus] = useState("Bản nháp");
  const [addImageUrl, setAddImageUrl] = useState("");
  const [addContentImageUrl, setAddContentImageUrl] = useState("");
  const [addExcerpt, setAddExcerpt] = useState("");
  const [addReadTime, setAddReadTime] = useState("");
  const [addSeoDescription, setAddSeoDescription] = useState("");
  const [addSummary, setAddSummary] = useState("");

  // Modal: Sửa bài viết
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editStatus, setEditStatus] = useState("Bản nháp");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editContentImageUrl, setEditContentImageUrl] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editReadTime, setEditReadTime] = useState("");
  const [editSeoDescription, setEditSeoDescription] = useState("");
  const [editSummary, setEditSummary] = useState("");

  // Modal: Xem chi tiết bài viết
  const [viewingPost, setViewingPost] = useState<AdminPost | null>(null);

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "Đã xuất bản" ? "Bản nháp" : "Đã xuất bản";
    updatePost(id, { status: nextStatus });
  };

  // Set default category when categories load
  useEffect(() => {
    if (postCategories.length > 0 && !addCategory) {
      setAddCategory(postCategories[0].name);
    }
  }, [postCategories, addCategory]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // Lọc bài viết
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tất cả" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Phân trang
  const totalItems = filteredPosts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  // Submit Thêm bài viết mới
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTitle.trim()) return;

    addPost({
      title: addTitle.trim(),
      category: addCategory || (postCategories[0]?.name ?? "Chưa phân loại"),
      status: addStatus,
      imageUrl: addImageUrl.trim(),
      contentImageUrl: addContentImageUrl.trim(),
      excerpt: addExcerpt.trim(),
      readTime: addReadTime.trim(),
      seoDescription: addSeoDescription.trim(),
      summary: addSummary.trim(),
    });

    // Reset values
    setAddTitle("");
    setAddCategory(postCategories[0]?.name ?? "Chưa phân loại");
    setAddStatus("Bản nháp");
    setAddImageUrl("");
    setAddContentImageUrl("");
    setAddExcerpt("");
    setAddReadTime("");
    setAddSeoDescription("");
    setAddSummary("");
    setShowAddModal(false);
  };

  // Submit Sửa bài viết
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null || !editTitle.trim()) return;

    updatePost(editingId, {
      title: editTitle.trim(),
      category: editCategory,
      status: editStatus,
      imageUrl: editImageUrl.trim(),
      contentImageUrl: editContentImageUrl.trim(),
      excerpt: editExcerpt.trim(),
      readTime: editReadTime.trim(),
      seoDescription: editSeoDescription.trim(),
      summary: editSummary.trim(),
    });

    setEditingId(null);
    setShowEditModal(false);
  };

  const openEditModal = (post: AdminPost) => {
    setEditingId(post.id);
    setEditTitle(post.title);
    setEditCategory(post.category);
    setEditStatus(post.status);
    setEditImageUrl(post.imageUrl || "");
    setEditContentImageUrl(post.contentImageUrl || "");
    setEditExcerpt(post.excerpt || "");
    setEditReadTime(post.readTime || "");
    setEditSeoDescription(post.seoDescription || "");
    setEditSummary(post.summary || "");
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-[24px] font-bold text-slate-800 tracking-tight leading-7">Quản lý bài viết</h2>
          <p className="text-xs text-slate-500 mt-1">Đăng tải, chỉnh sửa bài viết cẩm nang du lịch và tin tức lữ hành.</p>
        </div>
        <button
          onClick={() => {
            setAddTitle("");
            setAddCategory(postCategories[0]?.name ?? "Chưa phân loại");
            setAddStatus("Bản nháp");
            setAddImageUrl("");
            setAddContentImageUrl("");
            setAddExcerpt("");
            setAddReadTime("");
            setAddSeoDescription("");
            setAddSummary("");
            setShowAddModal(true);
          }}
          className="w-fit flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm bài viết mới
        </button>
      </div>

      {/* Control Tools */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Category Filters */}
        <div className="flex gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
          {["Tất cả", ...postCategories.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
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
        <div className="relative w-full lg:max-w-xs shrink-0">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm tiêu đề hoặc chuyên mục..."
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
                <th className="px-6 py-4">Bài viết</th>
                <th className="px-6 py-4">Chuyên mục</th>
                <th className="px-6 py-4">Thời gian đọc</th>
                <th className="px-6 py-4">Ngày đăng</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {currentPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy bài viết nào.
                  </td>
                </tr>
              ) : (
                currentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            onClick={() => setViewingPost(post)}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div 
                            onClick={() => setViewingPost(post)}
                            className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-400 cursor-pointer hover:bg-slate-200 transition-colors"
                          >
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                        )}
                        <div 
                          onClick={() => setViewingPost(post)}
                          className="cursor-pointer group/title"
                          title="Click để xem chi tiết bài viết"
                        >
                          <strong className="text-slate-800 font-bold block line-clamp-1 group-hover/title:text-emerald-700 group-hover/title:underline transition-all">{post.title}</strong>
                          <span className="text-xs text-slate-400 mt-0.5 block line-clamp-1">
                            {post.excerpt || "Chưa có mô tả ngắn"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">{post.category}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{post.readTime || "Chưa thiết lập"}</td>
                    <td className="px-6 py-4 text-slate-500">{post.date}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(post.id, post.status)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all hover:scale-105 cursor-pointer ${
                          post.status === "Đã xuất bản"
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                        }`}
                        title="Click để đổi trạng thái"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1"></span>
                        {post.status}
                        <svg viewBox="0 0 24 24" className="w-3 h-3 ml-0.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M17 1l4 4-4 4" />
                          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                          <path d="M7 23l-4-4 4-4" />
                          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(post)}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                        title="Sửa bài viết"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa bài viết "${post.title}"?`)) {
                            removePost(post.id);
                          }
                        }}
                        className="p-1.5 hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                        title="Xóa bài viết"
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/75 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} trong tổng số {totalItems} bài viết
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

      {/* Modal: Thêm bài viết mới */}
      {showAddModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-3xl bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-black text-lg tracking-tight">Thêm Bài Viết Mới</h3>
                <p className="text-xs text-emerald-200/80 mt-0.5">Soạn thảo và đăng tải nội dung cẩm nang du lịch.</p>
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

            {/* Modal Body */}
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Tiêu đề bài viết <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    placeholder="Ví dụ: 10 địa điểm không thể bỏ qua tại Đà Nẵng..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                  />
                </div>

                {/* Category Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Chuyên mục
                  </label>
                  <select
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                  >
                    {postCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Trạng thái xuất bản
                  </label>
                  <select
                    value={addStatus}
                    onChange={(e) => setAddStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                  >
                    <option value="Bản nháp">Bản nháp</option>
                    <option value="Đã xuất bản">Đã xuất bản</option>
                  </select>
                </div>

                {/* Cover Image URL */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Đường dẫn Ảnh đại diện (URL)
                  </label>
                  <AdminAssetUploadField value={addImageUrl} onChange={setAddImageUrl} placeholder="URL hinh anh hoac upload len Cloudinary" inputClassName="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold" previewAlt={addTitle || "Post image"} />
                  {addImageUrl && addImageUrl.startsWith("http") && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-100 max-h-32 w-fit">
                      <img src={addImageUrl} alt="Preview" className="max-h-32 object-cover" />
                    </div>
                  )}
                </div>

                {/* Read Time */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Thời gian đọc (Ví dụ: "5 phút", "10 phút")
                  </label>
                  <input
                    type="text"
                    value={addReadTime}
                    onChange={(e) => setAddReadTime(e.target.value)}
                    placeholder="5 phút"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                  />
                </div>

                {/* Excerpt */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Tóm tắt ngắn (Excerpt)
                  </label>
                  <textarea
                    rows={2}
                    value={addExcerpt}
                    onChange={(e) => setAddExcerpt(e.target.value)}
                    placeholder="Mô tả tóm tắt nội dung bài viết hiển thị tại các trang danh sách..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold resize-y"
                  />
                </div>

                {/* SEO Description */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Mô tả SEO (Meta Description)
                  </label>
                  <textarea
                    rows={2}
                    value={addSeoDescription}
                    onChange={(e) => setAddSeoDescription(e.target.value)}
                    placeholder="Mô tả phục vụ tối ưu hóa tìm kiếm Google (SEO)..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold resize-y"
                  />
                </div>

                {/* Summary / Content */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Nội dung chi tiết bài viết (Summary)
                  </label>
                  <textarea
                    rows={6}
                    value={addSummary}
                    onChange={(e) => setAddSummary(e.target.value)}
                    placeholder="Nhập nội dung chi tiết dạng văn bản tại đây..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold resize-y"
                  />
                </div>

                {/* Content Image URL (Ảnh minh họa trong bài viết) */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Đường dẫn ảnh trong bài viết (URL)
                  </label>
                  <AdminAssetUploadField value={addContentImageUrl} onChange={setAddContentImageUrl} placeholder="URL hinh anh hoac upload len Cloudinary" inputClassName="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold" previewAlt={addTitle || "Content image"} />
                  {addContentImageUrl && addContentImageUrl.startsWith("http") && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-100 max-h-32 w-fit">
                      <img src={addContentImageUrl} alt="Content Preview" className="max-h-32 object-cover" />
                    </div>
                  )}
                </div>

              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white z-10">
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
                  Tạo bài viết
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Chỉnh sửa bài viết */}
      {showEditModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-3xl bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-black text-lg tracking-tight">Chỉnh Sửa Bài Viết</h3>
                <p className="text-xs text-emerald-200/80 mt-0.5">Thay đổi thông tin và nội dung bài viết hiện có.</p>
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

            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Tiêu đề bài viết <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Ví dụ: 10 địa điểm không thể bỏ qua tại Đà Nẵng..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                  />
                </div>

                {/* Category Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Chuyên mục
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                  >
                    {postCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Trạng thái xuất bản
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                  >
                    <option value="Bản nháp">Bản nháp</option>
                    <option value="Đã xuất bản">Đã xuất bản</option>
                  </select>
                </div>

                {/* Cover Image URL */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Đường dẫn Ảnh đại diện (URL)
                  </label>
                  <AdminAssetUploadField value={editImageUrl} onChange={setEditImageUrl} placeholder="URL hinh anh hoac upload len Cloudinary" inputClassName="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold" previewAlt={editTitle || "Post image"} />
                  {editImageUrl && editImageUrl.startsWith("http") && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-100 max-h-32 w-fit">
                      <img src={editImageUrl} alt="Preview" className="max-h-32 object-cover" />
                    </div>
                  )}
                </div>

                {/* Read Time */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Thời gian đọc (Ví dụ: "5 phút", "10 phút")
                  </label>
                  <input
                    type="text"
                    value={editReadTime}
                    onChange={(e) => setEditReadTime(e.target.value)}
                    placeholder="5 phút"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                  />
                </div>

                {/* Excerpt */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Tóm tắt ngắn (Excerpt)
                  </label>
                  <textarea
                    rows={2}
                    value={editExcerpt}
                    onChange={(e) => setEditExcerpt(e.target.value)}
                    placeholder="Mô tả tóm tắt nội dung bài viết hiển thị tại các trang danh sách..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold resize-y"
                  />
                </div>

                {/* SEO Description */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Mô tả SEO (Meta Description)
                  </label>
                  <textarea
                    rows={2}
                    value={editSeoDescription}
                    onChange={(e) => setEditSeoDescription(e.target.value)}
                    placeholder="Mô tả phục vụ tối ưu hóa tìm kiếm Google (SEO)..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold resize-y"
                  />
                </div>

                {/* Summary / Content */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Nội dung chi tiết bài viết (Summary)
                  </label>
                  <textarea
                    rows={6}
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    placeholder="Nhập nội dung chi tiết dạng văn bản tại đây..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold resize-y"
                  />
                </div>

                {/* Content Image URL (Ảnh minh họa trong bài viết) */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Đường dẫn ảnh trong bài viết (URL)
                  </label>
                  <AdminAssetUploadField value={editContentImageUrl} onChange={setEditContentImageUrl} placeholder="URL hinh anh hoac upload len Cloudinary" inputClassName="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold" previewAlt={editTitle || "Content image"} />
                  {editContentImageUrl && editContentImageUrl.startsWith("http") && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-100 max-h-32 w-fit">
                      <img src={editContentImageUrl} alt="Content Preview" className="max-h-32 object-cover" />
                    </div>
                  )}
                </div>

              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white z-10">
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

      {/* Modal: Xem chi tiết bài viết */}
      {viewingPost && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-3xl bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-800 to-slate-900 text-white flex justify-between items-center shrink-0">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 px-2.5 py-0.5 bg-emerald-950 rounded-full">
                  {viewingPost.category}
                </span>
                <h3 className="font-black text-lg tracking-tight mt-2">{viewingPost.title}</h3>
              </div>
              <button
                onClick={() => setViewingPost(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer shrink-0 ml-4"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-1">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <span>Thời gian đọc: {viewingPost.readTime || "Chưa xác định"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  <span>Ngày tạo: {viewingPost.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                    viewingPost.status === "Đã xuất bản" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
                  }`}>
                    {viewingPost.status}
                  </span>
                </div>
              </div>

              {/* Cover Image */}
              {viewingPost.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-100 max-h-[300px]">
                  <img src={viewingPost.imageUrl} alt={viewingPost.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Excerpt */}
              {viewingPost.excerpt && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2">Tóm tắt ngắn</h4>
                  <p className="text-sm font-semibold text-slate-700 leading-relaxed italic">"{viewingPost.excerpt}"</p>
                </div>
              )}

              {/* SEO Description */}
              {viewingPost.seoDescription && (
                <div className="border border-slate-100 rounded-2xl p-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2">Mô tả SEO (Meta Description)</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{viewingPost.seoDescription}</p>
                </div>
              )}

              {/* Detailed Content */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Nội dung chi tiết</h4>
                <div className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line bg-slate-50/20 p-4 border border-dashed border-slate-200 rounded-2xl">
                  {viewingPost.summary || "Bài viết chưa có nội dung chi tiết."}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setViewingPost(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
