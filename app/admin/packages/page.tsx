/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdmin } from "../../components/admin/AdminContext";

type PackageTranslationField = "name" | "destination" | "duration" | "summary" | "description" | "peopleNote";
type PackageTranslationMap = Record<string, Record<string, string>>;

type AdminOffer = { id: number; title: string; description?: string; validUntil?: string; tag?: string };
type PackageCollectionOption = { id: number; name: string; slug: string; accent?: string; packageCount?: number };
type AdminPackage = {
  id: number;
  slug: string;
  name: string;
  destination: string;
  offerId: number | null;
  offer: AdminOffer | null;
  duration: string;
  price: string;
  summary: string;
  description: string;
  minPeople: number | null;
  maxPeople: number | null;
  peopleNote: string;
  imageUrl: string;
  status: string;
  hasDetail: boolean;
  translations?: PackageTranslationMap;
  collectionIds?: number[];
  collectionNames?: string[];
};

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600";
const offerInputClass = "w-full px-4 py-2 rounded-lg border border-emerald-200/60 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500";

const emptyPackageTranslations: PackageTranslationMap = {
  en: { name: "", destination: "", duration: "", summary: "", description: "", peopleNote: "" },
  "zh-CN": { name: "", destination: "", duration: "", summary: "", description: "", peopleNote: "" },
};

const statusOptions = ["Sắp ra mắt", "Đang mở bán", "Sắp kín chỗ", "Đã hết chỗ", "Đã đóng", "Tạm ngưng"];

const defaultForm = {
  name: "",
  slug: "",
  destination: "",
  offerTitle: "",
  offerDescription: "",
  offerValidUntil: "",
  duration: "3 ngày 2 đêm",
  price: "",
  summary: "",
  description: "",
  minPeople: "",
  maxPeople: "",
  peopleNote: "",
  imageUrl: "",
  status: "Đang mở bán",
};

function clonePackageTranslations(value?: PackageTranslationMap): PackageTranslationMap {
  return {
    en: { ...emptyPackageTranslations.en, ...(value?.en || {}) },
    "zh-CN": { ...emptyPackageTranslations["zh-CN"], ...(value?.["zh-CN"] || {}) },
  };
}

function getStatusClass(status: string) {
  switch (status) {
    case "Đang mở":
    case "Đang mở bán": return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80";
    case "Sắp ra mắt": return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/80";
    case "Sắp kín chỗ": return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80";
    case "Đã hết chỗ": return "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80";
    case "Đã đóng": return "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200/80";
    default: return "bg-neutral-900 text-neutral-100 border-neutral-800 hover:bg-neutral-800/80";
  }
}

function statusOptionClass(status: string) {
  switch (status) {
    case "Đang mở bán": return "text-emerald-700 hover:bg-emerald-50/50";
    case "Sắp ra mắt": return "text-blue-700 hover:bg-blue-50/50";
    case "Sắp kín chỗ": return "text-amber-700 hover:bg-amber-50/50";
    case "Đã hết chỗ": return "text-rose-700 hover:bg-rose-50/50";
    case "Đã đóng": return "text-slate-700 hover:bg-slate-50/50";
    default: return "text-neutral-900 hover:bg-neutral-100";
  }
}

export default function PackagesAdminPage() {
  const { isAuthenticated } = useAdmin();
  const router = useRouter();
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [collections, setCollections] = useState<PackageCollectionOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [packageTranslations, setPackageTranslations] = useState<PackageTranslationMap>(() => clonePackageTranslations());
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    if (!isAuthenticated) router.push("/admin/login");
  }, [isAuthenticated, router]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [packagesRes, offersRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/packages", { cache: "no-store" }),
        fetch("/api/admin/offers", { cache: "no-store" }),
        fetch("/api/admin/packages/categories", { cache: "no-store" }),
      ]);
      const packagesData = await packagesRes.json().catch(() => ({}));
      const offersData = await offersRes.json().catch(() => ({}));
      const categoriesData = await categoriesRes.json().catch(() => ({}));
      if (!packagesRes.ok) throw new Error(packagesData.error || "Không tải được danh sách gói du lịch.");
      setPackages(Array.isArray(packagesData.packages) ? packagesData.packages : []);
      setOffers(offersRes.ok && Array.isArray(offersData.offers) ? offersData.offers : []);
      setCollections(categoriesRes.ok && Array.isArray(categoriesData.categories) ? categoriesData.categories : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu gói du lịch.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) void loadData();
  }, [isAuthenticated]);

  const filteredPackages = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return packages;
    return packages.filter((pkg) =>
      [pkg.name, pkg.destination, pkg.summary, pkg.description, pkg.peopleNote, pkg.offer?.title || ""]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [packages, searchQuery]);

  useEffect(() => setCurrentPage(1), [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / ITEMS_PER_PAGE));
  const paginatedPackages = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPackages.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPackages, currentPage]);

  function updateField(field: keyof typeof defaultForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startAdd() {
    setForm(defaultForm);
    setPackageTranslations(clonePackageTranslations());
    setSelectedCollectionIds([]);
    setError("");
    setShowAddModal(true);
  }

  function startEdit(pkg: AdminPackage) {
    let validUntilFormatted = "";
    if (pkg.offer?.validUntil) {
      try { validUntilFormatted = new Date(pkg.offer.validUntil).toISOString().split("T")[0]; } catch {}
    }
    setEditingId(pkg.id);
    setForm({
      name: pkg.name,
      slug: pkg.slug,
      destination: pkg.destination,
      offerTitle: pkg.offer?.title || "",
      offerDescription: pkg.offer?.description || "",
      offerValidUntil: validUntilFormatted,
      duration: pkg.duration || "",
      price: pkg.price || "",
      summary: pkg.summary || "",
      description: pkg.description || "",
      minPeople: pkg.minPeople ? String(pkg.minPeople) : "",
      maxPeople: pkg.maxPeople ? String(pkg.maxPeople) : "",
      peopleNote: pkg.peopleNote || "",
      imageUrl: pkg.imageUrl || "",
      status: pkg.status || "Đang mở bán",
    });
    setPackageTranslations(clonePackageTranslations(pkg.translations));
    setSelectedCollectionIds(Array.isArray(pkg.collectionIds) ? pkg.collectionIds : []);
    setError("");
    setShowEditModal(true);
  }

  async function submitPackage(event: React.FormEvent, mode: "create" | "edit") {
    event.preventDefault();
    if (!form.name.trim() || !form.destination.trim()) return;
    if (mode === "edit" && editingId === null) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/packages", {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(mode === "edit" ? { id: editingId } : {}),
          ...form,
          minPeople: form.minPeople || null,
          maxPeople: form.maxPeople || null,
          translations: packageTranslations,
          collectionIds: selectedCollectionIds,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || (mode === "create" ? "Không tạo được gói du lịch." : "Không cập nhật được gói du lịch."));
      setShowAddModal(false);
      setShowEditModal(false);
      setForm(defaultForm);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : (mode === "create" ? "Không tạo được gói du lịch." : "Không cập nhật được gói du lịch."));
    } finally {
      setSaving(false);
    }
  }

  async function updatePackage(id: number, payload: Partial<AdminPackage>) {
    const res = await fetch("/api/admin/packages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Không cập nhật được gói du lịch.");
    await loadData();
  }

  async function handleUpdateStatus(pkg: AdminPackage, nextStatus: string) {
    try {
      await updatePackage(pkg.id, { status: nextStatus });
      setOpenDropdownId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được trạng thái.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa gói du lịch này không?")) return;
    try {
      const res = await fetch(`/api/admin/packages?id=${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không xóa được gói du lịch.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được gói du lịch.");
    }
  }

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Quản lý Gói du lịch</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Danh sách các gói du lịch đang có trên hệ thống.</p>
        </div>
        <button onClick={startAdd} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all w-full sm:w-auto">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Tạo gói du lịch
        </button>
      </section>

      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
        <div className="px-3 py-1.5 bg-emerald-50 rounded-lg text-emerald-700 font-bold text-sm">{packages.length} gói</div>
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm tên gói, điểm đến, ưu đãi..." className="w-full sm:max-w-md px-4 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-xs uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Gói du lịch</th>
                <th className="px-6 py-4">Điểm đến</th>
                <th className="px-6 py-4">Số người</th>
                <th className="px-6 py-4">Ưu đãi</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">Đang tải...</td></tr>
              ) : filteredPackages.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">Không tìm thấy gói du lịch nào.</td></tr>
              ) : paginatedPackages.map((pkg, index) => {
                const openUpward = paginatedPackages.length > 2 ? index >= paginatedPackages.length - 3 : index > 0;
                return (
                  <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 min-w-[260px]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          {pkg.imageUrl && <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <strong className="text-slate-800 font-bold block">{pkg.name}</strong>
                          <span className="text-xs text-slate-400 block mt-0.5">/{pkg.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">{pkg.destination}</td>
                    <td className="px-6 py-4 text-slate-500">{pkg.peopleNote || (pkg.minPeople && pkg.maxPeople ? `${pkg.minPeople}-${pkg.maxPeople} khách` : "Chưa đặt")}</td>
                    <td className="px-6 py-4 text-slate-500">{pkg.offer?.title || "Không có"}</td>
                    <td className="px-6 py-4">
                      <div className="inline-block relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === pkg.id ? null : pkg.id); }}
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border outline-none transition-all hover:scale-105 active:scale-95 hover:shadow-sm ${getStatusClass(pkg.status)}`}
                        >
                          <span>{pkg.status}</span>
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {openDropdownId === pkg.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} />
                            <div className={`absolute left-0 w-36 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-40 animate-in fade-in duration-150 overflow-hidden ${openUpward ? "bottom-full mb-1.5 slide-in-from-bottom-2" : "top-full mt-1.5 slide-in-from-top-2"}`}>
                              {statusOptions.map((status) => (
                                <button key={status} onClick={(e) => { e.stopPropagation(); void handleUpdateStatus(pkg, status); }} className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-colors ${statusOptionClass(status)} ${pkg.status === status ? "bg-slate-50" : ""}`}>
                                  {status}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end items-center gap-2">
                        <Link href={`/admin/packages/${pkg.id}/detail`} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs">Landing Page</Link>
                        <button onClick={() => startEdit(pkg)} className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg" aria-label="Sửa gói du lịch"><svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
                        <button onClick={() => handleDelete(pkg.id)} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg" aria-label="Xóa gói du lịch"><svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-xs font-medium text-slate-500">
              Hiển thị <span className="font-bold text-slate-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> đến <span className="font-bold text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredPackages.length)}</span> trong số <span className="font-bold text-slate-700">{filteredPackages.length}</span> gói
            </p>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <div className="flex items-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`min-w-[32px] h-8 text-xs font-bold rounded-lg transition-all ${currentPage === page ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-emerald-600"}`}>{page}</button>
                ))}
              </div>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {(showAddModal || showEditModal) && (
        <PackageModal
          title={showAddModal ? "Thêm gói du lịch mới" : "Chỉnh sửa gói du lịch"}
          submitLabel={showAddModal ? "Tạo gói du lịch" : "Lưu thay đổi"}
          saving={saving}
          form={form}
          translations={packageTranslations}
          setTranslations={setPackageTranslations}
          collections={collections}
          selectedCollectionIds={selectedCollectionIds}
          onToggleCollection={(collectionId) => setSelectedCollectionIds((current) => current.includes(collectionId) ? current.filter((id) => id !== collectionId) : [...current, collectionId])}
          updateField={updateField}
          onClose={() => { setShowAddModal(false); setShowEditModal(false); }}
          onSubmit={(event) => submitPackage(event, showAddModal ? "create" : "edit")}
        />
      )}
    </div>
  );
}

function PackageModal({ title, submitLabel, saving, form, translations, setTranslations, collections, selectedCollectionIds, onToggleCollection, updateField, onClose, onSubmit }: { title: string; submitLabel: string; saving: boolean; form: typeof defaultForm; translations: PackageTranslationMap; setTranslations: React.Dispatch<React.SetStateAction<PackageTranslationMap>>; collections: PackageCollectionOption[]; selectedCollectionIds: number[]; onToggleCollection: (collectionId: number) => void; updateField: (f: keyof typeof defaultForm, v: string) => void; onClose: () => void; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
          <h3 className="text-lg font-black text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors" aria-label="Đóng">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Tên gói du lịch"><input required value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Ví dụ: Kỳ nghỉ gia đình Phú Quốc" className={inputClass} /></Field>
            <Field label="Đường dẫn (Slug)"><input value={form.slug} onChange={(e) => updateField("slug", e.target.value)} placeholder="ky-nghi-phu-quoc (để trống tự tạo)" className={inputClass} /></Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Điểm đến"><input required value={form.destination} onChange={(e) => updateField("destination", e.target.value)} placeholder="Ví dụ: Phú Quốc" className={inputClass} /></Field>
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Danh mục hiển thị</label>
              <div className="grid grid-cols-1 gap-3">
                {collections.map((collection) => (
                  <label key={collection.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${selectedCollectionIds.includes(collection.id) ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200"}`}>
                    <input type="checkbox" checked={selectedCollectionIds.includes(collection.id)} onChange={() => onToggleCollection(collection.id)} className="mt-0.5 h-4 w-4 accent-emerald-600" />
                    <span><strong className="block text-sm font-bold">{collection.name}</strong><span className="block text-xs text-slate-500 mt-0.5">{collection.slug}</span></span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500">Một gói có thể thuộc nhiều danh mục cùng lúc.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Ưu đãi cho gói này (Tùy chọn)</label>
            <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-4 space-y-4">
              <Field label="Tên chương trình ưu đãi" subtle><input value={form.offerTitle} onChange={(e) => updateField("offerTitle", e.target.value)} placeholder="Ví dụ: Giảm 15% mùa hè, tặng voucher 500k..." className={offerInputClass} /></Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Mô tả chi tiết" subtle><input value={form.offerDescription} onChange={(e) => updateField("offerDescription", e.target.value)} placeholder="Nhập thêm mô tả nếu cần" className={offerInputClass} /></Field>
                <Field label="Hạn sử dụng" subtle><input type="date" value={form.offerValidUntil} onChange={(e) => updateField("offerValidUntil", e.target.value)} className={offerInputClass} /></Field>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Thời lượng"><input value={form.duration} onChange={(e) => updateField("duration", e.target.value)} placeholder="Ví dụ: 3 ngày 2 đêm" className={inputClass} /></Field>
            <Field label="Giá tour"><input value={form.price} onChange={(e) => updateField("price", e.target.value)} placeholder="Ví dụ: Từ 6.200.000đ" className={inputClass} /></Field>
          </div>

          <Field label="Mô tả card"><textarea value={form.summary} onChange={(e) => updateField("summary", e.target.value)} placeholder="Mô tả ngắn hiển thị trên thẻ (card)..." rows={2} className={`${inputClass} resize-none`} /></Field>
          <Field label="Mô tả ngắn trang chi tiết"><textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Mô tả mở rộng hơn trên trang chi tiết..." rows={3} className={`${inputClass} resize-none`} /></Field>

          <PackageTranslationFields translations={translations} onChange={(locale, field, value) => setTranslations((current) => ({ ...current, [locale]: { ...(current[locale] || {}), [field]: value } }))} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Số người tối thiểu"><input type="number" min="1" value={form.minPeople} onChange={(e) => updateField("minPeople", e.target.value)} placeholder="VD: 2" className={inputClass} /></Field>
            <Field label="Số người tối đa"><input type="number" min="1" value={form.maxPeople} onChange={(e) => updateField("maxPeople", e.target.value)} placeholder="VD: 15" className={inputClass} /></Field>
            <Field label="Ghi chú số người"><input value={form.peopleNote} onChange={(e) => updateField("peopleNote", e.target.value)} placeholder="VD: Nhóm nhỏ 4-8 khách" className={inputClass} /></Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Ảnh đại diện (URL)"><input value={form.imageUrl} onChange={(e) => updateField("imageUrl", e.target.value)} placeholder="URL hình ảnh (https://... hoặc /images/...)" className={inputClass} /></Field>
            <Field label="Trạng thái gói">
              <select value={form.status} onChange={(e) => updateField("status", e.target.value)} className={inputClass}>
                {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white z-10 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all">Hủy bỏ</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md disabled:opacity-60 transition-all flex items-center gap-2">{saving ? "Đang lưu..." : submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, subtle = false, children }: { label: string; subtle?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className={`text-xs font-extrabold uppercase tracking-widest block ${subtle ? "text-emerald-700" : "text-slate-500"}`}>{label}</label>
      {children}
    </div>
  );
}

function PackageTranslationFields({ translations, onChange }: { translations: PackageTranslationMap; onChange: (locale: "en" | "zh-CN", field: PackageTranslationField, value: string) => void }) {
  const locales = [
    { code: "en" as const, label: "English (EN)" },
    { code: "zh-CN" as const, label: "Chinese Simplified (ZH)" },
  ];

  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-4">
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Bản dịch gói du lịch</h4>
        <p className="text-xs text-slate-500 mt-1">Cần nhập đủ tiếng Anh và tiếng Trung để website hiển thị đúng theo ngôn ngữ đã chọn.</p>
      </div>
      {locales.map((locale) => (
        <div key={locale.code} className="rounded-xl border border-white bg-white/80 p-4 space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-slate-600">{locale.label}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input required value={translations[locale.code]?.name || ""} onChange={(event) => onChange(locale.code, "name", event.target.value)} placeholder="Package name" className={`${inputClass} bg-white`} />
            <input required value={translations[locale.code]?.destination || ""} onChange={(event) => onChange(locale.code, "destination", event.target.value)} placeholder="Destination" className={`${inputClass} bg-white`} />
            <input required value={translations[locale.code]?.duration || ""} onChange={(event) => onChange(locale.code, "duration", event.target.value)} placeholder="Duration" className={`${inputClass} bg-white`} />
            <input value={translations[locale.code]?.peopleNote || ""} onChange={(event) => onChange(locale.code, "peopleNote", event.target.value)} placeholder="People note" className={`${inputClass} bg-white`} />
          </div>
          <textarea required rows={2} value={translations[locale.code]?.summary || ""} onChange={(event) => onChange(locale.code, "summary", event.target.value)} placeholder="Card summary" className={`${inputClass} bg-white resize-y`} />
          <textarea required rows={3} value={translations[locale.code]?.description || ""} onChange={(event) => onChange(locale.code, "description", event.target.value)} placeholder="Detail page description" className={`${inputClass} bg-white resize-y`} />
        </div>
      ))}
    </section>
  );
}
