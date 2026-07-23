"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: number;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
};

export default function SettingsAdminPage() {
  const { isAuthenticated, currentAdmin } = useAdmin();
  const router = useRouter();

  // Admin users list state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Website Pages settings state
  const [siteStatus, setSiteStatus] = useState("active");
  const [pageHomeStatus, setPageHomeStatus] = useState("active");
  const [pageToursStatus, setPageToursStatus] = useState("active");
  const [pageVisaStatus, setPageVisaStatus] = useState("active");
  const [pageNewsStatus, setPageNewsStatus] = useState("active");
  const [pageContactStatus, setPageContactStatus] = useState("active");
  const [pageLocalSpecialtiesStatus, setPageLocalSpecialtiesStatus] = useState("active");
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [savedSettings, setSavedSettings] = useState<Record<string, string>>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Modal: Thêm tài khoản mới
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addFullName, setAddFullName] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState("editor");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // Modal: Sửa tài khoản
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("editor");
  const [editStatus, setEditStatus] = useState("active");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Tải danh sách admin từ API
  const fetchAdmins = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.admins);
      } else {
        setErrorMsg(data.error || "Không thể tải danh sách tài khoản.");
      }
    } catch (err) {
      setErrorMsg("Lỗi kết nối máy chủ khi lấy danh sách tài khoản.");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Tải cấu hình website từ API
  const fetchSettings = async () => {
    setLoadingSettings(true);
    setSettingsLoaded(false);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data.success) {
        const s = data.settings || {};
        const loadedSettings: Record<string, string> = {
          site_status: s.site_status || "active",
          page_home_status: s.page_home_status || "active",
          page_tours_status: s.page_tours_status || "active",
          page_visa_status: s.page_visa_status || "active",
          page_news_status: s.page_news_status || "active",
          page_contact_status: s.page_contact_status || "active",
          page_local_specialties_status: s.page_local_specialties_status || "active",
        };
        setSiteStatus(loadedSettings.site_status);
        setPageHomeStatus(loadedSettings.page_home_status);
        setPageToursStatus(loadedSettings.page_tours_status);
        setPageVisaStatus(loadedSettings.page_visa_status);
        setPageNewsStatus(loadedSettings.page_news_status);
        setPageContactStatus(loadedSettings.page_contact_status);
        setPageLocalSpecialtiesStatus(loadedSettings.page_local_specialties_status);
        setSavedSettings(loadedSettings);
        setSettingsLoaded(true);
      } else {
        setSettingsError(data.error || "Không thể tải cấu hình website.");
      }
    } catch (err) {
      setSettingsError("Lỗi kết nối máy chủ khi lấy cấu hình website.");
    } finally {
      setLoadingSettings(false);
    }
  };

  // Lưu cấu hình website qua API
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError("");
    setSettingsSuccess("");
    setLoadingSettings(true);

    if (!settingsLoaded) {
      setSettingsError("Chưa tải xong cấu hình hiện tại, vui lòng thử lại.");
      setLoadingSettings(false);
      return;
    }

    const currentSettings: Record<string, string> = {
      site_status: siteStatus,
      page_home_status: pageHomeStatus,
      page_tours_status: pageToursStatus,
      page_visa_status: pageVisaStatus,
      page_news_status: pageNewsStatus,
      page_contact_status: pageContactStatus,
      page_local_specialties_status: pageLocalSpecialtiesStatus,
    };
    const changedSettings = Object.fromEntries(
      Object.entries(currentSettings).filter(([key, value]) => savedSettings[key] !== value),
    );

    if (Object.keys(changedSettings).length === 0) {
      setSettingsSuccess("Cấu hình không có thay đổi.");
      setLoadingSettings(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: changedSettings,
        }),
      });

      const data = await res.json();
      setLoadingSettings(false);

      if (res.ok && data.success) {
        setSavedSettings(currentSettings);
        setSettingsSuccess("Cập nhật cấu hình website thành công!");
        setTimeout(() => setSettingsSuccess(""), 3000);
      } else {
        setSettingsError(data.error || "Không thể lưu cấu hình.");
      }
    } catch (error) {
      setLoadingSettings(false);
      setSettingsError("Lỗi kết nối máy chủ.");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
      return;
    }
    
    // Nếu là super admin, tải danh sách tài khoản & cấu hình
    if (currentAdmin?.email === "admin") {
      const loadTimer = window.setTimeout(() => {
        void fetchAdmins();
        void fetchSettings();
      }, 0);

      return () => window.clearTimeout(loadTimer);
    }
  }, [isAuthenticated, currentAdmin, router]);

  if (!isAuthenticated) return null;

  // Quyền truy cập: Chỉ có tài khoản admin gốc (email: "admin") mới được xem và sử dụng trang này
  const isSuperAdmin = currentAdmin?.email === "admin";

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-5 animate-in fade-in duration-300 p-6 text-center">
        <div className="p-4 bg-rose-50 text-rose-500 rounded-full shadow-inner animate-bounce">
          <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Quyền truy cập bị từ chối</h2>
        <p className="text-sm text-slate-500 max-w-md leading-relaxed font-medium">
          Rất tiếc! Màn hình cấu hình hệ thống này chỉ dành riêng cho tài khoản quản trị tối cao của hệ thống. Bạn không có quyền truy cập khu vực này.
        </p>
        <button 
          onClick={() => router.push("/admin/dashboard")}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          Quay lại Dashboard
        </button>
      </div>
    );
  }

  // Submit tạo tài khoản admin mới
  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);

    if (!addEmail || !addPassword || !addFullName) {
      setAddError("Vui lòng điền đầy đủ thông tin.");
      setAddLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: addEmail,
          password: addPassword,
          fullName: addFullName,
          role: addRole,
        }),
      });

      const data = await res.json();
      setAddLoading(false);

      if (res.ok) {
        setSuccessMsg(`Tạo tài khoản (${data.admin?.email}) thành công!`);
        setShowAddModal(false);
        // Reset form
        setAddEmail("");
        setAddFullName("");
        setAddPassword("");
        setAddRole("editor");
        // Reload list
        fetchAdmins();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setAddError(data.error || "Không thể tạo tài khoản.");
      }
    } catch (error) {
      setAddLoading(false);
      setAddError("Lỗi kết nối máy chủ.");
    }
  };

  // Submit cập nhật tài khoản admin
  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setEditLoading(true);

    if (!editingUser) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          email: editEmail,
          fullName: editFullName,
          password: editPassword,
          role: editRole,
          status: editStatus,
        }),
      });

      const data = await res.json();
      setEditLoading(false);

      if (res.ok && data.success) {
        setSuccessMsg("Cập nhật thông tin tài khoản thành công!");
        setShowEditModal(false);
        setEditingUser(null);
        setEditPassword("");
        // Reload list
        fetchAdmins();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setEditError(data.error || "Không thể cập nhật tài khoản.");
      }
    } catch (error) {
      setEditLoading(false);
      setEditError("Lỗi kết nối máy chủ.");
    }
  };

  // Xóa tài khoản admin
  const handleDeleteAdmin = async (id: number, email: string) => {
    if (email === "admin") {
      alert("Không ???c ph?p x?a t?i kho?n qu?n tr? t?i cao g?c.");
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${email}" không? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Xóa tài khoản quản trị thành công!");
        fetchAdmins();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(data.error || "Không thể xóa tài khoản.");
        setTimeout(() => setErrorMsg(""), 3000);
      }
    } catch (error) {
      setErrorMsg("Lỗi kết nối khi xóa tài khoản.");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setEditEmail(user.email);
    setEditFullName(user.fullName);
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditPassword("");
    setEditError("");
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header - Giảm kích thước tiêu đề thanh lịch hơn */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-[24px] font-bold text-slate-800 tracking-tight leading-7">Quản lý tài khoản</h2>
          <p className="text-xs text-slate-500 mt-1">Quản lý và cấp quyền truy cập tài khoản quản trị viên cho VietVista.</p>
        </div>
        <button
          onClick={() => {
            setAddError("");
            setShowAddModal(true);
          }}
          className="w-fit flex items-center gap-2 px-4.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/10 hover:shadow-lg hover:shadow-emerald-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="11" x2="19" y2="17" />
            <line x1="16" y1="14" x2="22" y2="14" />
          </svg>
          Thêm tài khoản mới
        </button>
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

      {/* Bảng Danh sách các tài khoản quản trị */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Danh sách tài khoản hệ thống</h3>
            <p className="text-xs text-slate-400 mt-1">Danh sách các quản trị viên và biên tập viên có quyền truy cập portal.</p>
          </div>
          {loadingUsers && (
            <svg className="animate-spin h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100">
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">Họ và tên</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">Tên tài khoản (Email)</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">Vai trò (Role)</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">Trạng thái</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 && !loadingUsers ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm font-medium text-slate-400">
                    Không tìm thấy tài khoản quản trị nào.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4.5 text-sm font-bold text-slate-800">{user.fullName}</td>
                    <td className="px-6 py-4.5 text-sm font-medium text-slate-500 font-mono">{user.email}</td>
                    <td className="px-6 py-4.5 text-sm">
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                          Quản trị viên (Admin)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/50">
                          Biên tập viên (Editor)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-sm">
                      {user.status === "active" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Bị khóa
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-sm text-right space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                        title="Sửa tài khoản"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(user.id, user.email)}
                        disabled={user.email === "admin"}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center ${user.email === "admin" ? 'text-slate-200 cursor-not-allowed' : 'hover:bg-rose-50 text-rose-400 hover:text-rose-600'}`}
                        title={user.email === "admin" ? "Không ???c ph?p x?a Super Admin" : "Xóa tài khoản"}
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cấu hình hoạt động các trang Website */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Quản lý hoạt động Website</h3>
            <p className="text-xs text-slate-400 mt-1">Cấu hình tắt/mở website chính hoặc ẩn các trang con khi bảo trì/custom.</p>
          </div>
          {loadingSettings && (
            <svg className="animate-spin h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
          {settingsSuccess && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl animate-in slide-in-from-top-2 duration-200">
              <p className="text-sm font-bold text-emerald-800">{settingsSuccess}</p>
            </div>
          )}

          {settingsError && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl animate-in slide-in-from-top-2 duration-200">
              <p className="text-sm font-bold text-rose-700">{settingsError}</p>
            </div>
          )}

          {/* Section 1: Khóa toàn website */}
          <div className="p-5 rounded-2xl border border-slate-200/60 bg-slate-50/50 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                  Trạng thái Website chính (Backdoor)
                </span>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Dùng để khóa nhanh toàn bộ website (ví dụ trường hợp khách hàng chưa thanh toán). Portal quản trị <code className="font-mono text-emerald-600">/admin</code> vẫn hoạt động bình thường để bạn đăng nhập mở lại.
                </p>
              </div>
              <div className="w-full md:w-72">
                <select
                  value={siteStatus}
                  onChange={(e) => setSiteStatus(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold focus:outline-none transition-all cursor-pointer ${
                    siteStatus === "suspended"
                      ? "bg-rose-50 border-rose-200 text-rose-700 focus:ring-2 focus:ring-rose-500/20"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
                >
                  <option value="active">🟢 Đang hoạt động bình thường</option>
                  <option value="suspended">🔴 Tạm dừng hoạt động (Khách chưa thanh toán)</option>
                </select>
              </div>
            </div>

            {siteStatus === "suspended" && (
              <div className="flex gap-2.5 p-3.5 bg-rose-50/60 border border-rose-100 rounded-xl text-rose-800 text-xs font-medium animate-in fade-in duration-200">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>
                  <strong>Cảnh báo:</strong> Khi lưu cấu hình này, tất cả khách hàng truy cập website công cộng sẽ nhận được thông báo đình chỉ dịch vụ. Chỉ có trang quản trị là vẫn truy cập được.
                </span>
              </div>
            )}
          </div>

          {/* Section 2: Quản lý ẩn hiện trang con */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                Trạng thái hiển thị các trang con (Subpages)
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Bật hoặc ẩn tạm thời từng trang con của hệ thống (khi cần nâng cấp, bảo trì hoặc ẩn tùy chỉnh).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Trang chủ */}
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/40 transition-colors flex flex-col justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 block">Trang chủ (Home)</span>
                  <span className="text-[10px] text-slate-400 block font-medium">Đường dẫn: /</span>
                </div>
                <select
                  value={pageHomeStatus}
                  onChange={(e) => setPageHomeStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                  <option value="active">🟢 Đang hiển thị (Active)</option>
                  <option value="inactive">🟡 Tạm ẩn / Bảo trì (Inactive)</option>
                </select>
              </div>

              {/* Gói du lịch */}
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/40 transition-colors flex flex-col justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 block">Gói du lịch (Tours)</span>
                  <span className="text-[10px] text-slate-400 block font-medium">Đường dẫn: /goi-du-lich</span>
                </div>
                <select
                  value={pageToursStatus}
                  onChange={(e) => setPageToursStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                  <option value="active">🟢 Đang hiển thị (Active)</option>
                  <option value="inactive">🟡 Tạm ẩn / Bảo trì (Inactive)</option>
                </select>
              </div>

              {/* Hướng dẫn Visa */}
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/40 transition-colors flex flex-col justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 block">Hướng dẫn Visa</span>
                  <span className="text-[10px] text-slate-400 block font-medium">Đường dẫn: /huong-dan-visa</span>
                </div>
                <select
                  value={pageVisaStatus}
                  onChange={(e) => setPageVisaStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                  <option value="active">🟢 Đang hiển thị (Active)</option>
                  <option value="inactive">🟡 Tạm ẩn / Bảo trì (Inactive)</option>
                </select>
              </div>

              {/* Tin tức */}
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/40 transition-colors flex flex-col justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 block">Tin tức & Cẩm nang</span>
                  <span className="text-[10px] text-slate-400 block font-medium">Đường dẫn: /tin-tuc</span>
                </div>
                <select
                  value={pageNewsStatus}
                  onChange={(e) => setPageNewsStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                  <option value="active">🟢 Đang hiển thị (Active)</option>
                  <option value="inactive">🟡 Tạm ẩn / Bảo trì (Inactive)</option>
                </select>
              </div>

              {/* Liên hệ */}
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/40 transition-colors flex flex-col justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 block">Liên hệ (Contact)</span>
                  <span className="text-[10px] text-slate-400 block font-medium">Đường dẫn: /lien-he</span>
                </div>
                <select
                  value={pageContactStatus}
                  onChange={(e) => setPageContactStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                  <option value="active">🟢 Đang hiển thị (Active)</option>
                  <option value="inactive">🟡 Tạm ẩn / Bảo trì (Inactive)</option>
                </select>
              </div>

              {/* Đặc sản địa phương */}
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/40 transition-colors flex flex-col justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 block">Đặc sản địa phương (Local Specialties)</span>
                  <span className="text-[10px] text-slate-400 block font-medium">Đường dẫn: /dac-san</span>
                </div>
                <select
                  value={pageLocalSpecialtiesStatus}
                  onChange={(e) => setPageLocalSpecialtiesStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                  <option value="active">🟢 Đang hiển thị (Active)</option>
                  <option value="inactive">🟡 Tạm ẩn / Bảo trì (Inactive)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loadingSettings}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              {loadingSettings && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              )}
              Lưu cấu hình hoạt động
            </button>
          </div>
        </form>
      </div>

      {/* Modal: Thêm tài khoản mới */}
      {showAddModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg tracking-tight">Thêm Quản Trị Viên</h3>
                <p className="text-xs text-emerald-200/80 mt-0.5">Tạo tài khoản quản lý mới cho hệ thống.</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-100 hover:text-white transition-all cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleRegisterAdmin} className="p-6 space-y-4">
              {addError && (
                <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl">
                  <p className="text-xs font-bold text-rose-700">{addError}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={addFullName}
                  onChange={(e) => setAddFullName(e.target.value)}
                  placeholder="Nguyen Van A"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Tên đăng nhập (Email / Tài khoản)</label>
                <input
                  type="text"
                  required
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="admin2 hoặc test@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Mật khẩu</label>
                <input
                  type="password"
                  required
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Vai trò (Role)</label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                >
                  <option value="editor">Biên tập viên (Editor)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  {addLoading && (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  )}
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Chỉnh sửa tài khoản */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg tracking-tight">Sửa Thông Tin</h3>
                <p className="text-xs text-emerald-200/80 mt-0.5">Chỉnh sửa thông tin tài khoản quản trị.</p>
              </div>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-100 hover:text-white transition-all cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateAdmin} className="p-6 space-y-4">
              {editError && (
                <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl">
                  <p className="text-xs font-bold text-rose-700">{editError}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Tên đăng nhập (Email / Tài khoản)</label>
                <input
                  type="text"
                  required
                  disabled={editingUser.email === "admin"}
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Mật khẩu mới (Để trống nếu không đổi)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Vai trò (Role)</label>
                <select
                  value={editRole}
                  disabled={editingUser.email === "admin"}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                >
                  <option value="editor">Biên tập viên (Editor)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Trạng thái tài khoản</label>
                <select
                  value={editStatus}
                  disabled={editingUser.email === "admin"}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                >
                  <option value="active">Hoạt động (Active)</option>
                  <option value="inactive">Khóa (Inactive)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  {editLoading && (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  )}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
