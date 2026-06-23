"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const {
    posts,
    packages,
    isAuthenticated,
    addPost,
    updatePost,
    removePost,
    addPackage,
    updatePackage,
    removePackage,
  } = useAdmin();
  
  const router = useRouter();
  
  // State for tabs, modal, search, and loading
  const [activeTab, setActiveTab] = useState<"posts" | "packages">("posts");
  const [showModal, setShowModal] = useState<null | "post" | "package">(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Settings mock states cho thương hiệu
  const [siteName, setSiteName] = useState("VietVista - Du lịch Việt Nam");
  const [contactEmail, setContactEmail] = useState("support@vietvista.vn");
  const [contactPhone, setContactPhone] = useState("1900 1234");
  const [address, setAddress] = useState("123 Đường Lê Lợi, Hải Châu, Đà Nẵng");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Form States
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState("Vịnh Hạ Long");
  
  const [packageName, setPackageName] = useState("");
  const [packageDest, setPackageDest] = useState("");
  const [packagePrice, setPackagePrice] = useState("");
  const [packageDuration, setPackageDuration] = useState("3 ngày 2 đêm");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // Compute stats
  const totalPosts = posts.length;
  const totalPackages = packages.length;
  const published = posts.filter((p) => p.status === "Đã xuất bản").length;
  const drafts = totalPosts - published;

  // Filter lists based on search
  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPackages = packages.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleTogglePostStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "Đã xuất bản" ? "Bản nháp" : "Đã xuất bản";
    updatePost(id, { status: nextStatus });
  };

  const handleTogglePackageStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "Đang mở" ? "Tạm đóng" : "Đang mở";
    updatePackage(id, { status: nextStatus });
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) return;
    addPost({
      title: postTitle,
      category: postCategory,
      status: "Bản nháp",
    });
    setPostTitle("");
    setShowModal(null);
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName.trim() || !packageDest.trim()) return;
    addPackage({
      name: packageName,
      destination: packageDest,
      price: packagePrice || "Liên hệ",
      duration: packageDuration,
      status: "Đang mở",
    });
    setPackageName("");
    setPackageDest("");
    setPackagePrice("");
    setShowModal(null);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("Cập nhật thông tin website thành công!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Hero Banner */}
      <section className="bg-gradient-to-r from-emerald-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-950/10">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-800/20 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <span className="text-xs tracking-widest uppercase font-extrabold text-emerald-400 bg-emerald-900/50 px-2.5 py-1 rounded-full w-fit mb-3 block">
            Hệ thống VietVista
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">Thống kê tổng quan</h2>
          <p className="text-sm text-emerald-100/70 max-w-xl font-medium leading-relaxed">
            Chào mừng bạn quay lại hệ thống quản trị! Dưới đây là dữ liệu thống kê trực quan và các tác vụ nhanh để bạn bắt đầu quản lý.
          </p>
        </div>
      </section>

      {/* Grid: 4 Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Posts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Bài viết</span>
            <h3 className="text-3xl font-black text-slate-800">{totalPosts}</h3>
            <p className="text-xs text-slate-400 font-medium">Tổng số bài tin tức</p>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
        </div>

        {/* Published */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Đã xuất bản</span>
            <h3 className="text-3xl font-black text-emerald-600">{published}</h3>
            <p className="text-xs text-slate-400 font-medium">Đang hiển thị trên web</p>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
        </div>

        {/* Drafts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Bản nháp</span>
            <h3 className="text-3xl font-black text-amber-600">{drafts}</h3>
            <p className="text-xs text-slate-400 font-medium">Chờ kiểm duyệt lại</p>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
        </div>

        {/* Total Packages */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Gói du lịch</span>
            <h3 className="text-3xl font-black text-indigo-600">{totalPackages}</h3>
            <p className="text-xs text-slate-400 font-medium">Tổng số tour hiện có</p>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
        </div>

      </section>

      {/* Quick Actions Panel */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          
          <button
            onClick={() => setShowModal("post")}
            className="flex items-center gap-3.5 p-4 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all font-semibold text-sm text-left"
          >
            <div className="p-2.5 bg-white text-emerald-600 rounded-lg shadow-sm border border-slate-100">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <div>
              <p className="font-bold text-sm">Viết bài mới</p>
              <span className="text-xs text-slate-400 block mt-0.5 font-medium">Tạo thêm bài viết cẩm nang du lịch</span>
            </div>
          </button>

          <button
            onClick={() => setShowModal("package")}
            className="flex items-center gap-3.5 p-4 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all font-semibold text-sm text-left"
          >
            <div className="p-2.5 bg-white text-emerald-600 rounded-lg shadow-sm border border-slate-100">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <div>
              <p className="font-bold text-sm">Tạo gói du lịch</p>
              <span className="text-xs text-slate-400 block mt-0.5 font-medium">Đăng bán tour du lịch mới</span>
            </div>
          </button>

          <button
            onClick={() => router.push("/admin/settings")}
            className="flex items-center gap-3.5 p-4 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all font-semibold text-sm text-left sm:col-span-2 md:col-span-1"
          >
            <div className="p-2.5 bg-white text-emerald-600 rounded-lg shadow-sm border border-slate-100">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            </div>
            <div>
              <p className="font-bold text-sm">Cài đặt hệ thống</p>
              <span className="text-xs text-slate-400 block mt-0.5 font-medium">Cấu hình website & tài khoản</span>
            </div>
          </button>

        </div>
      </section>

      {/* Main Tabbed Management Center */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Header and Controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tab buttons */}
          <div className="flex gap-2 p-1 bg-slate-50 rounded-xl w-fit">
            <button
              onClick={() => { setActiveTab("posts"); setSearchQuery(""); }}
              className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "posts" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Quản lý Bài viết ({posts.length})
            </button>
            <button
              onClick={() => { setActiveTab("packages"); setSearchQuery(""); }}
              className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "packages" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Quản lý Tour ({packages.length})
            </button>
          </div>

          {/* Search bar inside the block */}
          <div className="relative max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Tìm kiếm trong danh sách...`}
              className="w-full pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
            />
          </div>
        </div>

        {/* Data Tables */}
        <div className="overflow-x-auto">
          {activeTab === "posts" ? (
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
                      Không tìm thấy bài viết nào phù hợp.
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
                            onClick={() => handleTogglePostStatus(post.id, post.status)}
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
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Gói tour du lịch</th>
                  <th className="px-6 py-4">Điểm đến</th>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4">Giá tiền</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                {filteredPackages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Không tìm thấy gói du lịch nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredPackages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <strong className="text-slate-800 font-bold block">{pkg.name}</strong>
                        <span className="text-xs text-slate-400 mt-0.5 block">ID: {pkg.id}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold">{pkg.destination}</td>
                      <td className="px-6 py-4 text-slate-500">{pkg.duration}</td>
                      <td className="px-6 py-4 text-emerald-800 font-black">{pkg.price}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                            pkg.status === "Đang mở"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {pkg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleTogglePackageStatus(pkg.id, pkg.status)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold rounded-lg text-xs transition-colors"
                          >
                            Đổi bán
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Bạn có chắc chắn muốn xóa gói du lịch này không?")) {
                                removePackage(pkg.id);
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
          )}
        </div>
      </section>

      {/* Thông tin thương hiệu VietVista */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Thông tin thương hiệu VietVista</h3>
          <p className="text-xs text-slate-400 mt-1">Thông tin hiển thị trên header, footer và các trang tin của khách hàng.</p>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl animate-in slide-in-from-top-2 duration-200">
            <p className="text-sm font-bold text-emerald-800">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSaveGeneral} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Tên Website (Site Title)</label>
            <input
              type="text"
              required
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Hotline liên hệ</label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Email hỗ trợ</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Địa chỉ văn phòng chính</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all cursor-pointer"
          >
            Lưu cấu hình chung
          </button>
        </form>
      </section>

      {/* Modern Pop-up Modal dialogs */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">
                {showModal === "post" ? "Thêm bài viết mới" : "Thêm gói du lịch mới"}
              </h3>
              <button
                onClick={() => setShowModal(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {showModal === "post" ? (
              <form onSubmit={handleCreatePost} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Tiêu đề bài viết</label>
                  <input
                    type="text"
                    required
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Ví dụ: Khám phá vịnh Hạ Long kỳ vĩ 2 ngày..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Chuyên mục / Địa điểm</label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                  >
                    <option value="Vịnh Hạ Long">Vịnh Hạ Long</option>
                    <option value="Đà Nẵng - Hội An">Đà Nẵng - Hội An</option>
                    <option value="Phú Quốc">Phú Quốc</option>
                    <option value="Hà Giang">Hà Giang</option>
                    <option value="Sapa">Sapa</option>
                    <option value="Nha Trang">Nha Trang</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(null)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all"
                  >
                    Đăng bản nháp
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreatePackage} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Tên gói du lịch</label>
                  <input
                    type="text"
                    required
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="Ví dụ: Tour Sapa 3 Ngày 2 Đêm Trọn Gói"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Điểm đến</label>
                    <input
                      type="text"
                      required
                      value={packageDest}
                      onChange={(e) => setPackageDest(e.target.value)}
                      placeholder="Ví dụ: Sapa, Lào Cai"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Thời gian</label>
                    <input
                      type="text"
                      required
                      value={packageDuration}
                      onChange={(e) => setPackageDuration(e.target.value)}
                      placeholder="Ví dụ: 3 ngày 2 đêm"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Giá tour</label>
                  <input
                    type="text"
                    value={packagePrice}
                    onChange={(e) => setPackagePrice(e.target.value)}
                    placeholder="Ví dụ: 3.290.000đ"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(null)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all"
                  >
                    Tạo gói tour
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

