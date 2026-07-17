"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdmin } from "../../../components/admin/AdminContext";

type AdminPackage = {
  id: number;
  slug: string;
  name: string;
  destination: string;
  duration: string;
  price: string;
  description: string;
  imageUrl: string;
  status: string;
  hasDetail: boolean;
};

export default function PackageServicesPage() {
  const { isAuthenticated } = useAdmin();
  const router = useRouter();

  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) router.push("/admin/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadPackages() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/packages", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Không tải được danh sách gói du lịch.");
        setPackages(Array.isArray(data.packages) ? data.packages : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không tải được dữ liệu chi tiết gói.");
      } finally {
        setLoading(false);
      }
    }

    void loadPackages();
  }, [isAuthenticated]);

  const filteredPackages = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return packages;
    return packages.filter((pkg) => [pkg.name, pkg.destination, pkg.description, pkg.slug].join(" ").toLowerCase().includes(keyword));
  }, [packages, searchQuery]);

  // Reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / ITEMS_PER_PAGE));
  const paginatedPackages = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPackages.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPackages, currentPage]);

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Chi tiết gói du lịch</h2>
          <p className="text-xs text-slate-500 mt-1">Quản lý nội dung chi tiết, gallery, lịch trình, ưu đãi, lợi ích và SEO cho từng gói du lịch.</p>
        </div>
        <Link href="/admin/packages" className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 !text-white text-sm font-bold shadow-md flex items-center justify-center">Danh sách gói</Link>
      </section>

      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

      <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Gói có thể cấu hình ({packages.length})</h2>
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          </span>
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tìm tên gói, điểm đến hoặc slug..." className="w-full pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700" />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Gói du lịch</th>
                <th className="px-6 py-4">Điểm đến</th>
                <th className="px-6 py-4">Thời lượng</th>
                <th className="px-6 py-4">Trạng thái chi tiết</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">Đang tải dữ liệu chi tiết gói...</td></tr>
              ) : filteredPackages.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">Không tìm thấy gói du lịch nào.</td></tr>
              ) : paginatedPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 min-w-[280px]">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-10 rounded-lg bg-slate-100 bg-cover bg-center shrink-0" style={{ backgroundImage: pkg.imageUrl ? `url(${pkg.imageUrl})` : undefined }} />
                      <div>
                        <strong className="text-slate-800 font-bold block">{pkg.name}</strong>
                        <span className="text-xs text-slate-400 block mt-0.5">/{pkg.slug}</span>
                        {pkg.description && <span className="text-xs text-slate-500 line-clamp-1 block mt-1">{pkg.description}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">{pkg.destination}</td>
                  <td className="px-6 py-4 text-slate-500">{pkg.duration || "Chưa đặt"}</td>
                  <td className="px-6 py-4">
                    <span className={"inline-flex px-2.5 py-1 rounded-full text-xs font-bold " + (pkg.hasDetail ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                      {pkg.hasDetail ? "Đã có chi tiết" : "Chưa có chi tiết"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/packages/${pkg.id}/detail`} className="inline-flex px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition-colors">Sửa chi tiết</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-xs font-medium text-slate-500">
              Hiển thị <span className="font-bold text-slate-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> đến <span className="font-bold text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredPackages.length)}</span> trong số <span className="font-bold text-slate-700">{filteredPackages.length}</span> gói
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              
              <div className="flex items-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[32px] h-8 text-xs font-bold rounded-lg transition-all ${
                      currentPage === page 
                        ? "bg-emerald-600 text-white shadow-sm" 
                        : "text-slate-600 hover:bg-white hover:text-emerald-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}