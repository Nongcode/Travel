"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAdmin } from "../../../../components/admin/AdminContext";
import AdminAssetUploadField from "../../../../components/admin/AdminAssetUploadField";

type DetailForm = {
  bannerImageUrl: string;
  overview: string;
  history: string;
  ingredients: string;
  howToUse: string;
  preservation: string;
  seoTitle: string;
  seoDescription: string;
};

type LocalSpecialtyTranslationMap = Record<string, Record<string, string>>;

const emptyForm: DetailForm = {
  bannerImageUrl: "",
  overview: "",
  history: "",
  ingredients: "",
  howToUse: "",
  preservation: "",
  seoTitle: "",
  seoDescription: "",
};

const emptyTranslations: LocalSpecialtyTranslationMap = {
  en: { overview: "", history: "", ingredients: "", howToUse: "", preservation: "" },
  "zh-CN": { overview: "", history: "", ingredients: "", howToUse: "", preservation: "" },
};

function cloneTranslations(value?: LocalSpecialtyTranslationMap): LocalSpecialtyTranslationMap {
  return {
    en: { ...emptyTranslations.en, ...(value?.en || {}) },
    "zh-CN": { ...emptyTranslations["zh-CN"], ...(value?.["zh-CN"] || {}) },
  };
}

export default function LocalSpecialtyDetailAdminPage() {
  const { isAuthenticated } = useAdmin();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const specialtyId = params.id;

  const [specialtyName, setSpecialtyName] = useState("");
  const [form, setForm] = useState<DetailForm>(emptyForm);
  const [translations, setTranslations] = useState<LocalSpecialtyTranslationMap>(() => cloneTranslations());
  const [activeTab, setActiveTab] = useState("vi");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600";

  useEffect(() => {
    if (!isAuthenticated) router.push("/admin/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !specialtyId) return;
    async function loadDetail() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/local-specialties/${specialtyId}/detail`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Không tải được chi tiết đặc sản.");
        setSpecialtyName(data.specialty?.name || "");
        const detail = data.detail || {};
        setForm({
          bannerImageUrl: detail.bannerImageUrl || "",
          overview: detail.overview || "",
          history: detail.history || "",
          ingredients: detail.ingredients || "",
          howToUse: detail.howToUse || "",
          preservation: detail.preservation || "",
          seoTitle: detail.seoTitle || "",
          seoDescription: detail.seoDescription || "",
        });
        setTranslations(cloneTranslations(data.translations));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không tải được chi tiết đặc sản.");
      } finally {
        setLoading(false);
      }
    }
    void loadDetail();
  }, [isAuthenticated, specialtyId]);

  function updateField(field: keyof DetailForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateTranslation(locale: string, field: string, value: string) {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: value },
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/local-specialties/${specialtyId}/detail`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          translations,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không lưu được chi tiết đặc sản.");
      alert("Đã lưu chi tiết đặc sản.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được chi tiết đặc sản.");
    } finally {
      setSaving(false);
    }
  }

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Chi tiết Đặc sản</p>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{specialtyName || `Đặc sản #${specialtyId}`}</h2>
          <p className="text-xs text-slate-500 mt-1">Quản lý nội dung chuyên sâu hiển thị tại trang chi tiết.</p>
        </div>
        <Link href="/admin/local-specialties" className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-700 transition-colors">Quay lại danh sách</Link>
      </section>

      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
      
      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm font-semibold text-slate-400">Đang tải chi tiết...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex px-6 pt-4 gap-2 bg-slate-50 border-b border-slate-100">
            <button onClick={() => setActiveTab("vi")} className={`px-5 py-3 text-sm font-bold rounded-t-xl transition-colors ${activeTab === "vi" ? "bg-white text-emerald-700 border-t border-l border-r border-slate-100 shadow-[0_2px_0_0_white]" : "text-slate-500 hover:bg-slate-100/80"}`}>Tiếng Việt</button>
            <button onClick={() => setActiveTab("en")} className={`px-5 py-3 text-sm font-bold rounded-t-xl transition-colors ${activeTab === "en" ? "bg-white text-blue-700 border-t border-l border-r border-slate-100 shadow-[0_2px_0_0_white]" : "text-slate-500 hover:bg-slate-100/80"}`}>Tiếng Anh (EN)</button>
            <button onClick={() => setActiveTab("zh-CN")} className={`px-5 py-3 text-sm font-bold rounded-t-xl transition-colors ${activeTab === "zh-CN" ? "bg-white text-rose-700 border-t border-l border-r border-slate-100 shadow-[0_2px_0_0_white]" : "text-slate-500 hover:bg-slate-100/80"}`}>Tiếng Trung (ZH)</button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {activeTab === "vi" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="space-y-5">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Media & Tổng quan</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Banner chi tiết (URL)</label>
                    <AdminAssetUploadField value={form.bannerImageUrl} onChange={(value) => updateField("bannerImageUrl", value)} placeholder="URL banner hoac upload len Cloudinary" inputClassName={inputClass} disabled={saving} previewAlt={specialtyName || "Specialty banner"} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Tổng quan</label>
                    <textarea value={form.overview} onChange={(e) => updateField("overview", e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Giới thiệu chung về đặc sản..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Nguồn gốc / Lịch sử</label>
                    <textarea value={form.history} onChange={(e) => updateField("history", e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Lịch sử hình thành..." />
                  </div>
                </section>

                <section className="space-y-5">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Chi tiết sản phẩm</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Thành phần</label>
                    <textarea value={form.ingredients} onChange={(e) => updateField("ingredients", e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Các nguyên liệu chính..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Cách thưởng thức / Sử dụng</label>
                    <textarea value={form.howToUse} onChange={(e) => updateField("howToUse", e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Cách ăn ngon nhất..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Bảo quản</label>
                    <textarea value={form.preservation} onChange={(e) => updateField("preservation", e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Bảo quản nơi khô ráo..." />
                  </div>
                </section>
                
                <section className="space-y-5 lg:col-span-2">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">SEO Meta</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">SEO Title</label>
                      <input value={form.seoTitle} onChange={(e) => updateField("seoTitle", e.target.value)} placeholder="Tiêu đề SEO..." className={inputClass} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">SEO Description</label>
                      <textarea value={form.seoDescription} onChange={(e) => updateField("seoDescription", e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Mô tả SEO..." />
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
                <div className="lg:col-span-2">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-700">
                    Nhập bản dịch <strong>{activeTab === "en" ? "Tiếng Anh" : "Tiếng Trung"}</strong>. Các trường để trống sẽ hiển thị bằng ngôn ngữ gốc.
                  </div>
                </div>
                
                <section className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Tổng quan (Overview)</label>
                    <textarea value={translations[activeTab]?.overview || ""} onChange={(e) => updateTranslation(activeTab, "overview", e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Translation..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Nguồn gốc / Lịch sử (History)</label>
                    <textarea value={translations[activeTab]?.history || ""} onChange={(e) => updateTranslation(activeTab, "history", e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Translation..." />
                  </div>
                </section>
                
                <section className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Thành phần (Ingredients)</label>
                    <textarea value={translations[activeTab]?.ingredients || ""} onChange={(e) => updateTranslation(activeTab, "ingredients", e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Translation..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Cách thưởng thức (How to use)</label>
                    <textarea value={translations[activeTab]?.howToUse || ""} onChange={(e) => updateTranslation(activeTab, "howToUse", e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Translation..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Bảo quản (Preservation)</label>
                    <textarea value={translations[activeTab]?.preservation || ""} onChange={(e) => updateTranslation(activeTab, "preservation", e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Translation..." />
                  </div>
                </section>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button type="submit" disabled={saving} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md disabled:opacity-60 transition-all">
                {saving ? "Đang lưu..." : "Lưu chi tiết"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
