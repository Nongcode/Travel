"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdmin } from "../../components/admin/AdminContext";

type AdminLocalSpecialty = {
  id: number;
  slug: string;
  name: string;
  type: string;
  destinationId: number | null;
  destinationName: string;
  description: string;
  imageUrl: string;
  priceText: string;
  whereToBuy: string;
  status: string;
  hasDetail?: boolean;
  translations?: LocalSpecialtyTranslationMap;
};

type LocalSpecialtyTranslationMap = Record<string, Record<string, string>>;
const emptyTranslations: LocalSpecialtyTranslationMap = {
  en: { name: "", description: "" },
  "zh-CN": { name: "", description: "" },
};

function cloneTranslations(value?: LocalSpecialtyTranslationMap): LocalSpecialtyTranslationMap {
  return {
    en: { ...emptyTranslations.en, ...(value?.en || {}) },
    "zh-CN": { ...emptyTranslations["zh-CN"], ...(value?.["zh-CN"] || {}) },
  };
}

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600";

const statusOptions = ["Hiển thị", "Ẩn"];
const typeOptions = [{ value: "FOOD", label: "Món ăn" }, { value: "HANDICRAFT", label: "Sản phẩm thủ công" }];

const defaultForm = {
  name: "",
  slug: "",
  type: "FOOD",
  destinationName: "",
  description: "",
  imageUrl: "",
  priceText: "",
  whereToBuy: "",
  status: "Hiển thị",
};

function getStatusClass(status: string) {
  switch (status) {
    case "Hiển thị": return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80";
    case "Ẩn": return "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200/80";
    default: return "bg-neutral-900 text-neutral-100 border-neutral-800 hover:bg-neutral-800/80";
  }
}

function statusOptionClass(status: string) {
  switch (status) {
    case "Hiển thị": return "text-emerald-700 hover:bg-emerald-50/50";
    case "Ẩn": return "text-slate-700 hover:bg-slate-50/50";
    default: return "text-neutral-900 hover:bg-neutral-100";
  }
}

export default function LocalSpecialtiesAdminPage() {
  const { isAuthenticated } = useAdmin();
  const router = useRouter();
  const [specialties, setSpecialties] = useState<AdminLocalSpecialty[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [translations, setTranslations] = useState<LocalSpecialtyTranslationMap>(() => cloneTranslations());
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
      const res = await fetch("/api/admin/local-specialties", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không tải được danh sách đặc sản.");
      setSpecialties(Array.isArray(data.localSpecialties) ? data.localSpecialties : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) void loadData();
  }, [isAuthenticated]);

  const filteredSpecialties = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return specialties;
    return specialties.filter((item) =>
      [item.name, item.destinationName, item.description, item.whereToBuy]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [specialties, searchQuery]);

  useEffect(() => setCurrentPage(1), [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredSpecialties.length / ITEMS_PER_PAGE));
  const paginatedSpecialties = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSpecialties.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSpecialties, currentPage]);

  function updateField(field: keyof typeof defaultForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startAdd() {
    setForm(defaultForm);
    setTranslations(cloneTranslations());
    setError("");
    setShowAddModal(true);
  }

  function startEdit(item: AdminLocalSpecialty) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      slug: item.slug,
      type: item.type || "FOOD",
      destinationName: item.destinationName || "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      priceText: item.priceText || "",
      whereToBuy: item.whereToBuy || "",
      status: item.status || "Hiển thị",
    });
    setTranslations(cloneTranslations(item.translations));
    setError("");
    setShowEditModal(true);
  }

  async function submitSpecialty(event: React.FormEvent, mode: "create" | "edit") {
    event.preventDefault();
    if (!form.name.trim()) return;
    if (mode === "edit" && editingId === null) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/local-specialties", {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(mode === "edit" ? { id: editingId } : {}),
          ...form,
          translations,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || (mode === "create" ? "Không tạo được đặc sản." : "Không cập nhật được đặc sản."));
      setShowAddModal(false);
      setShowEditModal(false);
      setForm(defaultForm);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : (mode === "create" ? "Không tạo được đặc sản." : "Không cập nhật được đặc sản."));
    } finally {
      setSaving(false);
    }
  }

  async function updateSpecialtyStatus(id: number, nextStatus: string) {
    try {
      const res = await fetch("/api/admin/local-specialties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không cập nhật được trạng thái.");
      await loadData();
      setOpenDropdownId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được trạng thái.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa đặc sản này không?")) return;
    try {
      const res = await fetch(`/api/admin/local-specialties?id=${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không xóa được đặc sản.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được đặc sản.");
    }
  }

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Đặc sản địa phương</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Quản lý món ăn và sản phẩm thủ công đặc trưng.</p>
        </div>
        <button onClick={startAdd} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all w-full sm:w-auto">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Thêm đặc sản
        </button>
      </section>

      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
        <div className="px-3 py-1.5 bg-emerald-50 rounded-lg text-emerald-700 font-bold text-sm">{specialties.length} mục</div>
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm tên, điểm đến, nơi mua..." className="w-full sm:max-w-md px-4 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-xs uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Phân loại</th>
                <th className="px-6 py-4">Điểm đến</th>
                <th className="px-6 py-4">Giá tham khảo</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">Đang tải...</td></tr>
              ) : filteredSpecialties.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">Không tìm thấy đặc sản nào.</td></tr>
              ) : paginatedSpecialties.map((item, index) => {
                const openUpward = paginatedSpecialties.length > 2 ? index >= paginatedSpecialties.length - 3 : index > 0;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 min-w-[260px]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <strong className="text-slate-800 font-bold block">{item.name}</strong>
                          <span className="text-xs text-slate-400 block mt-0.5">/{item.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">{item.type === "FOOD" ? "Món ăn" : "Đồ thủ công"}</td>
                    <td className="px-6 py-4 text-slate-500">{item.destinationName || "Chưa đặt"}</td>
                    <td className="px-6 py-4 text-slate-500">{item.priceText || "Không có"}</td>
                    <td className="px-6 py-4">
                      <div className="inline-block relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === item.id ? null : item.id); }}
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border outline-none transition-all hover:scale-105 active:scale-95 hover:shadow-sm ${getStatusClass(item.status)}`}
                        >
                          <span>{item.status}</span>
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {openDropdownId === item.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} />
                            <div className={`absolute left-0 w-36 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-40 animate-in fade-in duration-150 overflow-hidden ${openUpward ? "bottom-full mb-1.5 slide-in-from-bottom-2" : "top-full mt-1.5 slide-in-from-top-2"}`}>
                              {statusOptions.map((status) => (
                                <button key={status} onClick={(e) => { e.stopPropagation(); void updateSpecialtyStatus(item.id, status); }} className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-colors ${statusOptionClass(status)} ${item.status === status ? "bg-slate-50" : ""}`}>
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
                        <button onClick={() => startEdit(item)} className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg" aria-label="Sửa"><svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
                        <Link href={`/admin/local-specialties/${item.id}/detail`} className={`p-1.5 rounded-lg ${item.hasDetail ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`} aria-label="Chi tiết"><svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></Link>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg" aria-label="Xóa"><svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg></button>
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
              Hiển thị <span className="font-bold text-slate-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> đến <span className="font-bold text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredSpecialties.length)}</span> trong số <span className="font-bold text-slate-700">{filteredSpecialties.length}</span> mục
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
        <SpecialtyModal
          title={showAddModal ? "Thêm đặc sản mới" : "Chỉnh sửa đặc sản"}
          submitLabel={showAddModal ? "Tạo đặc sản" : "Lưu thay đổi"}
          saving={saving}
          form={form}
          updateField={updateField}
          onClose={() => { setShowAddModal(false); setShowEditModal(false); }}
          onSubmit={(event) => submitSpecialty(event, showAddModal ? "create" : "edit")}
          translations={translations}
          setTranslations={setTranslations}
        />
      )}
    </div>
  );
}

function SpecialtyModal({ title, submitLabel, saving, form, updateField, onClose, onSubmit, translations, setTranslations }: { title: string; submitLabel: string; saving: boolean; form: typeof defaultForm; updateField: (f: keyof typeof defaultForm, v: string) => void; onClose: () => void; onSubmit: (e: React.FormEvent) => void; translations: LocalSpecialtyTranslationMap; setTranslations: React.Dispatch<React.SetStateAction<LocalSpecialtyTranslationMap>> }) {
  const [activeTab, setActiveTab] = useState("vi");

  function updateTranslation(locale: string, field: string, value: string) {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: value },
    }));
  }
  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
          <h3 className="text-lg font-black text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors" aria-label="Đóng">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="flex px-6 pt-4 gap-2 bg-slate-50/50">
          <button type="button" onClick={() => setActiveTab("vi")} className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${activeTab === "vi" ? "bg-white text-emerald-700 border-t border-l border-r border-slate-200" : "text-slate-500 hover:bg-slate-100"}`}>Tiếng Việt</button>
          <button type="button" onClick={() => setActiveTab("en")} className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${activeTab === "en" ? "bg-white text-blue-700 border-t border-l border-r border-slate-200" : "text-slate-500 hover:bg-slate-100"}`}>Tiếng Anh (EN)</button>
          <button type="button" onClick={() => setActiveTab("zh-CN")} className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${activeTab === "zh-CN" ? "bg-white text-rose-700 border-t border-l border-r border-slate-200" : "text-slate-500 hover:bg-slate-100"}`}>Tiếng Trung (ZH)</button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "vi" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Tên đặc sản / món ăn"><input required value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="VD: Nem chua Thanh Hóa" className={inputClass} /></Field>
                <Field label="Đường dẫn (Slug)"><input value={form.slug} onChange={(e) => updateField("slug", e.target.value)} placeholder="nem-chua (để trống tự tạo)" className={inputClass} /></Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Phân loại">
                  <select value={form.type} onChange={(e) => updateField("type", e.target.value)} className={inputClass}>
                    {typeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </Field>
                <Field label="Điểm đến (Tỉnh/Thành phố)"><input required value={form.destinationName} onChange={(e) => updateField("destinationName", e.target.value)} placeholder="VD: Thanh Hóa" className={inputClass} /></Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Giá tham khảo"><input value={form.priceText} onChange={(e) => updateField("priceText", e.target.value)} placeholder="VD: 50.000đ - 100.000đ" className={inputClass} /></Field>
                <Field label="Nơi mua / Thưởng thức"><input value={form.whereToBuy} onChange={(e) => updateField("whereToBuy", e.target.value)} placeholder="Nhập địa chỉ hoặc tên quán" className={inputClass} /></Field>
              </div>

              <Field label="Mô tả chi tiết"><textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Mô tả về nguồn gốc, hương vị..." rows={4} className={`${inputClass} resize-none`} /></Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Ảnh đại diện (URL)"><input value={form.imageUrl} onChange={(e) => updateField("imageUrl", e.target.value)} placeholder="URL hình ảnh (https://... hoặc /images/...)" className={inputClass} /></Field>
                <Field label="Trạng thái">
                  <select value={form.status} onChange={(e) => updateField("status", e.target.value)} className={inputClass}>
                    {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </Field>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 mb-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-700">
                Nhập bản dịch <strong>{activeTab === "en" ? "Tiếng Anh" : "Tiếng Trung"}</strong>. Các trường để trống sẽ hiển thị ngôn ngữ gốc.
              </div>
              <Field label="Tên đặc sản"><input value={translations[activeTab]?.name || ""} onChange={(e) => updateTranslation(activeTab, "name", e.target.value)} placeholder="Translation for name..." className={inputClass} /></Field>
              <Field label="Mô tả chi tiết"><textarea value={translations[activeTab]?.description || ""} onChange={(e) => updateTranslation(activeTab, "description", e.target.value)} placeholder="Translation for description..." rows={4} className={`${inputClass} resize-none`} /></Field>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white z-10 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all">Hủy bỏ</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md disabled:opacity-60 transition-all flex items-center gap-2">{saving ? "Đang lưu..." : submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-extrabold uppercase tracking-widest block text-slate-500">{label}</label>
      {children}
    </div>
  );
}
