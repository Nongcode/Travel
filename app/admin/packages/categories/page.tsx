/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "../../../components/admin/AdminContext";

type PackageCategory = {
  id: number;
  name: string;
  slug: string; // Used for eyebrow
  description: string;
  packageCount: number;
  accent?: string;
};

const emptyForm = {
  name: "",
  description: "",
};

export default function PackageCategoriesPage() {
  const { isAuthenticated } = useAdmin();
  const router = useRouter();

  const [categories, setCategories] = useState<PackageCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addSlug, setAddSlug] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addAccent, setAddAccent] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAccent, setEditAccent] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!isAuthenticated) router.push("/admin/login");
  }, [isAuthenticated, router]);

  async function loadCategories() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/packages/categories", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không tải được danh mục gói du lịch.");
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được danh mục gói du lịch.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) void loadCategories();
  }, [isAuthenticated]);

  const filteredCategories = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return categories;
    return categories.filter((category) =>
      [category.name, category.slug, category.description].join(" ").toLowerCase().includes(keyword),
    );
  }, [categories, searchQuery]);

  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  const resetAddForm = () => {
    setAddName("");
    setAddSlug("");
    setAddDescription("");
    setAddAccent("");
    setError("");
  };

  async function handleAddSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!addName.trim()) return;

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/packages/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName, slug: addSlug, description: addDescription, accent: addAccent }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không lưu được danh mục gói du lịch.");
      resetAddForm();
      setShowAddModal(false);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được danh mục gói du lịch.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(category: PackageCategory) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditSlug(category.slug || "");
    setEditDescription(category.description || "");
    setEditAccent(category.accent || "");
    setError("");
    setShowEditModal(true);
  }

  async function handleEditSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (editingId === null || !editName.trim()) return;

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/packages/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name: editName, slug: editSlug, description: editDescription, accent: editAccent }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không lưu được danh mục gói du lịch.");
      setEditingId(null);
      setShowEditModal(false);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được danh mục gói du lịch.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: PackageCategory) {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) return;

    setError("");
    try {
      const res = await fetch(`/api/admin/packages/categories?id=${category.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không xóa được danh mục gói du lịch.");
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được danh mục gói du lịch.");
    }
  }

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-[24px] font-bold text-slate-800 tracking-tight leading-7">Quản lý Danh mục gói du lịch</h2>
          <p className="text-xs text-slate-500 mt-1">
            Phân loại các hình thức và phong cách du lịch phục vụ du khách quốc tế như mạo hiểm, nghỉ dưỡng, văn hóa hoặc wellness.
          </p>
        </div>
        <button
          onClick={() => {
            resetAddForm();
            setShowAddModal(true);
          }}
          className="w-fit flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm danh mục mới
        </button>
      </div>

      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500 font-semibold">Danh mục hiện có: <span className="font-mono text-slate-700">{categories.length}</span></div>
        <div className="relative w-full lg:max-w-xs shrink-0">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm danh mục..."
            className="w-full pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-xs uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Tên danh mục (Title)</th>
                <th className="px-6 py-4">Tiêu đề phụ (Eyebrow)</th>
                <th className="px-6 py-4">Màu nhấn (Accent)</th>
                <th className="px-6 py-4">Số gói</th>
                <th className="px-6 py-4">Mô tả</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">Đang tải danh mục...</td></tr>
              ) : currentCategories.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">Không tìm thấy danh mục nào.</td></tr>
              ) : (
                currentCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">{category.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{category.slug || "-"}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{category.accent || "-"}</td>
                    <td className="px-6 py-4"><span className="inline-flex px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-black">{category.packageCount}</span></td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-[220px] truncate">{category.description || "Không có mô tả"}</td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button onClick={() => startEdit(category)} className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer inline-flex items-center" title="Sửa">
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={() => void handleDelete(category)} className="p-1.5 hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer inline-flex items-center" title="Xóa">
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/75 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} trong tổng số {totalItems} danh mục</span>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentPage === page ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <CategoryModal
          title="Thêm danh mục trang chủ mới"
          submitLabel="Tạo danh mục"
          saving={saving}
          name={addName}
          slug={addSlug}
          description={addDescription}
          accent={addAccent}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSubmit}
          onNameChange={setAddName}
          onSlugChange={setAddSlug}
          onDescriptionChange={setAddDescription}
          onAccentChange={setAddAccent}
        />
      )}

      {showEditModal && (
        <CategoryModal
          title="Chỉnh sửa danh mục trang chủ"
          submitLabel="Lưu thay đổi"
          saving={saving}
          name={editName}
          slug={editSlug}
          description={editDescription}
          accent={editAccent}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
          onNameChange={setEditName}
          onSlugChange={setEditSlug}
          onDescriptionChange={setEditDescription}
          onAccentChange={setEditAccent}
        />
      )}
    </div>
  );
}

type CategoryModalProps = {
  title: string;
  submitLabel: string;
  saving: boolean;
  name: string;
  slug: string;
  description: string;
  accent: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onNameChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAccentChange: (value: string) => void;
};

function CategoryModal({
  title,
  submitLabel,
  saving,
  name,
  slug,
  description,
  accent,
  onClose,
  onSubmit,
  onNameChange,
  onSlugChange,
  onDescriptionChange,
  onAccentChange,
}: CategoryModalProps) {
  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-black text-lg tracking-tight">{title}</h3>
            <p className="text-xs text-emerald-200/80 mt-0.5">Quản lý các danh mục gói du lịch.</p>
          </div>
          <button onClick={onClose} type="button" className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-100 hover:text-white transition-all cursor-pointer">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Tên danh mục (Title)</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ví dụ: Wellness & Spa, Adventure..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Tiêu đề phụ (Eyebrow)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="Ví dụ: Family travel, Trips with friends..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Mô tả danh mục</label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Mô tả phong cách du lịch bằng tiếng Anh hoặc tiếng Việt..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Màu nhấn (Accent)</label>
            <input
              type="text"
              value={accent}
              onChange={(e) => onAccentChange(e.target.value)}
              placeholder="Ví dụ: family, youth, vietnam..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white z-10 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer">
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-60 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all cursor-pointer"
            >
              {saving ? "Đang lưu..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}