"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdmin } from "./AdminContext";

const notificationsSeed = [
  { id: 1, text: "Yêu cầu đặt tour mới cho gói Đà Nẵng", time: "5 phút trước" },
  { id: 2, text: "Bài viết mới 'Cẩm nang Hà Giang' được xuất bản", time: "1 giờ trước" },
];

export default function AdminTopbar() {
  const { logout } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  const [notifications] = useState(notificationsSeed);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getPageTitle = (path: string) => {
    if (path.startsWith("/admin/dashboard")) return "Tổng quan hệ thống";
    if (path.startsWith("/admin/control")) return "Bảng điều khiển";
    if (path.startsWith("/admin/posts/categories")) return "Danh mục bài viết";
    if (path.startsWith("/admin/posts")) return "Nội dung bài viết";
    if (path.startsWith("/admin/packages/categories")) return "Danh mục gói du lịch";
    if (path.startsWith("/admin/packages/offers")) return "Quản lý gói ưu đãi";
    if (path.startsWith("/admin/packages/services")) return "Chi tiết gói";
    if (/^\/admin\/packages\/\d+\/detail/.test(path)) return "Chi tiết gói";
    if (path.startsWith("/admin/packages")) return "Quản lý gói du lịch";
    if (path.startsWith("/admin/banners/homepage")) return "Banner trang chủ";
    if (path.startsWith("/admin/banners/subpages")) return "Banner trang con";
    if (path.startsWith("/admin/banners/details")) return "Banner trang chi tiết";
    if (path.startsWith("/admin/bookings/status")) return "Trạng thái xử lý";
    if (path.startsWith("/admin/bookings")) return "Quản lý đặt tour";
    if (path.startsWith("/admin/multilingual/languages")) return "Quản lý ngôn ngữ";
    if (path.startsWith("/admin/multilingual/translations")) return "Từ khóa & bản dịch";
    if (path.startsWith("/admin/interactions/reviews")) return "Đánh giá & phản hồi";
    if (path.startsWith("/admin/interactions/contacts")) return "Quản lý liên hệ";
    if (path.startsWith("/admin/interactions/customers")) return "Quản lý khách hàng";
    if (path.startsWith("/admin/system/media")) return "Thư viện media";
    if (path.startsWith("/admin/system/seo")) return "Quản lý SEO";
    if (path.startsWith("/admin/navigation")) return "Cấu hình Header & Footer";
    if (path.startsWith("/admin/settings")) return "Cài đặt hệ thống";
    return "Quản trị VietVista";
  };

  const getBreadcrumb = (path: string) => {
    const labels: Record<string, string> = {
      admin: "VietVista",
      posts: "Bài viết",
      packages: "Gói du lịch",
      banners: "Banner",
      bookings: "Đặt tour",
      multilingual: "Đa ngôn ngữ",
      interactions: "Tương tác khách hàng",
      system: "Hệ thống",
      categories: "Danh mục",
      offers: "Ưu đãi",
      services: "Chi tiết gói",
      detail: "Chi tiết",
      homepage: "Trang chủ",
      subpages: "Trang con",
      details: "Trang chi tiết",
      languages: "Ngôn ngữ",
      translations: "Bản dịch",
      reviews: "Đánh giá",
      contacts: "Liên hệ",
      customers: "Khách hàng",
      media: "Media",
      seo: "SEO",
      navigation: "Header & Footer",
      settings: "Cài đặt",
      dashboard: "Dashboard",
      control: "Control",
      status: "Trạng thái",
    };

    return path.split("/").filter(Boolean).map((part) => labels[part] || part.charAt(0).toUpperCase() + part.slice(1));
  };

  useEffect(() => {
    const handleCloseAll = () => {
      setShowProfileMenu(false);
      setShowNotifications(false);
    };
    window.addEventListener("click", handleCloseAll);
    return () => window.removeEventListener("click", handleCloseAll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  const toggleProfileMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfileMenu(!showProfileMenu);
    setShowNotifications(false);
  };

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[#17211d]/10 sticky top-0 z-30 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-[#17211d]/70 hover:text-[#17211d] p-1.5 rounded-lg hover:bg-[#17211d]/5" aria-label="Mở menu quản trị">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1 text-[10px] sm:text-[12px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                {getBreadcrumb(pathname).map((label, idx, arr) => (
                  <React.Fragment key={`${label}-${idx}`}>
                    <span>{label}</span>
                    {idx < arr.length - 1 && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2 h-2 text-slate-300"><polyline points="9 18 15 12 9 6" /></svg>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <span className="text-[12px] sm:text-xs md:text-sm font-bold text-slate-850 tracking-tight mt-1.5 leading-none">
                {getPageTitle(pathname)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-36 sm:w-56 md:w-60 lg:w-72 transition-all duration-300 group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              </span>
              <input
                placeholder="Tìm kiếm nhanh..."
                className="w-full pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 py-2 text-xs focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 focus:bg-white transition-all placeholder-slate-400 font-bold text-slate-700 shadow-sm shadow-slate-100/50"
              />
            </div>

            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-slate-50 transition-colors relative"
                aria-label="Xem thông báo"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
              </button>

              {showNotifications && (
                <div onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-800">Thông báo mới nhất</span>
                    <span className="text-xs text-emerald-600 font-semibold cursor-pointer hover:underline">Đánh dấu đã đọc</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50/50 last:border-0 cursor-pointer">
                        <p className="text-sm text-slate-700 leading-snug font-medium">{n.text}</p>
                        <span className="text-xs text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={toggleProfileMenu} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-colors select-none text-left cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-emerald-800 text-xs text-white flex items-center justify-center font-bold relative shrink-0">
                  AD
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border border-white rounded-full"></span>
                </div>
                <span className="text-sm font-bold text-slate-700 hidden md:inline">Admin</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showProfileMenu && (
                <div onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-4 py-2 border-b border-slate-50">
                    <p className="text-sm font-black text-slate-800">VietVista Admin</p>
                    <p className="text-xs text-slate-500 font-medium">Administrator</p>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { setShowProfileMenu(false); router.push("/admin/settings"); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-semibold transition-colors text-left">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-slate-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Hồ sơ cá nhân
                    </button>
                    <button onClick={() => { setShowProfileMenu(false); router.push("/admin/settings"); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-semibold transition-colors text-left">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-slate-400"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      Cài đặt hệ thống
                    </button>
                  </div>
                  <div className="border-t border-slate-100 my-1"></div>
                  <div className="py-0.5">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-bold transition-colors text-left cursor-pointer">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-rose-500"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}