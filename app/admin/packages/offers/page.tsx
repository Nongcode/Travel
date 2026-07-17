"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "../../../components/admin/AdminContext";

type PromoPackageView = {
  id: number;
  name: string;
  packageName: string;
  discountValue: string;
  validUntil: string;
  status: string;
};

export default function PackageOffersPage() {
  const { promoPackages, packages, isAuthenticated, addPromoPackage, updatePromoPackage, removePromoPackage } = useAdmin();
  const router = useRouter();

  const [promoName, setPromoName] = useState("");
  const [targetPackage, setTargetPackage] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPromo, setEditingPromo] = useState<PromoPackageView | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.push("/admin/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const filteredPromos = promoPackages.filter((promo) =>
    promo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    promo.packageName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!promoName.trim() || !targetPackage.trim() || !discountValue.trim() || !validUntil.trim()) return;

    const promoData = {
      name: promoName.trim(),
      packageName: targetPackage,
      discountValue: discountValue.trim(),
      validUntil,
      status: "Đang mở",
    };

    if (editingPromo) {
      updatePromoPackage(editingPromo.id, { ...promoData, status: editingPromo.status });
      setEditingPromo(null);
    } else {
      addPromoPackage(promoData);
    }

    setPromoName("");
    setTargetPackage("");
    setDiscountValue("");
    setValidUntil("");
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "Đang mở" ? "Tạm đóng" : "Đang mở";
    updatePromoPackage(id, { status: nextStatus });
  };

  const startEdit = (promo: PromoPackageView) => {
    setEditingPromo(promo);
    setPromoName(promo.name);
    setTargetPackage(promo.packageName);
    setDiscountValue(promo.discountValue);
    setValidUntil(promo.validUntil);
  };

  const cancelEdit = () => {
    setEditingPromo(null);
    setPromoName("");
    setTargetPackage("");
    setDiscountValue("");
    setValidUntil("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
          Quản lý Gói ưu đãi & Khuyến mãi
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Cài đặt các chương trình giảm giá, mã khuyến mãi cho các tour du lịch để kích cầu du khách quốc tế.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm sticky top-24">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
              {editingPromo ? "Cập nhật ưu đãi" : "Thêm ưu đãi mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Tên chương trình ưu đãi</label>
                <input
                  type="text"
                  required
                  value={promoName}
                  onChange={(e) => setPromoName(e.target.value)}
                  placeholder="Ví dụ: Early Bird 15%, Summer Sale..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Áp dụng cho gói du lịch</label>
                <select
                  required
                  value={targetPackage}
                  onChange={(e) => setTargetPackage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700 bg-white"
                >
                  <option value="">-- Chọn gói du lịch --</option>
                  <option value="Tất cả các gói">Tất cả các gói</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.name}>{pkg.name} ({pkg.destination})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Mức giảm giá</label>
                  <input
                    type="text"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="Ví dụ: 15%, 500.000đ..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Hạn sử dụng</label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all">
                  {editingPromo ? "Lưu thay đổi" : "Tạo chương trình"}
                </button>
                {editingPromo && (
                  <button type="button" onClick={cancelEdit} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all">
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Ưu đãi hiện có ({promoPackages.length})</h4>
            <div className="relative w-full max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên ưu đãi, tên gói..."
                className="w-full pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Tên ưu đãi</th>
                    <th className="px-6 py-4">Gói du lịch áp dụng</th>
                    <th className="px-6 py-4">Mức giảm</th>
                    <th className="px-6 py-4">Hạn dùng</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                  {filteredPromos.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">Không tìm thấy chương trình ưu đãi nào.</td></tr>
                  ) : (
                    filteredPromos.map((promo) => (
                      <tr key={promo.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{promo.name}</td>
                        <td className="px-6 py-4 text-slate-600">{promo.packageName}</td>
                        <td className="px-6 py-4"><span className="inline-flex px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-black">-{promo.discountValue}</span></td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{promo.validUntil}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleToggleStatus(promo.id, promo.status)} className={"px-2.5 py-1 rounded-full text-xs font-bold transition-all " + (promo.status === "Đang mở" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-rose-50 text-rose-600 hover:bg-rose-100")}>{promo.status}</button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex gap-2">
                            <button onClick={() => startEdit(promo)} className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg transition-colors" aria-label="Sửa">
                              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            </button>
                            <button onClick={() => { if (confirm(`Bạn có chắc chắn muốn xóa chương trình "${promo.name}"?`)) removePromoPackage(promo.id); }} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors" aria-label="Xóa">
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