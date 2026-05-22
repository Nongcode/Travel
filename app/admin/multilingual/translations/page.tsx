"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

export default function TranslationsPage() {
  const { translations, languages, isAuthenticated, addTranslation, updateTranslation, removeTranslation } = useAdmin();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");

  // Add key Form State
  const [newKey, setNewKey] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit Translation Modal State
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editingTranslations, setEditingTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // Filter active languages
  const activeLangs = languages.filter((l) => l.isActive);

  const handleCreateTranslationKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    // Initialize translations map with empty string for active languages
    const initialTransMap: Record<string, string> = {};
    activeLangs.forEach((lang) => {
      initialTransMap[lang.code] = "";
    });

    addTranslation({
      key: newKey.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      description: newDesc,
      translations: initialTransMap,
    });

    setNewKey("");
    setNewDesc("");
    setShowAddForm(false);
  };

  const handleStartEdit = (id: number) => {
    const item = translations.find((t) => t.id === id);
    if (item) {
      setEditingItem(id);
      // Clone existing translations or fallback to empty string
      const clonedMap: Record<string, string> = {};
      activeLangs.forEach((lang) => {
        clonedMap[lang.code] = item.translations[lang.code] || "";
      });
      setEditingTranslations(clonedMap);
    }
  };

  const handleSaveTranslationValues = () => {
    if (editingItem !== null) {
      updateTranslation(editingItem, {
        translations: editingTranslations,
      });
      setEditingItem(null);
    }
  };

  const handleTranslationValueChange = (code: string, value: string) => {
    setEditingTranslations((prev) => ({
      ...prev,
      [code]: value,
    }));
  };

  // Filter keys
  const filteredTranslations = translations.filter((t) => {
    const keyMatch = t.key.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
    // Also search inside language translations values
    const valueMatch = Object.values(t.translations).some((val) =>
      val.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return keyMatch || descMatch || valueMatch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Quản lý Bản Dịch (Static Keys)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các từ khóa, chuỗi văn bản tĩnh trên giao diện chính của website du lịch.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all self-start sm:self-center"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {showAddForm ? "Ẩn Form" : "Tạo khóa tĩnh"}
        </button>
      </section>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm max-w-lg">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
            Đăng ký Từ khóa tĩnh mới
          </h3>
          <form onSubmit={handleCreateTranslationKey} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Từ khóa (Key)</label>
              <input
                type="text"
                required
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Ví dụ: explore_button_label, header_welcome"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Mô tả vị trí / tính năng</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Ví dụ: Nút hành động tại biểu ngữ trang chủ"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition-all"
              >
                Tạo khóa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Control Search */}
      <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between">
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Danh sách khóa ({translations.length})</h4>
        <div className="relative w-full max-w-xs shrink-0">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm khóa hoặc cụm bản dịch..."
            className="w-full pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700"
          />
        </div>
      </section>

      {/* Translations List Table */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Mã Khóa (Key) & Mô tả</th>
                {activeLangs.map((lang) => (
                  <th key={lang.code} className="px-6 py-4">
                    {lang.flag} {lang.name} ({lang.code})
                  </th>
                ))}
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
              {filteredTranslations.length === 0 ? (
                <tr>
                  <td colSpan={2 + activeLangs.length} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy bản dịch nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredTranslations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <strong className="text-emerald-800 font-bold block font-mono text-xs">{item.key}</strong>
                      <span className="text-xs text-slate-400 font-medium block mt-0.5">{item.description}</span>
                    </td>
                    {activeLangs.map((lang) => (
                      <td key={lang.code} className="px-6 py-4 font-medium text-slate-800 max-w-[200px] truncate">
                        {item.translations[lang.code] ? (
                          <span>{item.translations[lang.code]}</span>
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
                          onClick={() => handleStartEdit(item.id)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold rounded-lg text-xs transition-colors"
                        >
                          Dịch
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Xóa khóa ${item.key}?`)) {
                              removeTranslation(item.id);
                            }
                          }}
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
      </section>

      {/* Editing Dialog Modal */}
      {editingItem !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">
                Dịch Từ khóa: <span className="font-mono text-emerald-800 font-black">{translations.find((t) => t.id === editingItem)?.key}</span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 font-bold">
                Mô tả vị trí: {translations.find((t) => t.id === editingItem)?.description}
              </p>
              
              <div className="space-y-4">
                {activeLangs.map((lang) => (
                  <div key={lang.code} className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                      <span>{lang.flag}</span>
                      <span>Bản dịch ({lang.name} - {lang.code})</span>
                    </label>
                    <input
                      type="text"
                      value={editingTranslations[lang.code] || ""}
                      onChange={(e) => handleTranslationValueChange(lang.code, e.target.value)}
                      placeholder={`Nhập bản dịch ${lang.name}...`}
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
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition-all"
                >
                  Lưu bản dịch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
