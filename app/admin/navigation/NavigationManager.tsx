"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "../../components/admin/AdminContext";
import { uploadAssetToCloudinary } from "@/lib/adminCloudinaryUpload";
import {
  DEFAULT_SITE_CHROME_CONFIG,
  type FooterSiteConfig,
  type HeaderSiteConfig,
  type SiteChromeConfig,
  type SiteMenuItem,
  type SiteMenuLocation,
} from "@/lib/siteChromeShared";

type FooterForm = Omit<FooterSiteConfig, "menu">;
type HeaderForm = Omit<HeaderSiteConfig, "menu">;

async function readJson(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Yêu cầu không thành công.");
  }
  return data;
}

export default function NavigationManager() {
  const { isAuthenticated, authReady } = useAdmin();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SiteMenuLocation>("header");
  const [config, setConfig] = useState<SiteChromeConfig | null>(null);
  const [headerForm, setHeaderForm] = useState<HeaderForm>(DEFAULT_SITE_CHROME_CONFIG.header);
  const [footerForm, setFooterForm] = useState<FooterForm>(DEFAULT_SITE_CHROME_CONFIG.footer);
  const [menuLabel, setMenuLabel] = useState("");
  const [menuUrl, setMenuUrl] = useState("");
  const [menuOrder, setMenuOrder] = useState(1);
  const [editingMenu, setEditingMenu] = useState<SiteMenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadConfiguration = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/navigation", { signal, cache: "no-store" });
      const data = await readJson(response) as { config: SiteChromeConfig };
      setConfig(data.config);
      setHeaderForm({
        logoUrl: data.config.header.logoUrl,
        logoAlt: data.config.header.logoAlt,
        companyName: data.config.header.companyName,
      });
      setFooterForm({
        brandName: data.config.footer.brandName,
        description: data.config.footer.description,
        address: data.config.footer.address,
        phone: data.config.footer.phone,
        email: data.config.footer.email,
        facebook: data.config.footer.facebook,
        instagram: data.config.footer.instagram,
        twitter: data.config.footer.twitter,
        copyright: data.config.footer.copyright,
      });
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === "AbortError") return;
      setError(loadError instanceof Error ? loadError.message : "Không thể tải cấu hình.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) {
      router.replace("/admin/login");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => void loadConfiguration(controller.signal), 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [authReady, isAuthenticated, loadConfiguration, router]);

  const currentMenu = useMemo(() => {
    const items = activeTab === "header" ? config?.header.menu : config?.footer.menu;
    return [...(items || [])].sort((a, b) => a.order - b.order || a.id - b.id);
  }, [activeTab, config]);

  function showSuccess(message: string) {
    setSuccess(message);
    window.setTimeout(() => setSuccess(""), 3000);
  }

  function resetMenuForm(location = activeTab) {
    setEditingMenu(null);
    setMenuLabel("");
    setMenuUrl("");
    const menu = location === "header" ? config?.header.menu : config?.footer.menu;
    setMenuOrder((menu?.length || 0) + 1);
  }

  function changeTab(tab: SiteMenuLocation) {
    setActiveTab(tab);
    resetMenuForm(tab);
    setError("");
    setSuccess("");
  }

  function editMenu(item: SiteMenuItem) {
    setActiveTab(item.location);
    setEditingMenu(item);
    setMenuLabel(item.label);
    setMenuUrl(item.url);
    setMenuOrder(item.order);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitMenu(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        editingMenu ? `/api/admin/navigation/menus/${editingMenu.id}` : "/api/admin/navigation/menus",
        {
          method: editingMenu ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: menuLabel,
            url: menuUrl,
            order: menuOrder,
            location: activeTab,
          }),
        },
      );
      await readJson(response);
      await loadConfiguration();
      resetMenuForm(activeTab);
      showSuccess(editingMenu ? "Đã cập nhật menu." : "Đã thêm menu mới.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể lưu menu.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteMenu(item: SiteMenuItem) {
    if (!window.confirm(`Bạn có chắc muốn xóa liên kết "${item.label}"?`)) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/navigation/menus/${item.id}`, { method: "DELETE" });
      await readJson(response);
      await loadConfiguration();
      if (editingMenu?.id === item.id) resetMenuForm(item.location);
      showSuccess("Đã xóa menu.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Không thể xóa menu.");
    } finally {
      setSaving(false);
    }
  }

  async function saveHeader(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/navigation/header", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(headerForm),
      });
      await readJson(response);
      await loadConfiguration();
      showSuccess("Đã lưu logo và thông tin Header.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể lưu Header.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadLogo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingLogo(true);
    setError("");
    try {
      const uploaded = await uploadAssetToCloudinary(file);
      const nextHeader = { ...headerForm, logoUrl: uploaded.url };
      const response = await fetch("/api/admin/navigation/header", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextHeader),
      });
      await readJson(response);
      setHeaderForm(nextHeader);
      await loadConfiguration();
      showSuccess("Da tai logo len Cloudinary va ap dung vao Header.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Khong the tai logo len Cloudinary.");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function saveFooter(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/navigation/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(footerForm),
      });
      await readJson(response);
      await loadConfiguration();
      showSuccess("Đã lưu thông tin Footer.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể lưu Footer.");
    } finally {
      setSaving(false);
    }
  }

  if (!authReady || !isAuthenticated) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Cấu hình Header & Footer</h2>
        <p className="text-xs text-slate-500 mt-1">
          Quản lý logo, menu, đường dẫn và thông tin liên hệ hiển thị trên website.
        </p>
      </div>

      {(error || success) && (
        <div className={`rounded-xl border p-4 text-sm font-bold ${error ? "border-rose-100 bg-rose-50 text-rose-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>
          {error || success}
        </div>
      )}

      <div className="flex gap-4 border-b border-slate-200">
        {(["header", "footer"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => changeTab(tab)}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === tab ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500"}`}
          >
            {tab === "header" ? "Header" : "Footer"}
          </button>
        ))}
      </div>

      {loading && !config ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm font-semibold text-slate-400">
          Đang tải cấu hình...
        </div>
      ) : (
        <>
          {activeTab === "header" ? (
            <form onSubmit={saveHeader} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Logo và thương hiệu</h3>
                <p className="mt-1 text-xs text-slate-400">Giữ đường dẫn logo trong thư mục public, ví dụ /vietvista-logo.png.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-[180px_1fr]">
                <div className="flex min-h-32 items-center justify-center rounded-2xl bg-emerald-950 p-4">
                  <Image src={headerForm.logoUrl || "/vietvista-logo.png"} alt={headerForm.logoAlt || "Logo"} width={150} height={100} className="h-auto max-h-24 w-auto" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Tên công ty" value={headerForm.companyName} onChange={(value) => setHeaderForm((current) => ({ ...current, companyName: value }))} required />
                  <Field label="Mô tả logo (alt)" value={headerForm.logoAlt} onChange={(value) => setHeaderForm((current) => ({ ...current, logoAlt: value }))} required />
                  <div className="md:col-span-2">
                    <Field label="Đường dẫn logo" value={headerForm.logoUrl} onChange={(value) => setHeaderForm((current) => ({ ...current, logoUrl: value }))} placeholder="/vietvista-logo.png hoặc https://res.cloudinary.com/..." required mono />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`inline-flex cursor-pointer items-center rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 ${uploadingLogo ? "pointer-events-none opacity-50" : ""}`}>
                      {uploadingLogo ? "Đang tải logo..." : "Chọn và tải logo mới"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) => void uploadLogo(event)}
                        disabled={uploadingLogo || saving}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-2 text-xs text-slate-400">Ho tro PNG, JPG, WebP. Logo duoc upload len Cloudinary va ap dung ngay sau khi tai len.</p>
                  </div>
                </div>
              </div>
              <button disabled={saving || uploadingLogo} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                Lưu thông tin Header
              </button>
            </form>
          ) : (
            <form onSubmit={saveFooter} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Thương hiệu và liên hệ Footer</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tên thương hiệu" value={footerForm.brandName} onChange={(value) => setFooterForm((current) => ({ ...current, brandName: value }))} required />
                <Field label="Bản quyền" value={footerForm.copyright} onChange={(value) => setFooterForm((current) => ({ ...current, copyright: value }))} required />
                <div className="md:col-span-2">
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500">Mô tả</label>
                  <textarea value={footerForm.description} onChange={(event) => setFooterForm((current) => ({ ...current, description: event.target.value }))} rows={3} required className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-600" />
                </div>
                <Field label="Địa chỉ" value={footerForm.address} onChange={(value) => setFooterForm((current) => ({ ...current, address: value }))} />
                <Field label="Điện thoại" value={footerForm.phone} onChange={(value) => setFooterForm((current) => ({ ...current, phone: value }))} />
                <Field label="Email" type="email" value={footerForm.email} onChange={(value) => setFooterForm((current) => ({ ...current, email: value }))} />
                <Field label="Facebook" type="url" value={footerForm.facebook} onChange={(value) => setFooterForm((current) => ({ ...current, facebook: value }))} placeholder="https://facebook.com/..." />
                <Field label="Instagram" type="url" value={footerForm.instagram} onChange={(value) => setFooterForm((current) => ({ ...current, instagram: value }))} placeholder="https://instagram.com/..." />
                <Field label="Twitter / X" type="url" value={footerForm.twitter} onChange={(value) => setFooterForm((current) => ({ ...current, twitter: value }))} placeholder="https://x.com/..." />
              </div>
              <button disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                Lưu thông tin Footer
              </button>
            </form>
          )}

          <div className="grid gap-6 lg:grid-cols-12">
            <form onSubmit={submitMenu} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4 lg:col-span-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
                {editingMenu ? "Cập nhật menu" : `Thêm menu ${activeTab === "header" ? "Header" : "Footer"}`}
              </h3>
              <Field label="Tên hiển thị" value={menuLabel} onChange={setMenuLabel} required />
              <Field label="Đường dẫn" value={menuUrl} onChange={setMenuUrl} placeholder="/tin-tuc" required mono />
              <Field label="Thứ tự" type="number" value={String(menuOrder)} onChange={(value) => setMenuOrder(Number(value))} required />
              <div className="flex gap-2">
                <button disabled={saving} className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                  {editingMenu ? "Cập nhật" : "Thêm menu"}
                </button>
                {editingMenu && (
                  <button type="button" onClick={() => resetMenuForm()} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600">
                    Hủy
                  </button>
                )}
              </div>
            </form>

            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm lg:col-span-8">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Menu {activeTab}</h3>
                <span className="text-xs font-semibold text-slate-400">{currentMenu.length} liên kết</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Thứ tự</th>
                      <th className="px-5 py-3">Nhãn</th>
                      <th className="px-5 py-3">Đường dẫn</th>
                      <th className="px-5 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {currentMenu.map((item) => (
                      <tr key={item.id}>
                        <td className="px-5 py-4 font-mono font-bold">{item.order}</td>
                        <td className="px-5 py-4 font-bold text-slate-800">{item.label}</td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-500">{item.url}</td>
                        <td className="px-5 py-4 text-right">
                          <button type="button" onClick={() => editMenu(item)} className="mr-2 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">Sửa</button>
                          <button type="button" onClick={() => void deleteMenu(item)} className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">Xóa</button>
                        </td>
                      </tr>
                    ))}
                    {currentMenu.length === 0 && (
                      <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">Chưa có menu.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  mono,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-extrabold uppercase tracking-widest text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        min={type === "number" ? 1 : undefined}
        className={`mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-600 ${mono ? "font-mono text-xs" : "font-semibold"}`}
      />
    </label>
  );
}
