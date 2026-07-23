/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "../../../components/admin/AdminContext";

type Language = {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  flag?: string | null;
  isActive: boolean;
  isDefault: boolean;
};

type StaticTranslation = {
  id: number;
  namespace: string;
  key: string;
  description: string;
  translations: Record<string, string>;
};

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_.-]+/g, "_").replace(/^_+|_+$/g, "");
}

function emptyTranslations(languages: Language[]) {
  return Object.fromEntries(languages.map((language) => [language.code, ""]));
}

export default function TranslationsPage() {
  const { isAuthenticated } = useAdmin();
  const router = useRouter();

  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<StaticTranslation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showAddForm, setShowAddForm] = useState(false);
  const [newNamespace, setNewNamespace] = useState("common");
  const [newKey, setNewKey] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const [editingItem, setEditingItem] = useState<StaticTranslation | null>(null);
  const [editingTranslations, setEditingTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) router.push("/admin/login");
  }, [isAuthenticated, router]);

  const activeLanguages = useMemo(() => languages.filter((language) => language.isActive), [languages]);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError("");
    try {
      const [languagesRes, translationsRes] = await Promise.all([
        fetch("/api/admin/languages", { cache: "no-store" }),
        fetch("/api/admin/static-translations", { cache: "no-store" }),
      ]);

      const languagesData = await languagesRes.json().catch(() => ({}));
      const translationsData = await translationsRes.json().catch(() => ({}));

      if (!languagesRes.ok) throw new Error(languagesData.error || "Không tải được danh sách ngôn ngữ.");
      if (!translationsRes.ok) throw new Error(translationsData.error || "Không tải được danh sách bản dịch.");

      setLanguages(Array.isArray(languagesData.languages) ? languagesData.languages : []);
      setTranslations(Array.isArray(translationsData.translations) ? translationsData.translations.filter(Boolean) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu bản dịch.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Reset trang khi tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredTranslations = translations.filter((item) => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return true;
    const haystack = [
      item.namespace,
      item.key,
      item.description,
      ...Object.values(item.translations || {}),
    ].join(" ").toLowerCase();
    return haystack.includes(keyword);
  });

  // Phân trang
  const totalItems = filteredTranslations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTranslations = useMemo(() => {
    return filteredTranslations.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredTranslations, indexOfFirstItem, indexOfLastItem]);

  // Điều chỉnh trang hiện tại nếu vượt quá tổng số trang sau khi lọc/xóa
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  if (!isAuthenticated) return null;
  async function saveTranslation(payload: {
    namespace: string;
    key: string;
    description: string;
    translations: Record<string, string>;
  }) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/static-translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không lưu được bản dịch.");
      await loadData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được bản dịch.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateTranslationKey(event: React.FormEvent) {
    event.preventDefault();
    const key = normalizeKey(newKey);
    const namespace = normalizeKey(newNamespace) || "common";
    if (!key) return;

    const created = await saveTranslation({
      namespace,
      key,
      description: newDesc.trim(),
      translations: emptyTranslations(activeLanguages),
    });

    if (created) {
      setNewNamespace("common");
      setNewKey("");
      setNewDesc("");
      setShowAddForm(false);
    }
  }

  function handleStartEdit(item: StaticTranslation) {
    const values = emptyTranslations(activeLanguages);
    for (const language of activeLanguages) {
      values[language.code] = item.translations?.[language.code] || "";
    }
    setEditingItem(item);
    setEditingTranslations(values);
  }

  async function handleSaveTranslationValues() {
    if (!editingItem) return;
    const saved = await saveTranslation({
      namespace: editingItem.namespace,
      key: editingItem.key,
      description: editingItem.description,
      translations: editingTranslations,
    });
    if (saved) setEditingItem(null);
  }

  async function handleDelete(item: StaticTranslation) {
    if (!confirm(`Xóa khóa ${item.namespace}.${item.key}?`)) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/static-translations?id=${item.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không xóa được khóa bản dịch.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được khóa bản dịch.");
    }
  }

  async function handleImportFile(file: File | null) {
    if (!file) return;
    setImporting(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/static-translations/import", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không import được file bản dịch.");
      alert(`?? import ${data.imported || 0} kh?a b?n d?ch.`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không import được file bản dịch.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Quản lý Bản dịch Tĩnh
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các từ khóa, nút, tiêu đề, menu và slogan cố định trên giao diện website.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((value) => !value)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all self-start sm:self-center"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {showAddForm ? "Ẩn form" : "Tạo khóa tĩnh"}
        </button>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {showAddForm && (
        <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm max-w-2xl">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
            Đăng ký khóa tĩnh mới
          </h3>
          <form onSubmit={handleCreateTranslationKey} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Namespace</label>
              <input
                type="text"
                value={newNamespace}
                onChange={(event) => setNewNamespace(event.target.value)}
                placeholder="Ví dụ: home, nav, footer"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Từ khóa</label>
              <input
                type="text"
                required
                value={newKey}
                onChange={(event) => setNewKey(event.target.value)}
                placeholder="Ví dụ: hero_cta_primary"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700 font-mono"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Mô tả vị trí / tính năng</label>
              <input
                type="text"
                value={newDesc}
                onChange={(event) => setNewDesc(event.target.value)}
                placeholder="Ví dụ: Nút chính trong hero trang chủ"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2 sm:col-span-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition-all disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Tạo khóa"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Import CSV/XLSX</h4>
          <p className="text-xs text-slate-500 mt-1">Cột bắt buộc: namespace, key, description, vi, en, zh.</p>
        </div>
        <label className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-700 cursor-pointer">
          {importing ? "Đang import..." : "Chọn file import"}
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            disabled={importing}
            onChange={(event) => handleImportFile(event.currentTarget.files?.[0] || null)}
            className="hidden"
          />
        </label>
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
            Danh sách khóa ({translations.length})
          </h4>
          {loading && <p className="text-xs text-slate-400 mt-1">Đang tải dữ liệu từ database...</p>}
        </div>
        <div className="relative w-full max-w-xs shrink-0">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm khóa hoặc cụm bản dịch..."
            className="w-full pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700"
          />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Mã khóa & mô tả</th>
                {activeLanguages.map((language) => (
                  <th key={language.code} className="px-6 py-4">
                    {language.flag} {language.name} ({language.code})
                  </th>
                ))}
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
              {!loading && totalItems === 0 ? (
                <tr>
                  <td colSpan={2 + activeLanguages.length} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy bản dịch nào phù hợp.
                  </td>
                </tr>
              ) : (
                currentTranslations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 min-w-[240px]">
                      <strong className="text-emerald-800 font-bold block font-mono text-xs">
                        {item.namespace}.{item.key}
                      </strong>
                      <span className="text-xs text-slate-400 font-medium block mt-0.5">{item.description}</span>
                    </td>
                    {activeLanguages.map((language) => (
                      <td key={language.code} className="px-6 py-4 font-medium text-slate-800 max-w-[260px] truncate">
                        {item.translations?.[language.code] ? (
                          <span>{item.translations[language.code]}</span>
                        ) : (
                          <span className="text-xs italic text-rose-500 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                            Chưa dịch
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold rounded-lg text-xs transition-colors"
                        >
                          Dịch
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
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

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/75 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} trong tổng số {totalItems} khóa tĩnh
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors cursor-pointer"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentPage === page
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </section>

      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">
                Dịch khóa: <span className="font-mono text-emerald-800 font-black">{editingItem.namespace}.{editingItem.key}</span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                aria-label="Đóng"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 font-bold">Mô tả vị trí: {editingItem.description || "Chưa có mô tả"}</p>

              <div className="space-y-4">
                {activeLanguages.map((language) => (
                  <div key={language.code} className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                      <span>{language.flag}</span>
                      <span>Bản dịch ({language.name} - {language.code})</span>
                    </label>
                    <input
                      type="text"
                      value={editingTranslations[language.code] || ""}
                      onChange={(event) => setEditingTranslations((prev) => ({ ...prev, [language.code]: event.target.value }))}
                      placeholder={`Nhập bản dịch ${language.name}...`}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveTranslationValues}
                  disabled={saving}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition-all disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : "Lưu bản dịch"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

