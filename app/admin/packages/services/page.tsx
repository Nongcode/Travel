"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

export default function PackageServicesPage() {
  const { servicePackages, isAuthenticated, addServicePackage, updateServicePackage, removeServicePackage } = useAdmin();
  const router = useRouter();

  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceType, setServiceType] = useState("Hướng dẫn viên");
  const [serviceDesc, setServiceDesc] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingService, setEditingService] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // Filter list
  const filteredServices = servicePackages.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !servicePrice.trim() || !serviceType.trim()) return;

    const serviceData = {
      name: serviceName.trim(),
      price: servicePrice.trim(),
      type: serviceType,
      description: serviceDesc.trim(),
      status: "Đang mở",
    };

    if (editingService) {
      updateServicePackage(editingService.id, {
        ...serviceData,
        status: editingService.status,
      });
      setEditingService(null);
    } else {
      addServicePackage(serviceData);
    }

    setServiceName("");
    setServicePrice("");
    setServiceType("Hướng dẫn viên");
    setServiceDesc("");
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "Đang mở" ? "Tạm đóng" : "Đang mở";
    updateServicePackage(id, { status: nextStatus });
  };

  const startEdit = (s: any) => {
    setEditingService(s);
    setServiceName(s.name);
    setServicePrice(s.price);
    setServiceType(s.type);
    setServiceDesc(s.description);
  };

  const cancelEdit = () => {
    setEditingService(null);
    setServiceName("");
    setServicePrice("");
    setServiceType("Hướng dẫn viên");
    setServiceDesc("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
          Quản lý Gói dịch vụ đi kèm (Add-ons)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Thiết lập các dịch vụ phụ trợ như đưa đón sân bay, thuê hướng dẫn viên riêng, SIM 4G phục vụ khách nước ngoài.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Add/Edit Service */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm sticky top-24">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
              {editingService ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                  Tên dịch vụ
                </label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Ví dụ: Hướng dẫn viên nói tiếng Anh, SIM 4G..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Phân loại
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700 bg-white"
                  >
                    <option value="Hướng dẫn viên">Hướng dẫn viên</option>
                    <option value="Vận chuyển">Vận chuyển</option>
                    <option value="Tiện ích">Tiện ích</option>
                    <option value="Khách sạn">Khách sạn</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Đơn giá
                  </label>
                  <input
                    type="text"
                    required
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    placeholder="Ví dụ: $50/Ngày, $30/Lượt..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                  Mô tả dịch vụ
                </label>
                <textarea
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  placeholder="Mô tả chi tiết quyền lợi hoặc thông tin dịch vụ..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all"
                >
                  {editingService ? "Lưu thay đổi" : "Tạo dịch vụ"}
                </button>
                {editingService && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Table */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Dịch vụ hiện có ({servicePackages.length})
            </h4>
            <div className="relative w-full max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên dịch vụ, phân loại..."
                className="w-full pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Tên dịch vụ</th>
                    <th className="px-6 py-4">Phân loại</th>
                    <th className="px-6 py-4">Đơn giá</th>
                    <th className="px-6 py-4">Mô tả</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-slate-400 font-medium"
                      >
                        Không tìm thấy dịch vụ đi kèm nào.
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((s) => (
                      <tr
                        key={s.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {s.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold">
                            {s.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-emerald-600">
                          {s.price}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 max-w-[150px] truncate">
                          {s.description || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(s.id, s.status)}
                            className={
                              "px-2.5 py-1 rounded-full text-xs font-bold transition-all " +
                              (s.status === "Đang mở"
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-rose-50 text-rose-600 hover:bg-rose-100")
                            }
                          >
                            {s.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => startEdit(s)}
                              className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg transition-colors"
                              aria-label="Sửa"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Bạn có chắc chắn muốn xóa dịch vụ "${s.name}"?`
                                  )
                                ) {
                                  removeServicePackage(s.id);
                                }
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                              aria-label="Xóa"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
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
          </div>
        </div>
      </div>
    </div>
  );
}
