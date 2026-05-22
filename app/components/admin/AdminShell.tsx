"use client";

import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import React from "react";
import { usePathname } from "next/navigation";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Tránh lỗi hydration bằng cách render nội dung rỗng trên server
    return null;
  }

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] text-[#17211d] antialiased">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#fcf9f2] text-[#17211d] antialiased flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-[#083b31] text-white shrink-0 border-r border-[#17211d]/10 sticky top-0 h-screen">
        <div className="px-6 py-5 flex items-center justify-between border-b border-white/10">
          <img src="/vietvista-logo.png" alt="VietVista" className="w-24 object-contain brightness-0 invert" />
          <span className="text-[9px] bg-emerald-700/80 text-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider">PORTAL</span>
        </div>
        <AdminSidebar />
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 h-screen flex flex-col overflow-hidden">
        <AdminTopbar />
        <main className="p-4 md:p-6 flex-1 overflow-y-auto">
          <div className="max-w-full w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

