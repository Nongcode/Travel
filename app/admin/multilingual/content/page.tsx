"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "../../../components/admin/AdminContext";

type ContentTranslation = {
  id: number;
  entityType: string;
  entityId: number;
  locale: string;
  fields: Record<string, unknown>;
  sourceHash: string;
  status: string;
  updatedAt: string;
};

type EntityTypeFilter = "post" | "package" | "all";

export default function ContentTranslationsPage() {
  const { isAuthenticated } = useAdmin();
  const router = useRouter();
  const [entityType, setEntityType] = useState<EntityTypeFilter>("all");
  const [entityId, setEntityId] = useState("");
  const [locale, setLocale] = useState("en");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [translations, setTranslations] = useState<ContentTranslation[]>([]);
  const [editingJson, setEditingJson] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push("/admin/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  function buildParams() {
    const params = new URLSearchParams();
    if (entityType !== "all") params.set("entityType", entityType);
    else params.set("entityType", "all");
    if (entityId) params.set("entityId", entityId);
    params.set("locale", locale);
    return params;
  }

  async function loadTranslations() {
    setLoading(true);
    setMessage("");
    const params = new URLSearchParams();
    if (entityType !== "all") params.set("entityType", entityType);
    if (entityId) params.set("entityId", entityId);
    try {
      const res = await fetch("/api/admin/content-translations?" + params.toString());
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không tải được bản dịch.");
      setTranslations(data.translations || []);
      setEditingJson(Object.fromEntries((data.translations || []).map((item: ContentTranslation) => [item.id, JSON.stringify(item.fields, null, 2)])));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Không tải được bản dịch.");
    } finally {
      setLoading(false);
    }
  }

  function exportTemplate() {
    window.location.href = "/api/admin/content-translations/export?" + buildParams().toString();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setImportFile(event.target.files?.[0] || null);
  }

  async function importTranslations() {
    if (!importFile) {
      setMessage("Vui l?ng ch?n file CSV ho?c XLSX ?? d?ch.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.set("file", importFile);
      formData.set("status", "reviewed");
      const res = await fetch("/api/admin/content-translations/import", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không import được file dịch.");
      setMessage(`?? import ${data.importedCount || 0} b?n d?ch, b? qua ${data.skippedCount || 0} d?ng thi?u d? li?u.`);
      await loadTranslations();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Không import được file dịch.");
    } finally {
      setLoading(false);
    }
  }

  async function saveTranslation(item: ContentTranslation, status: string) {
    try {
      const fields = JSON.parse(editingJson[item.id] || "{}");
      const res = await fetch("/api/admin/content-translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType: item.entityType, entityId: item.entityId, locale: item.locale, fields, sourceHash: item.sourceHash, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không lưu được bản dịch.");
      setMessage("?? l?u b?n d?ch.");
      await loadTranslations();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "JSON không hợp lệ hoặc không lưu được bản dịch.");
    }
  }

  async function handleAutoTranslate() {
    setTranslating(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/content-translations/auto-translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          locale,
          entityId: entityId ? Number(entityId) : undefined,
          all: !entityId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không tự động dịch được.");
      setMessage(`Đã tự động dịch thành công ${data.translatedCount || 0} mục.`);
      await loadTranslations();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Tự động dịch thất bại.");
    } finally {
      setTranslating(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-[24px] font-bold text-slate-800 tracking-tight leading-7">Dịch nội dung dài</h2>
          <p className="text-xs text-slate-500 mt-1">Xuất CSV/XLSX, dịch bằng công cụ miễn phí bên ngoài, rồi import lại để lưu vào database và publish.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3 items-end">
        <label className="text-xs font-bold text-slate-500">Loại nội dung
          <select value={entityType} onChange={(e) => setEntityType(e.target.value as EntityTypeFilter)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <option value="all">Tất cả</option>
            <option value="post">Bài viết</option>
            <option value="package">Gói du lịch</option>
          </select>
        </label>
        <label className="text-xs font-bold text-slate-500">ID tùy chọn
          <input value={entityId} onChange={(e) => setEntityId(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700" placeholder="Để trống để xuất tất cả" />
        </label>
        <label className="text-xs font-bold text-slate-500">Ngôn ngữ
          <select value={locale} onChange={(e) => setLocale(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <option value="en">English</option>
            <option value="zh-CN">中文</option>
          </select>
        </label>
        <button type="button" onClick={exportTemplate} disabled={loading} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Xuất CSV</button>
        <button type="button" onClick={loadTranslations} disabled={loading} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">Tải bản dịch</button>
        <button
          type="button"
          onClick={handleAutoTranslate}
          disabled={loading || translating}
          className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 text-sm font-bold transition-all disabled:opacity-60"
        >
          {translating ? "Đang dịch..." : "Dịch tự động"}
        </button>
        <label className="rounded-xl border border-dashed border-slate-300 px-4 py-2 text-center text-sm font-bold text-slate-600 cursor-pointer">
          Chọn file
          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" />
        </label>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-slate-600">
          {importFile ? <span className="font-semibold text-slate-800">File đã chọn: {importFile.name}</span> : "Sau khi xu?t CSV, ?i?n c?t translatedText r?i import l?i t?i ??y."}
        </div>
        <button type="button" onClick={importTranslations} disabled={loading || !importFile} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Import bản dịch</button>
      </div>

      {message && <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{message}</div>}

      <div className="space-y-4">
        {translations.map((item) => (
          <section key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-bold text-slate-800">{item.entityType} #{item.entityId} / {item.locale} / <span className="text-emerald-700">{item.status}</span></div>
              <div className="flex gap-2">
                <button onClick={() => saveTranslation(item, "reviewed")} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">Lưu reviewed</button>
                <button onClick={() => saveTranslation(item, "published")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">Publish</button>
              </div>
            </div>
            <textarea value={editingJson[item.id] || ""} onChange={(e) => setEditingJson((current) => ({ ...current, [item.id]: e.target.value }))} className="min-h-72 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700" />
          </section>
        ))}
      </div>
    </div>
  );
}
