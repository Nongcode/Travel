"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

export default function PackagesAdminPage() {
  const { packages, isAuthenticated, addPackage, updatePackage, removePackage } = useAdmin();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [packageName, setPackageName] = useState("");
  const [packageDest, setPackageDest] = useState("");
  const [packagePrice, setPackagePrice] = useState("");
  const [packageDuration, setPackageDuration] = useState("3 ngày 2 đêm");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // Filter packages
  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName.trim() || !packageDest.trim()) return;
    addPackage({
      name: packageName,
      destination: packageDest,
      price: packagePrice || "Liên hệ",
      duration: packageDuration,
      status: "Đang mở",
    });
    setPackageName("");
    setPackageDest("");
    setPackagePrice("");
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "Đang mở" ? "Tạm đóng" : "Đang mở";
    updatePackage(id, { status: nextStatus });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Quản lý Gói du lịch</h1>
          <p className="text-xs text-slate-500 mt-1">Đăng bán các gói tour du lịch lữ hành, dịch vụ nghỉ dưỡng trọn gói.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Add New Package */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm sticky top-24">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Tạo gói tour mới</h3>
            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Tên gói du lịch</label>
                <input
                  type="text"
                  required
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="Ví dụ: Tour Sapa Cát Cát Hàm Rồng..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Địa danh / Điểm đến</label>
                <input
                  type="text"
                  required
                  value={packageDest}
                  onChange={(e) => setPackageDest(e.target.value)}
                  placeholder="Ví dụ: Lào Cai - Sapa"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Thời lượng</label>
                  <input
                    type="text"
                    required
                    value={packageDuration}
                    onChange={(e) => setPackageDuration(e.target.value)}
                    placeholder="Ví dụ: 3 ngày 2 đêm"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Giá tour</label>
                  <input
                    type="text"
                    value={packagePrice}
                    onChange={(e) => setPackagePrice(e.target.value)}
                    placeholder="Ví dụ: 2.850.000đ"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all"
              >
                Đăng bán gói tour mới
              </button>
            </form>
          </div>
        </div>

        {/* Right side: Search & Table */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Controls Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Danh sách gói tour ({packages.length})</h4>
            {/* Search Input */}
            <div className="relative w-full max-w-xs shrink-0">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên gói, điểm đến..."
                className="w-full pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          {/* List Table Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Gói tour du lịch</th>
                    <th className="px-6 py-4">Điểm đến</th>
                    <th className="px-6 py-4">Thời gian</th>
                    <th className="px-6 py-4">Giá tiền</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                  {filteredPackages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                        Không tìm thấy gói du lịch nào.
                      </td>
                    </tr>
                  ) : (
                    filteredPackages.map((pkg) => (
                      <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <strong className="text-slate-800 font-bold block">{pkg.name}</strong>
                          <span className="text-xs text-slate-400 mt-0.5 block">ID: {pkg.id}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold">{pkg.destination}</td>
                        <td className="px-6 py-4 text-slate-500">{pkg.duration}</td>
                        <td className="px-6 py-4 text-emerald-800 font-black">{pkg.price}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                              pkg.status === "Đang mở"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {pkg.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(pkg.id, pkg.status)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold rounded-lg text-xs transition-colors"
                            >
                              Đổi bán
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Bạn có chắc chắn muốn xóa gói du lịch này không?")) {
                                  removePackage(pkg.id);
                                }
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                              aria-label="Xóa"
                            >
                              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
