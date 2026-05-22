"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useAdmin } from "./AdminContext";

type SubMenuItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

type MenuItemGroupProps = {
  label: string;
  icon: React.ReactNode;
  activePattern: string; // prefix to match (e.g. "/admin/posts")
  items: SubMenuItem[];
};

const MenuItemSingle = ({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <li>
      <Link
        href={href}
        className={
          "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-250 group " +
          (active
            ? "bg-emerald-800 text-white font-bold shadow-md shadow-black/15 border-l-4 border-emerald-400 pl-3"
            : "text-emerald-100/80 hover:text-white hover:bg-white/5")
        }
      >
        <span className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-emerald-400' : 'text-emerald-200/60'}`}>{icon}</span>
        <span className="text-sm tracking-wide font-semibold">{label}</span>
      </Link>
    </li>
  );
};

const MenuItemGroup = ({
  label,
  icon,
  activePattern,
  items,
}: MenuItemGroupProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Auto-expand if active subpage is active
  useEffect(() => {
    if (pathname.startsWith(activePattern)) {
      setIsOpen(true);
    }
  }, [pathname, activePattern]);

  const hasActiveChild = items.some((item) => pathname === item.href);

  return (
    <li className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          "w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-250 group text-left " +
          (hasActiveChild
            ? "bg-emerald-950/30 text-white font-bold"
            : "text-emerald-100/80 hover:text-white hover:bg-white/5")
        }
      >
        <div className="flex items-center gap-3">
          <span className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${hasActiveChild ? 'text-emerald-400' : 'text-emerald-200/60'}`}>
            {icon}
          </span>
          <span className="text-sm tracking-wide font-semibold">{label}</span>
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <ul className="pl-6 pr-2 py-1 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 " +
                    (active
                      ? "text-emerald-300 bg-emerald-900/40 border-l-4 border-emerald-400 pl-4 shadow-sm shadow-black/10 scale-[1.02]"
                      : "text-emerald-200/60 hover:text-white hover:bg-white/10 hover:translate-x-1 pl-3")
                  }
                >
                  <span className={`w-4 h-4 shrink-0 transition-all duration-200 ${active ? 'text-emerald-400 scale-110' : 'text-emerald-200/40'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export default function AdminSidebar() {

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] justify-between p-4 bg-[#083b31]">
      <nav className="flex-1 overflow-y-auto pr-1">
        <ul className="space-y-1.5">
          <MenuItemSingle
            href="/admin/dashboard"
            label="Dashboard"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>}
          />
          <MenuItemSingle
            href="/admin/control"
            label="Control Panel"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>}
          />
          
          {/* Post Group */}
          <MenuItemGroup
            label="Bài viết"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>}
            activePattern="/admin/posts"
            items={[
              { 
                href: "/admin/posts/categories", 
                label: "Danh mục bài viết",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              },
              { 
                href: "/admin/posts", 
                label: "Nội dung bài viết",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              },
            ]}
          />

          {/* Package Group */}
          <MenuItemGroup
            label="Gói du lịch"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>}
            activePattern="/admin/packages"
            items={[
              { 
                href: "/admin/packages/categories", 
                label: "Danh mục gói",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              },
              { 
                href: "/admin/packages", 
                label: "Danh sách gói",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
              },
              { 
                href: "/admin/packages/offers", 
                label: "Gói ưu đãi",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="16" y1="2" x2="16" y2="4"/><line x1="8" y1="2" x2="8" y2="4"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              },
              { 
                href: "/admin/packages/services", 
                label: "Gói dịch vụ đi kèm",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              },
            ]}
          />

          {/* Banner Group */}
          <MenuItemGroup
            label="Quản lý Banner"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>}
            activePattern="/admin/banners"
            items={[
              { 
                href: "/admin/banners/homepage", 
                label: "Banner trang chủ",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              },
              { 
                href: "/admin/banners/subpages", 
                label: "Banner trang con",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              },
              { 
                href: "/admin/banners/details", 
                label: "Banner trang chi tiết",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              },
            ]}
          />

          {/* Booking Group */}
          <MenuItemGroup
            label="Quản lý Đặt tour"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M8 16h8" /><path d="M8 12h8" /></svg>}
            activePattern="/admin/bookings"
            items={[
              { 
                href: "/admin/bookings", 
                label: "Danh sách yêu cầu",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              },
              { 
                href: "/admin/bookings/status", 
                label: "Trạng thái xử lý",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
              },
            ]}
          />

          {/* Multilingual Group */}
          <MenuItemGroup
            label="Quản lý đa ngôn ngữ"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"/></svg>}
            activePattern="/admin/multilingual"
            items={[
              { 
                href: "/admin/multilingual/languages", 
                label: "Quản lý ngôn ngữ",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              },
              { 
                href: "/admin/multilingual/translations", 
                label: "Từ khóa & Bản dịch",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              },
            ]}
          />

          {/* Customer Interaction Group */}
          <MenuItemGroup
            label="Tương tác khách hàng"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
            activePattern="/admin/interactions"
            items={[
              { 
                href: "/admin/interactions/reviews", 
                label: "Đánh giá & Phản hồi",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              },
              { 
                href: "/admin/interactions/contacts", 
                label: "Quản lý liên hệ",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              },
              { 
                href: "/admin/interactions/customers", 
                label: "Quản lý khách hàng",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              },
            ]}
          />

          {/* System Group */}
          <MenuItemGroup
            label="Quản lý Hệ thống"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>}
            activePattern="/admin/system"
            items={[
              { 
                href: "/admin/system/media", 
                label: "Thư viện Media",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              },
              { 
                href: "/admin/system/seo", 
                label: "Quản lý SEO",
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              },
            ]}
          />

          <MenuItemSingle
            href="/admin/navigation"
            label="Header & Footer"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>}
          />

          <MenuItemSingle
            href="/admin/settings"
            label="Cài đặt"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>}
          />
        </ul>
      </nav>

      {/* Sidebar Footer branding */}
      <div className="mt-auto border-t border-white/10 pt-4 px-2 text-center">
        <p className="text-[11px] font-bold text-emerald-200/40 tracking-wider font-mono">
          VIETVISTA PORTAL v1.0
        </p>
      </div>
    </div>
  );
}
