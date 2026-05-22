"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

export default function ContactsAdminPage() {
  const { contacts, isAuthenticated, updateContact, removeContact } = useAdmin();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  // Reply Modal States
  const [replyingContactId, setReplyingContactId] = useState<number | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleToggleReadStatus = (id: number, currentStatus: "Chưa đọc" | "Đã đọc" | "Đã trả lời") => {
    if (currentStatus === "Chưa đọc") {
      updateContact(id, { status: "Đã đọc" });
    } else if (currentStatus === "Đã đọc") {
      updateContact(id, { status: "Chưa đọc" });
    }
  };

  const handleOpenReplyModal = (contactId: number, name: string, subject: string) => {
    setReplyingContactId(contactId);
    setReplySubject(`Re: ${subject}`);
    setReplyBody(`Dear ${name},\n\nThank you for contacting VietVista Travel.\n\n[Nhập câu trả lời của bạn ở đây]\n\nBest regards,\nVietVista Customer Support Team`);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyingContactId === null) return;
    setIsSending(true);

    // Simulate network delay
    setTimeout(() => {
      updateContact(replyingContactId, { status: "Đã trả lời" });
      setIsSending(false);
      setReplyingContactId(null);
      alert("Đã gửi email trả lời thành công cho khách hàng!");
    }, 1000);
  };

  // Filter Contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "Tất cả" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <section>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
          Quản lý Yêu cầu Liên hệ & Tư vấn
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Xử lý các tin nhắn thắc mắc, phản hồi hoặc yêu cầu thiết kế tour riêng lẻ gửi từ trang Liên hệ.
        </p>
      </section>

      {/* Controls */}
      <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status filters */}
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-slate-50 rounded-xl">
          {["Tất cả", "Chưa đọc", "Đã đọc", "Đã trả lời"].map((status) => (
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
            placeholder="Tìm tên, email, sđt, tin nhắn..."
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
                <th className="px-6 py-4">Tiêu đề liên hệ</th>
                <th className="px-6 py-4">Nội dung tin nhắn</th>
                <th className="px-6 py-4">Ngày gửi</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy tin nhắn liên hệ nào.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-50/50 transition-colors ${
                      c.status === "Chưa đọc" ? "bg-emerald-50/10 font-medium" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <strong className={`block ${c.status === "Chưa đọc" ? "text-slate-900 font-bold" : "text-slate-700"}`}>
                        {c.name}
                      </strong>
                      <span className="text-xs text-slate-400 block">{c.phone}</span>
                      <span className="text-xs text-slate-400 font-mono block">{c.email}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {c.subject}
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {c.message}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {c.date}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleReadStatus(c.id, c.status)}
                        disabled={c.status === "Đã trả lời"}
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                          c.status === "Chưa đọc"
                            ? "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 cursor-pointer"
                            : c.status === "Đã đọc"
                            ? "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 cursor-pointer"
                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}
                      >
                        {c.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleOpenReplyModal(c.id, c.name, c.subject)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100/50 transition-colors"
                        >
                          Trả lời
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Xóa tin nhắn liên hệ này?")) {
                              removeContact(c.id);
                            }
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-100/50"
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

      {/* Reply Modal */}
      {replyingContactId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">Soạn email trả lời khách hàng</h3>
              <button
                onClick={() => setReplyingContactId(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSendReply} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Gửi đến email</label>
                <input
                  type="text"
                  disabled
                  value={contacts.find(c => c.id === replyingContactId)?.email || ""}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Tiêu đề thư</label>
                <input
                  type="text"
                  required
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Nội dung trả lời</label>
                <textarea
                  required
                  rows={8}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all font-mono text-slate-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyingContactId(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition-all flex items-center gap-2"
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi Email trả lời"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
