"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

export default function BookingsStatusPage() {
  const { bookings, isAuthenticated } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // Pipeline count computation
  const pending = bookings.filter((b) => b.status === "Chờ xử lý").length;
  const processing = bookings.filter((b) => b.status === "Đang xử lý").length;
  const confirmed = bookings.filter((b) => b.status === "Đã xác nhận").length;
  const cancelled = bookings.filter((b) => b.status === "Đã hủy").length;
  const total = bookings.length;

  const totalSpentInt = bookings
    .filter((b) => b.status === "Đã xác nhận")
    .reduce((acc, curr) => {
      // Parse "11.800.000đ" to 11800000
      const numericVal = parseInt(curr.totalPrice.replace(/[^0-9]/g, "")) || 0;
      return acc + numericVal;
    }, 0);

  const formattedRevenue = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(totalSpentInt);

  // Mock timeline events
  const timelineEvents = [
    { id: 1, time: "Hôm nay, 14:15", title: "Khách hàng David Miller đăng ký mới", desc: "Tour: Hội An đi chậm - Chờ xử lý", badge: "Mới" },
    { id: 2, time: "Hôm nay, 10:30", title: "Cập nhật trạng thái Sarah Connor", desc: "Chuyển từ Chờ xử lý sang Đang xử lý - Liên hệ báo giá máy bay", badge: "Xử lý" },
    { id: 3, time: "Hôm qua, 16:45", title: "Xác nhận thành công Nguyen Van A", desc: "Đã thu cọc 30% qua chuyển khoản ngân hàng", badge: "Xác nhận" },
    { id: 4, time: "20/05/2026", title: "Hủy đặt tour của Yuki Tanaka", desc: "Lý do: Thay đổi lịch trình chuyến bay cá nhân", badge: "Hủy" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <section>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
          Trạng Thái Xử Lý Booking
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Báo cáo thống kê quy trình xử lý và tình trạng tài chính tạm tính từ các yêu cầu đặt tour.
        </p>
      </section>

      {/* Pipeline KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Chờ xử lý</span>
            <h3 className="text-3xl font-black text-amber-600 mt-1">{pending}</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Yêu cầu mới cần liên hệ</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Đang xử lý</span>
            <h3 className="text-3xl font-black text-blue-600 mt-1">{processing}</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Đang đàm phán lịch trình</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Đã xác nhận</span>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">{confirmed}</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Tour thành công thành khoản</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Đã hủy bỏ</span>
            <h3 className="text-3xl font-black text-rose-600 mt-1">{cancelled}</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Yêu cầu bị huỷ bỏ</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
        </div>
      </section>

      {/* Main Panel grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress & Financial summary */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Funnel chart card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">
              Biểu đồ Quy trình Chuyển đổi ({total} Booking)
            </h3>
            
            <div className="space-y-4">
              {/* Confirmed progress bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-700">Đã xác nhận ({confirmed})</span>
                  <span className="text-slate-500">{total ? Math.round((confirmed / total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${total ? (confirmed / total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Processing progress bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-blue-700">Đang tư vấn, báo giá ({processing})</span>
                  <span className="text-slate-500">{total ? Math.round((processing / total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${total ? (processing / total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Pending progress bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-amber-700">Mới, chờ tiếp nhận ({pending})</span>
                  <span className="text-slate-500">{total ? Math.round((pending / total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${total ? (pending / total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Cancelled progress bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-rose-700">Đã hủy bỏ ({cancelled})</span>
                  <span className="text-slate-500">{total ? Math.round((cancelled / total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${total ? (cancelled / total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Doanh thu xác nhận</p>
                <h4 className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{formattedRevenue}</h4>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tỷ lệ chuyển đổi thành công</p>
                <h4 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
                  {total ? Math.round(((confirmed) / total) * 100) : 0}%
                </h4>
              </div>
            </div>
          </div>
          
        </div>

        {/* Timeline updates */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-full">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">
              Lịch sử Hoạt động Gần đây
            </h3>
            
            <div className="flow-root">
              <ul className="-mb-8">
                {timelineEvents.map((event, eventIdx) => (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {eventIdx !== timelineEvents.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white text-[10px] font-black text-white ${
                            event.badge === "Mới" ? "bg-amber-500" :
                            event.badge === "Xử lý" ? "bg-blue-500" :
                            event.badge === "Xác nhận" ? "bg-emerald-500" : "bg-rose-500"
                          }`}>
                            {event.badge}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5">
                          <p className="text-xs text-slate-500 font-bold">{event.time}</p>
                          <p className="text-sm text-slate-800 font-bold mt-0.5">{event.title}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{event.desc}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
