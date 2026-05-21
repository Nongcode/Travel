"use client";

import React, { useState } from "react";
import { useAdmin } from "./AdminContext";
import { useRouter } from "next/navigation";

export default function AdminTopbar() {
  const { logout } = useAdmin();
  const router = useRouter();
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Yêu cầu đặt tour mới cho Gói Đà Nẵng", time: "5 phút trước" },
    { id: 2, text: "Bài viết mới 'Cẩm nang Hà Giang' được xuất bản", time: "1 giờ trước" },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[#17211d]/10 sticky top-0 z-30 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Mobile Toggle & Search */}
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden text-[#17211d]/70 hover:text-[#17211d] p-1.5 rounded-lg hover:bg-[#17211d]/5" aria-label="Open sidebar">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div className="relative max-w-md w-full hidden sm:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              </span>
              <input
                placeholder="Tìm kiếm bài viết, tour du lịch, cài đặt..."
                className="w-full pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Right Side: Notification, User Profile, and Logout */}
          <div className="flex items-center gap-3">
            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-slate-50 transition-colors relative"
                aria-label="Xem thông báo"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
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

            {/* User Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-7 h-7 rounded-full bg-emerald-800 text-xs text-white flex items-center justify-center font-bold">
                AD
              </div>
              <span className="text-sm font-bold text-slate-700 hidden md:inline">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

