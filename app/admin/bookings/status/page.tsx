"use client";

import { useEffect, useRef, useState } from "react";
import { useAdmin } from "../../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

// ─── Status Config ────────────────────────────────────────────────────────────
const BOOKING_STATUSES = [
  {
    value: "Đang xử lý",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    item: "text-blue-700 hover:bg-blue-50",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    value: "Đã xác nhận",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    item: "text-emerald-700 hover:bg-emerald-50",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    value: "Hoàn tất",
    dot: "bg-violet-500",
    badge: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    item: "text-violet-700 hover:bg-violet-50",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    value: "Đã hủy",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    item: "text-rose-700 hover:bg-rose-50",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
];

function getStatus(value: string) {
  return BOOKING_STATUSES.find((s) => s.value === value) ?? BOOKING_STATUSES[0];
}

// ─── Custom Status Dropdown ───────────────────────────────────────────────────
function StatusDropdown({
  value,
  bookingId,
  onSelect,
}: {
  value: string;
  bookingId: number;
  onSelect: (id: number, status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const current = getStatus(value);

  // Position the fixed panel relative to the trigger button
  const updatePos = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left });
  };

  const handleOpen = () => {
    updatePos();
    setOpen(true);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        btnRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      )
        return;
      setOpen(false);
    }
    function handleScroll() {
      updatePos();
    }
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [open]);

  return (
    <>
      {/* Trigger badge */}
      <button
        ref={btnRef}
        type="button"
        onClick={open ? () => setOpen(false) : handleOpen}
        className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none whitespace-nowrap ${current.badge} hover:shadow-md hover:scale-[1.03] active:scale-[0.98]`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />
        <span>{current.value}</span>
        <svg
          viewBox="0 0 24 24"
          className={`w-3 h-3 ml-0.5 opacity-60 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Fixed floating panel — rendered outside overflow containers */}
      {open && (
        <div
          ref={panelRef}
          role="listbox"
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[9999] w-52 rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-300/40 overflow-hidden"
        >

          {/* Options */}
          <div className="p-1.5 space-y-0.5">
            {BOOKING_STATUSES.map((s) => {
              const isActive = s.value === value;
              return (
                <button
                  key={s.value}
                  role="option"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => {
                    onSelect(bookingId, s.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all duration-150 ${isActive
                    ? `${s.badge}`
                    : `text-slate-600 ${s.item}`
                    }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                  <span className="flex-1">{s.value}</span>
                  {isActive && (
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 opacity-70 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}


// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BookingsStatusPage() {
  const { bookings, updateBooking, isAuthenticated } = useAdmin();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  // Notes Modal State
  const [viewingRequestId, setViewingRequestId] = useState<number | null>(null);
  const [editingAdminNotesId, setEditingAdminNotesId] = useState<number | null>(null);
  const [editingAdminNotesValue, setEditingAdminNotesValue] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleStatusSelect = (
    id: number,
    newStatus: string
  ) => {
    updateBooking(id, {
      status: newStatus as "Chờ xử lý" | "Đang xử lý" | "Đã xác nhận" | "Đã hủy"
    });
  };

  const handleSaveAdminNotes = () => {
    if (editingAdminNotesId !== null) {
      updateBooking(editingAdminNotesId, { adminNotes: editingAdminNotesValue });
      setEditingAdminNotesId(null);
    }
  };

  // Filter Bookings for the processing table (exclude "Chờ xử lý")
  const processingBookings = bookings.filter((b) => {
    if (b.status === "Chờ xử lý") return false;

    const matchesSearch =
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery) ||
      b.tourName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "Tất cả" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filterTabs = ["Tất cả", "Đang xử lý", "Đã xác nhận", "Hoàn tất", "Đã hủy"];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <section>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
          Trạng thái xử lý booking
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Quản lý và cập nhật trạng thái các yêu cầu đặt tour đang trong quá trình thực hiện.
        </p>
      </section>

      {/* Controls: Search and Filters */}
      <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status filters */}
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-slate-50 rounded-xl">
          {filterTabs.map((status) => {
            const cfg = BOOKING_STATUSES.find((s) => s.value === status);
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 ${isActive
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {cfg && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-opacity ${isActive ? cfg.dot : "bg-slate-300"}`}
                  />
                )}
                {status}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm booking đang xử lý..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-700"
          />
        </div>
      </section>

      {/* Bookings Table */}
      <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Tour du lịch</th>
                <th className="px-6 py-4">Ngày đặt / Ngày đi</th>
                <th className="px-6 py-4">Số khách</th>
                <th className="px-6 py-4">Giá tiền</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
              {processingBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy yêu cầu đặt tour nào đang xử lý.
                  </td>
                </tr>
              ) : (
                processingBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <strong className="text-slate-800 font-bold block">{b.customerName}</strong>
                      <span className="text-xs text-slate-400 font-medium block">{b.phone}</span>
                      <span className="text-xs text-slate-400 font-mono block">{b.email}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {b.tourName}
                      {b.notes && (
                        <button
                          onClick={() => {
                            setViewingRequestId(b.id);
                          }}
                          className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full transition-colors w-fit border border-amber-100"
                        >
                          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                          Xem yêu cầu: {b.notes.length > 20 ? `${b.notes.substring(0, 20)}...` : b.notes}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      <span className="block text-xs">Đặt: {b.bookingDate}</span>
                      <span className="block text-xs font-bold text-slate-700">Đi: {b.travelDate}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-600">{b.numberOfTravelers}</td>
                    <td className="px-6 py-4 text-emerald-800 font-black">{b.totalPrice}</td>
                    <td className="px-6 py-4">
                      <StatusDropdown
                        value={b.status}
                        bookingId={b.id}
                        onSelect={handleStatusSelect}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingAdminNotesId(b.id);
                            setEditingAdminNotesValue(b.adminNotes || "");
                          }}
                          className="px-2 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg text-xs font-bold border border-slate-100"
                        >
                          Ghi chú
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Viewing Customer Request Modal */}
      {viewingRequestId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">Yêu cầu từ khách hàng</h3>
              <button
                onClick={() => setViewingRequestId(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100/50 text-sm font-medium text-slate-700 whitespace-pre-wrap">
                {bookings.find(b => b.id === viewingRequestId)?.notes || "Không có yêu cầu đặc biệt."}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setViewingRequestId(null)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editing Admin Notes Dialog Modal */}
      {editingAdminNotesId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">Ghi chú nội bộ (Admin)</h3>
              <button
                onClick={() => setEditingAdminNotesId(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <textarea
                  rows={4}
                  value={editingAdminNotesValue}
                  onChange={(e) => setEditingAdminNotesValue(e.target.value)}
                  placeholder="Ghi chú các thông tin cần thiết để trao đổi giữa các admin..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all font-medium text-slate-700"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingAdminNotesId(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveAdminNotes}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition-all"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
