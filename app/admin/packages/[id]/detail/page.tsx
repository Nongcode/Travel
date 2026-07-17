"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAdmin } from "../../../../components/admin/AdminContext";

type DetailForm = {
  bannerImageUrl: string;
  galleryText: string;
  overview: string;
  highlightsText: string;
  offersText: string;
  includedText: string;
  itineraryText: string;
  benefitsText: string;
  consultTitle: string;
  consultCopy: string;
  consultPointsText: string;
  seoTitle: string;
  seoDescription: string;
};

const emptyForm: DetailForm = {
  bannerImageUrl: "",
  galleryText: "",
  overview: "",
  highlightsText: "",
  offersText: "",
  includedText: "",
  itineraryText: "",
  benefitsText: "",
  consultTitle: "",
  consultCopy: "",
  consultPointsText: "",
  seoTitle: "",
  seoDescription: "",
};

function linesToArray(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function arrayToLines(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)).join("\n") : "";
}

function highlightsToText(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return String(item || "");
      const record = item as Record<string, unknown>;
      return [record.title, record.description].filter(Boolean).join(" | ");
    })
    .filter(Boolean)
    .join("\n");
}

function textToHighlights(value: string) {
  return linesToArray(value).map((line) => {
    const [title, ...rest] = line.split("|").map((part) => part.trim());
    return { title, description: rest.join(" | ") };
  });
}

export default function PackageDetailAdminPage() {
  const { isAuthenticated } = useAdmin();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const packageId = params.id;

  const [packageName, setPackageName] = useState("");
  const [form, setForm] = useState<DetailForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) router.push("/admin/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !packageId) return;
    async function loadDetail() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/packages/${packageId}/detail`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Không tải được chi tiết gói.");
        setPackageName(data.package?.name || "");
        const detail = data.detail || {};
        setForm({
          bannerImageUrl: detail.bannerImageUrl || "",
          galleryText: arrayToLines(detail.gallery),
          overview: detail.overview || "",
          highlightsText: highlightsToText(detail.highlights),
          offersText: arrayToLines(detail.offers),
          includedText: arrayToLines(detail.included),
          itineraryText: arrayToLines(detail.itinerary),
          benefitsText: arrayToLines(detail.benefits),
          consultTitle: detail.consultTitle || "",
          consultCopy: detail.consultCopy || "",
          consultPointsText: arrayToLines(detail.consultPoints),
          seoTitle: detail.seoTitle || "",
          seoDescription: detail.seoDescription || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không tải được chi tiết gói.");
      } finally {
        setLoading(false);
      }
    }
    void loadDetail();
  }, [isAuthenticated, packageId]);

  function updateField(field: keyof DetailForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/packages/${packageId}/detail`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bannerImageUrl: form.bannerImageUrl,
          gallery: linesToArray(form.galleryText),
          overview: form.overview,
          highlights: textToHighlights(form.highlightsText),
          offers: linesToArray(form.offersText),
          included: linesToArray(form.includedText),
          itinerary: linesToArray(form.itineraryText),
          benefits: linesToArray(form.benefitsText),
          consultTitle: form.consultTitle,
          consultCopy: form.consultCopy,
          consultPoints: linesToArray(form.consultPointsText),
          seoTitle: form.seoTitle,
          seoDescription: form.seoDescription,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không lưu được chi tiết gói.");
      alert("Đã lưu chi tiết gói du lịch.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được chi tiết gói.");
    } finally {
      setSaving(false);
    }
  }

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Chi tiết gói du lịch</p>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{packageName || `Gói #${packageId}`}</h2>
          <p className="text-xs text-slate-500 mt-1">Quản lý nội dung chuyên sâu hiển thị tại trang chi tiết của gói.</p>
        </div>
        <Link href="/admin/packages" className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-700">Quay lại</Link>
      </section>

      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
      {loading ? <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm font-semibold text-slate-400">Đang tải chi tiết...</div> : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Media & tổng quan</h3>
            <Field label="Banner chi tiết" value={form.bannerImageUrl} onChange={(value) => updateField("bannerImageUrl", value)} placeholder="/banners/halong-detail.jpg" />
            <TextField label="Gallery, mỗi dòng một ảnh" value={form.galleryText} onChange={(value) => updateField("galleryText", value)} rows={5} />
            <TextField label="Tổng quan" value={form.overview} onChange={(value) => updateField("overview", value)} rows={5} />
            <TextField label="Highlights, mỗi dòng: Tiêu đề | Mô tả" value={form.highlightsText} onChange={(value) => updateField("highlightsText", value)} rows={6} />
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Nội dung hành trình</h3>
            <TextField label="Ưu đãi, mỗi dòng một ý" value={form.offersText} onChange={(value) => updateField("offersText", value)} rows={4} />
            <TextField label="Bao gồm, mỗi dòng một ý" value={form.includedText} onChange={(value) => updateField("includedText", value)} rows={4} />
            <TextField label="Lịch trình mẫu, mỗi dòng một bước" value={form.itineraryText} onChange={(value) => updateField("itineraryText", value)} rows={6} />
            <TextField label="Lợi ích, mỗi dòng một ý" value={form.benefitsText} onChange={(value) => updateField("benefitsText", value)} rows={4} />
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">CTA tư vấn</h3>
            <Field label="Tiêu đề CTA" value={form.consultTitle} onChange={(value) => updateField("consultTitle", value)} />
            <TextField label="Nội dung CTA" value={form.consultCopy} onChange={(value) => updateField("consultCopy", value)} rows={4} />
            <TextField label="Điểm cam kết, mỗi dòng một ý" value={form.consultPointsText} onChange={(value) => updateField("consultPointsText", value)} rows={4} />
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">SEO</h3>
            <Field label="SEO title" value={form.seoTitle} onChange={(value) => updateField("seoTitle", value)} />
            <TextField label="SEO description" value={form.seoDescription} onChange={(value) => updateField("seoDescription", value)} rows={4} />
            <button type="submit" disabled={saving} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md disabled:opacity-60">
              {saving ? "Đang lưu..." : "Lưu chi tiết gói"}
            </button>
          </section>
        </form>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700" />
    </label>
  );
}

function TextField({ label, value, onChange, rows }: { label: string; value: string; onChange: (value: string) => void; rows: number }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">{label}</span>
      <textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700" />
    </label>
  );
}