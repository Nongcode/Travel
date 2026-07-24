"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../../components/admin/AdminContext";
import { useRouter } from "next/navigation";
import AdminAssetUploadField from "../../../components/admin/AdminAssetUploadField";

export default function SeoAdminPage() {
  const { seoConfigs, isAuthenticated, updateSeoConfig } = useAdmin();
  const router = useRouter();

  // Edit Modal States
  const [editingConfigId, setEditingConfigId] = useState<number | null>(null);
  const [editPageName, setEditPageName] = useState("");
  const [editUrlPath, setEditUrlPath] = useState("");
  const [editMetaTitle, setEditMetaTitle] = useState("");
  const [editMetaDescription, setEditMetaDescription] = useState("");
  const [editMetaKeywords, setEditMetaKeywords] = useState("");
  const [editOgImage, setEditOgImage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleOpenEditModal = (id: number) => {
    const config = seoConfigs.find((c) => c.id === id);
    if (!config) return;
    setEditingConfigId(id);
    setEditPageName(config.page);
    setEditUrlPath(config.urlPath);
    setEditMetaTitle(config.metaTitle);
    setEditMetaDescription(config.metaDescription);
    setEditMetaKeywords(config.metaKeywords);
    setEditOgImage(config.ogImage || "");
  };

  const handleSaveSeoConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingConfigId === null || !editUrlPath.trim() || !editMetaTitle.trim()) return;

    updateSeoConfig(editingConfigId, {
      urlPath: editUrlPath,
      metaTitle: editMetaTitle,
      metaDescription: editMetaDescription,
      metaKeywords: editMetaKeywords,
      ogImage: editOgImage,
    });

    setEditingConfigId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <section>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
          Cấu hình SEO & Meta Tags
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Cấu hình thẻ tiêu đề, mô tả và từ khóa tìm kiếm (SEO) cho từng trang tĩnh trên website để tối ưu hóa thứ hạng Google.
        </p>
      </section>

      {/* SEO Configurations Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {seoConfigs.map((config) => (
          <div
            key={config.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
          >
            <div className="space-y-3">
              {/* Card Title & URL Path */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">{config.page}</h3>
                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] font-bold rounded">
                    {config.urlPath}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenEditModal(config.id)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100/50 transition-colors"
                >
                  Cấu hình SEO
                </button>
              </div>

              {/* Meta Tags summary preview */}
              <div className="space-y-2.5 pt-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                    Meta Title (Tiêu đề)
                  </span>
                  <p className="text-xs text-slate-700 font-semibold line-clamp-1">{config.metaTitle}</p>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                    Meta Description (Mô tả)
                  </span>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {config.metaDescription || "Chưa cấu hình mô tả SEO."}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                    Từ khóa tìm kiếm (Keywords)
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {config.metaKeywords
                      ? config.metaKeywords.split(",").map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-semibold rounded border border-slate-100"
                          >
                            {kw.trim()}
                          </span>
                        ))
                      : "Không có từ khóa"}
                  </div>
                </div>
              </div>
            </div>

            {/* OG Image preview */}
            {config.ogImage && (
              <div className="pt-3 border-t border-slate-50">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                  Ảnh chia sẻ mạng xã hội (OpenGraph Image)
                </span>
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={config.ogImage}
                    alt="Social Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Edit SEO Config Modal Dialog */}
      {editingConfigId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">Cấu hình SEO: {editPageName}</h3>
              <button
                onClick={() => setEditingConfigId(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveSeoConfig} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Đường dẫn trang (URL Path)</label>
                <input
                  type="text"
                  required
                  value={editUrlPath}
                  onChange={(e) => setEditUrlPath(e.target.value)}
                  placeholder="Ví dụ: /goi-du-lich"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all font-semibold text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Tiêu đề SEO (Meta Title)</label>
                <input
                  type="text"
                  required
                  value={editMetaTitle}
                  onChange={(e) => setEditMetaTitle(e.target.value)}
                  placeholder="Tiêu đề trang (dưới 60 ký tự)"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all font-semibold text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Mô tả SEO (Meta Description)</label>
                <textarea
                  rows={3}
                  value={editMetaDescription}
                  onChange={(e) => setEditMetaDescription(e.target.value)}
                  placeholder="Mô tả tóm tắt nội dung trang (dưới 160 ký tự)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all font-medium text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Từ khóa SEO (ngăn cách bởi dấu phẩy)</label>
                <input
                  type="text"
                  value={editMetaKeywords}
                  onChange={(e) => setEditMetaKeywords(e.target.value)}
                  placeholder="Ví dụ: sapa tours, travel guide vietnam, private holiday"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all font-semibold text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Link ảnh chia sẻ OpenGraph Image (URL)</label>
                <AdminAssetUploadField value={editOgImage} onChange={setEditOgImage} placeholder="URL OpenGraph hoac upload len Cloudinary" inputClassName="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all font-semibold text-slate-700 animate-in fade-in" previewAlt="Preview OpenGraph" />
                {editOgImage && (
                  <div className="mt-2 aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                    <img
                      src={editOgImage}
                      alt="Preview OpenGraph"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingConfigId(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition-all"
                >
                  Lưu cấu hình SEO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
