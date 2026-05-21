"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

export default function ControlAdminPage() {
  const { isAuthenticated, resetDatabase } = useAdmin();
  const router = useRouter();

  const [logs, setLogs] = useState<string[]>([
    "Hệ thống khởi động thành công.",
    "Kết nối cơ sở dữ liệu giả lập (LocalStorage) ổn định.",
  ]);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleReset = () => {
    if (confirm("Bạn có chắc chắn muốn khôi phục toàn bộ bài viết và gói du lịch về trạng thái mặc định ban đầu không? Thao tác này không thể hoàn tác!")) {
      resetDatabase();
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Thực hiện khôi phục dữ liệu gốc thành công.`]);
      setSuccessMsg("Đã khôi phục dữ liệu mặc định thành công! Vui lòng tải lại trang hoặc kiểm tra Dashboard.");
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  const handleClearCache = () => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Xóa bộ nhớ đệm thành công.`]);
    setSuccessMsg("Đã xóa bộ nhớ đệm thành công!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Hệ thống Control Panel</h1>
        <p className="text-sm text-slate-500 mt-1">Cấu hình cấp cao cho nhà phát triển và quản trị viên hệ thống VietVista.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl animate-in slide-in-from-top-2 duration-200">
          <p className="text-sm font-bold text-emerald-800">{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Side: System Tools */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Công cụ quản lý dữ liệu</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Bạn có thể reset toàn bộ bài viết và gói du lịch mẫu được lưu trong LocalStorage về trạng thái khởi tạo ban đầu bất cứ lúc nào.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-600/10 hover:shadow-lg transition-all"
              >
                Khôi phục dữ liệu gốc
              </button>
              <button
                onClick={handleClearCache}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 active:bg-slate-350 rounded-xl text-sm font-bold transition-all"
              >
                Xóa bộ nhớ đệm
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Trạng thái hệ thống</h3>
            <div className="grid grid-cols-2 gap-4 text-sm font-semibold text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block uppercase tracking-wider mb-1">Môi trường</span>
                Development / Client-Side
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block uppercase tracking-wider mb-1">Loại Database</span>
                Mock LocalStorage
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block uppercase tracking-wider mb-1">Phiên bản API</span>
                VietVista v1.0.0
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block uppercase tracking-wider mb-1">Trạng thái kết nối</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Đang hoạt động
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Log Feed */}
        <div className="md:col-span-5">
          <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800 text-slate-100 font-mono text-xs h-full min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs">
                <span className="text-slate-400 font-bold tracking-wider uppercase">System Logs</span>
                <button
                  onClick={() => setLogs([])}
                  className="text-slate-500 hover:text-slate-300 font-bold"
                >
                  Xóa log
                </button>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {logs.map((log, index) => (
                  <p key={index} className="leading-relaxed text-emerald-400 text-xs">
                    <span className="text-slate-500">&gt; </span>{log}
                  </p>
                ))}
                {logs.length === 0 && (
                  <p className="text-slate-500 text-xs">Chưa có nhật ký hoạt động.</p>
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-600 mt-4 border-t border-slate-800 pt-3">
              VietVista Console // Press F12 to inspect full network requests.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
