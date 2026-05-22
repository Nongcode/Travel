"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

export default function BookingsAdminPage() {
  const { bookings, isAuthenticated, addBooking, updateBooking, removeBooking } = useAdmin();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  // Form States
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tourName, setTourName] = useState("Hội An đi chậm");
  const [travelDate, setTravelDate] = useState("");
  const [numberOfTravelers, setNumberOfTravelers] = useState(2);
  const [totalPrice, setTotalPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Notes Modal State
  const [editingNotesId, setEditingNotesId] = useState<number | null>(null);
  const [editingNotesValue, setEditingNotesValue] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !travelDate) return;
    addBooking({
      customerName,
      email,
      phone,
      tourName,
      travelDate,
      numberOfTravelers,
      totalPrice: totalPrice || "Liên hệ",
      notes,
    });
    // Reset Form
    setCustomerName("");
    setEmail("");
    setPhone("");
    setTravelDate("");
    setNumberOfTravelers(2);
    setTotalPrice("");
    setNotes("");
    setShowAddForm(false);
  };

  const handleStatusChange = (id: number, currentStatus: string) => {
    const statuses: Array<"Chờ xử lý" | "Đang xử lý" | "Đã xác nhận" | "Đã hủy"> = [
      "Chờ xử lý",
      "Đang xử lý",
      "Đã xác nhận",
      "Đã hủy",
    ];
    const currentIndex = statuses.indexOf(currentStatus as any);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    updateBooking(id, { status: nextStatus });
  };

  const handleSaveNotes = () => {
    if (editingNotesId !== null) {
      updateBooking(editingNotesId, { notes: editingNotesValue });
      setEditingNotesId(null);
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery) ||
      b.tourName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "Tất cả" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Yêu cầu Đặt Tour
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Xem và xử lý các yêu cầu đăng ký tour của du khách từ trang chi tiết gói tour.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all self-start sm:self-center"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {showAddForm ? "Ẩn Form thêm" : "Tạo yêu cầu mới"}
        </button>
      </section>

      {/* Add New Booking Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-in slide-in-from-top-4 duration-200">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
            Tạo Yêu Cầu Đặt Tour Thủ Công
          </h3>
          <form onSubmit={handleCreateBooking} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Tên khách hàng</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ví dụ: John Doe"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ví dụ: john@example.com"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Số điện thoại</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ví dụ: 0905123456"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Tên Tour chọn</label>
              <input
                type="text"
                required
                value={tourName}
                onChange={(e) => setTourName(e.target.value)}
                placeholder="Ví dụ: Hội An đi chậm"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Ngày đi dự kiến</label>
              <input
                type="date"
                required
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Số lượng khách</label>
              <input
                type="number"
                min={1}
                required
                value={numberOfTravelers}
                onChange={(e) => setNumberOfTravelers(parseInt(e.target.value))}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Ghi chú yêu cầu</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Ăn chay, Phòng tầng cao..."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Tổng tạm tính</label>
              <input
                type="text"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                placeholder="Ví dụ: 11.800.000đ"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition-all"
              >
                Tạo Booking
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controls: Search and Filters */}
      <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status filters */}
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-slate-50 rounded-xl">
          {["Tất cả", "Chờ xử lý", "Đang xử lý", "Đã xác nhận", "Đã hủy"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === status
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên khách, SĐT, tour..."
            className="w-full pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700"
          />
        </div>
      </section>

      {/* List Table Card */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
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
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium animate-pulse">
                    Không tìm thấy yêu cầu đặt tour nào.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
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
                            setEditingNotesId(b.id);
                            setEditingNotesValue(b.notes || "");
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
                      <button
                        onClick={() => handleStatusChange(b.id, b.status)}
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                          b.status === "Chờ xử lý"
                            ? "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100"
                            : b.status === "Đang xử lý"
                            ? "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
                            : b.status === "Đã xác nhận"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100"
                        }`}
                      >
                        {b.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingNotesId(b.id);
                            setEditingNotesValue(b.notes || "");
                          }}
                          className="px-2 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg text-xs font-bold border border-slate-100"
                        >
                          Ghi chú
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Xóa yêu cầu đặt tour này?")) {
                              removeBooking(b.id);
                            }
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                          aria-label="Xóa"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
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

      {/* Editing Notes Dialog Modal */}
      {editingNotesId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">Cập nhật yêu cầu cụ thể</h3>
              <button
                onClick={() => setEditingNotesId(null)}
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
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Ghi chú chi tiết</label>
                <textarea
                  rows={4}
                  value={editingNotesValue}
                  onChange={(e) => setEditingNotesValue(e.target.value)}
                  placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt của khách hàng tại đây..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all font-medium text-slate-700"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingNotesId(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveNotes}
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
