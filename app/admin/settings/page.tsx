"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

export default function SettingsAdminPage() {
  const { isAuthenticated } = useAdmin();
  const router = useRouter();

  // Settings mock states
  const [siteName, setSiteName] = useState("VietVista - Du lịch Việt Nam");
  const [contactEmail, setContactEmail] = useState("support@vietvista.vn");
  const [contactPhone, setContactPhone] = useState("1900 1234");
  const [address, setAddress] = useState("123 Đường Lê Lợi, Hải Châu, Đà Nẵng");
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("Cập nhật thông tin website thành công!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    // Simple password update logic (mock verification)
    if (currentPassword !== "password") {
      setErrorMsg("Mật khẩu hiện tại không chính xác (mặc định: password)");
      return;
    }
    if (newPassword.length < 4) {
      setErrorMsg("Mật khẩu mới phải từ 4 ký tự trở lên");
      return;
    }

    setSuccessMsg("Đổi mật khẩu tài khoản Admin thành công!");
    setCurrentPassword("");
    setNewPassword("");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Cấu hình Hệ thống</h1>
        <p className="text-sm text-slate-500 mt-1">Cấu hình thông tin thương hiệu, liên hệ và bảo mật tài khoản admin.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl animate-in slide-in-from-top-2 duration-200">
          <p className="text-sm font-bold text-emerald-800">{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl animate-in slide-in-from-top-2 duration-200">
          <p className="text-sm font-bold text-rose-700">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: General Settings */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Thông tin thương hiệu VietVista</h3>
              <p className="text-xs text-slate-400 mt-1">Thông tin hiển thị trên header, footer và các trang tin của khách hàng.</p>
            </div>
            
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Tên Website (Site Title)</label>
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Hotline liên hệ</label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Email hỗ trợ</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Địa chỉ văn phòng chính</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all"
              >
                Lưu cấu hình chung
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Security Password Settings */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Đổi mật khẩu Admin</h3>
              <p className="text-xs text-slate-400 mt-1">Cập nhật mật khẩu bảo mật đăng nhập cho hệ thống quản trị.</p>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md shadow-slate-900/10 hover:shadow-lg transition-all"
              >
                Cập nhật mật khẩu mới
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
