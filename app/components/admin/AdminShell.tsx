"use client";

import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import React from "react";
import { usePathname } from "next/navigation";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] text-[#17211d] antialiased">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-[#17211d] antialiased flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-[#083b31] text-white shrink-0 border-r border-[#17211d]/10 md:sticky md:top-0 md:h-screen">
        <div className="px-6 py-5 flex items-center justify-between border-b border-white/10">
          <img src="/vietvista-logo.png" alt="VietVista" className="w-24 object-contain brightness-0 invert" />
          <span className="text-[9px] bg-emerald-700/80 text-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider">PORTAL</span>
        </div>
        <AdminSidebar />
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 min-h-screen flex flex-col overflow-x-hidden">
        <AdminTopbar />
        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

