"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "../../components/admin/AdminContext";
import { uploadAssetToCloudinary } from "@/lib/adminCloudinaryUpload";

export type AdminBanner = {
  id: number;
  type: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  mediaType: string;
  status: string;
};

type BannerManagerPageProps = {
  bannerType: "homepage" | "subpage" | "detail";
  heading: string;
  modalTitle: string;
  description: string;
  mediaPlaceholder: string;
  linkLabel?: string;
  linkPlaceholder?: string;
  linkHelp?: string;
  linkColumnLabel?: string;
};

const OPEN_STATUS = "Đang mở";
const CLOSED_STATUS = "Tạm đóng";

function detectMediaType(file: File | null, fallback: string) {
  if (!file) return fallback;
  return file.type.startsWith("video/") ? "video" : "image";
}

function MediaPreview({ src, mediaType, title }: { src: string; mediaType: string; title: string }) {
  if (!src) {
    return (
      <div className="w-16 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }

  if (mediaType === "video") {
    return <video src={src} className="w-16 h-10 rounded-lg object-cover bg-slate-100 shrink-0" muted loop playsInline />;
  }

  return (
    <img
      src={src}
      alt={title}
      className="w-16 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

function LargePreview({ src, mediaType, title }: { src: string; mediaType: string; title: string }) {
  if (!src) return null;

  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 max-h-48 w-fit">
      {mediaType === "video" ? (
        <video src={src} className="max-h-48 object-cover" muted loop autoPlay playsInline controls />
      ) : (
        <img src={src} alt={title || "Preview"} className="max-h-48 object-cover" />
      )}
    </div>
  );
}

export default function BannerManagerPage({
  bannerType,
  heading,
  modalTitle,
  description,
  mediaPlaceholder,
  linkLabel = "Đường dẫn liên kết",
  linkPlaceholder = "Ví dụ: /goi-du-lich",
  linkHelp,
  linkColumnLabel = "Liên kết",
}: BannerManagerPageProps) {
  const { isAuthenticated } = useAdmin();
  const router = useRouter();

  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showAddModal, setShowAddModal] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addSubtitle, setAddSubtitle] = useState("");
  const [addImageUrl, setAddImageUrl] = useState("");
  const [addLinkUrl, setAddLinkUrl] = useState("");
  const [addMediaType, setAddMediaType] = useState("image");
  const [addStatus, setAddStatus] = useState(OPEN_STATUS);
  const [addFile, setAddFile] = useState<File | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");
  const [editMediaType, setEditMediaType] = useState("image");
  const [editStatus, setEditStatus] = useState(OPEN_STATUS);
  const [editFile, setEditFile] = useState<File | null>(null);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/admin/banners?type=${bannerType}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Không thể tải danh sách banner.");
        return;
      }

      setBanners(data.banners || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách banner:", err);
      setError("Không thể tải danh sách banner.");
    } finally {
      setLoading(false);
    }
  }, [bannerType]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchBanners();
    }
  }, [isAuthenticated, router, fetchBanners]);

  if (!isAuthenticated) return null;

  const filteredBanners = banners.filter((banner) => {
    const keyword = searchQuery.toLowerCase();
    return banner.title.toLowerCase().includes(keyword) || banner.subtitle.toLowerCase().includes(keyword) || banner.image.toLowerCase().includes(keyword);
  });

  const totalItems = filteredBanners.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBanners = filteredBanners.slice(indexOfFirstItem, indexOfLastItem);

  const resetAddForm = () => {
    setAddTitle("");
    setAddSubtitle("");
    setAddImageUrl("");
    setAddLinkUrl("");
    setAddMediaType("image");
    setAddStatus(OPEN_STATUS);
    setAddFile(null);
    setError("");
  };

  const submitBanner = async (method: "POST" | "PUT", fields: Record<string, string>, file: File | null) => {
    setSaving(true);
    setError("");

    try {
      const payload = { ...fields };
      if (file) {
        const uploaded = await uploadAssetToCloudinary(file);
        payload.image = uploaded.url;
        payload.mediaType = detectMediaType(file, payload.mediaType || "image");
      }

      const res = await fetch("/api/admin/banners", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Khong the luu banner.");
        return false;
      }

      await fetchBanners();
      return true;
    } catch (err) {
      console.error("Failed to save banner:", err);
      setError(err instanceof Error ? err.message : "Khong the luu banner.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFile && !addImageUrl.trim()) {
      setError("Vui lòng chọn file hoặc nhập đường dẫn media trong thư mục public.");
      return;
    }

    const success = await submitBanner(
      "POST",
      {
        type: bannerType,
        title: addTitle.trim(),
        subtitle: addSubtitle.trim(),
        image: addImageUrl.trim(),
        link: addLinkUrl.trim(),
        mediaType: detectMediaType(addFile, addMediaType),
        status: addStatus,
      },
      addFile,
    );

    if (success) {
      resetAddForm();
      setShowAddModal(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;
    if (!editFile && !editImageUrl.trim()) {
      setError("Vui lòng chọn file hoặc nhập đường dẫn media trong thư mục public.");
      return;
    }

    const success = await submitBanner(
      "PUT",
      {
        id: String(editingId),
        type: bannerType,
        title: editTitle.trim(),
        subtitle: editSubtitle.trim(),
        image: editImageUrl.trim(),
        link: editLinkUrl.trim(),
        mediaType: detectMediaType(editFile, editMediaType),
        status: editStatus,
      },
      editFile,
    );

    if (success) {
      setEditingId(null);
      setShowEditModal(false);
      setEditFile(null);
    }
  };

  const openEditModal = (banner: AdminBanner) => {
    setEditingId(banner.id);
    setEditTitle(banner.title);
    setEditSubtitle(banner.subtitle);
    setEditImageUrl(banner.image);
    setEditLinkUrl(banner.link);
    setEditMediaType(banner.mediaType || "image");
    setEditStatus(banner.status || OPEN_STATUS);
    setEditFile(null);
    setError("");
    setShowEditModal(true);
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === OPEN_STATUS ? CLOSED_STATUS : OPEN_STATUS;
    await submitBanner("PUT", { id: String(id), status: nextStatus }, null);
  };

  const removeBanner = async (id: number) => {
    try {
      setError("");
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Không thể xóa banner.");
        return;
      }

      await fetchBanners();
    } catch (err) {
      console.error("Lỗi khi xóa banner:", err);
      setError("Không thể xóa banner.");
    }
  };

  const addPreviewSource = addImageUrl;
  const editPreviewSource = editImageUrl;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-[24px] font-bold text-slate-800 tracking-tight leading-7">{heading}</h2>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
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
          Thêm banner mới
        </button>
      </div>

      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500 font-semibold">File upload mới sẽ nằm trong <span className="font-mono text-slate-700">/public/banners</span>.</div>
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
            placeholder="Tìm tiêu đề hoặc đường dẫn..."
            className="w-full pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-xs uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Media & Tiêu đề</th>
                <th className="px-6 py-4">{linkColumnLabel}</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">Đang tải dữ liệu...</td>
                </tr>
              ) : currentBanners.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">Không tìm thấy banner nào.</td>
                </tr>
              ) : (
                currentBanners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <div className="flex items-center gap-3">
                        <MediaPreview src={banner.image} mediaType={banner.mediaType} title={banner.title} />
                        <div className="min-w-0">
                          <strong className="text-slate-800 font-bold block line-clamp-1">{banner.title || "(Chưa có tiêu đề)"}</strong>
                          <span className="text-xs text-slate-400 mt-0.5 block line-clamp-1">{banner.subtitle || "Không có mô tả phụ"}</span>
                          <span className="text-[11px] text-emerald-700 mt-1 block font-mono truncate">{banner.image}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {banner.link ? (
                        <a href={banner.link} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors hover:underline">{banner.link}</a>
                      ) : (
                        "Không có"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(banner.id, banner.status)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all hover:scale-105 cursor-pointer ${
                          banner.status === OPEN_STATUS ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                        }`}
                        title="Click để đổi trạng thái"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1" />
                        {banner.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEditModal(banner)} className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer inline-flex items-center" title="Sửa banner">
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa banner "${banner.title}"? File local không còn được dùng sẽ bị xóa khỏi public.`)) {
                            removeBanner(banner.id);
                          }
                        }}
                        className="p-1.5 hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                        title="Xóa banner"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
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
            <span className="text-xs font-semibold text-slate-500">Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} trong tổng số {totalItems} banner</span>
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
        <BannerModal
          title={modalTitle}
          submitLabel="Tạo banner"
          saving={saving}
          mainTitle={addTitle}
          subtitle={addSubtitle}
          imageUrl={addImageUrl}
          linkUrl={addLinkUrl}
          mediaType={addMediaType}
          status={addStatus}
          file={addFile}
          previewSource={addPreviewSource}
          mediaPlaceholder={mediaPlaceholder}
          linkLabel={linkLabel}
          linkPlaceholder={linkPlaceholder}
          linkHelp={linkHelp}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSubmit}
          onTitleChange={setAddTitle}
          onSubtitleChange={setAddSubtitle}
          onImageUrlChange={setAddImageUrl}
          onLinkUrlChange={setAddLinkUrl}
          onMediaTypeChange={setAddMediaType}
          onStatusChange={setAddStatus}
          onFileChange={(file) => {
            setAddFile(file);
            setAddMediaType(detectMediaType(file, addMediaType));
          }}
        />
      )}

      {showEditModal && (
        <BannerModal
          title="Chỉnh sửa banner"
          submitLabel="Lưu thay đổi"
          saving={saving}
          mainTitle={editTitle}
          subtitle={editSubtitle}
          imageUrl={editImageUrl}
          linkUrl={editLinkUrl}
          mediaType={editMediaType}
          status={editStatus}
          file={editFile}
          previewSource={editPreviewSource}
          mediaPlaceholder={mediaPlaceholder}
          linkLabel={linkLabel}
          linkPlaceholder={linkPlaceholder}
          linkHelp={linkHelp}
          onClose={() => {
            setShowEditModal(false);
            setEditingId(null);
            setEditFile(null);
          }}
          onSubmit={handleEditSubmit}
          onTitleChange={setEditTitle}
          onSubtitleChange={setEditSubtitle}
          onImageUrlChange={setEditImageUrl}
          onLinkUrlChange={setEditLinkUrl}
          onMediaTypeChange={setEditMediaType}
          onStatusChange={setEditStatus}
          onFileChange={(file) => {
            setEditFile(file);
            setEditMediaType(detectMediaType(file, editMediaType));
          }}
        />
      )}
    </div>
  );
}

type BannerModalProps = {
  title: string;
  submitLabel: string;
  saving: boolean;
  mainTitle: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  mediaType: string;
  status: string;
  file: File | null;
  previewSource: string;
  mediaPlaceholder: string;
  linkLabel: string;
  linkPlaceholder: string;
  linkHelp?: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onImageUrlChange: (value: string) => void;
  onLinkUrlChange: (value: string) => void;
  onMediaTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
};

function BannerModal({
  title,
  submitLabel,
  saving,
  mainTitle,
  subtitle,
  imageUrl,
  linkUrl,
  mediaType,
  status,
  file,
  previewSource,
  mediaPlaceholder,
  linkLabel,
  linkPlaceholder,
  linkHelp,
  onClose,
  onSubmit,
  onTitleChange,
  onSubtitleChange,
  onImageUrlChange,
  onLinkUrlChange,
  onMediaTypeChange,
  onStatusChange,
  onFileChange,
}: BannerModalProps) {
  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-black text-lg tracking-tight">{title}</h3>
            <p className="text-xs text-emerald-200/80 mt-0.5">Upload file vào public hoặc dùng đường dẫn media đã có.</p>
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
            <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Tiêu đề chính</label>
            <input type="text" value={mainTitle} onChange={(e) => onTitleChange(e.target.value)} placeholder="Ví dụ: Discover Untouched Vietnam..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Tiêu đề phụ</label>
            <input type="text" value={subtitle} onChange={(e) => onSubtitleChange(e.target.value)} placeholder="Ví dụ: Handcrafted private itineraries..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Upload ảnh/video</label>
            <input type="file" accept="image/*,video/*" onChange={(e) => onFileChange(e.currentTarget.files?.[0] || null)} className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-emerald-700" />
            {file && <p className="text-xs font-semibold text-slate-500">File mới: <span className="font-mono text-slate-700">{file.name}</span></p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Hoặc đường dẫn trong public / URL online</label>
            <input type="text" value={imageUrl} onChange={(e) => onImageUrlChange(e.target.value)} placeholder={mediaPlaceholder} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono text-xs" />
            <LargePreview src={previewSource} mediaType={mediaType} title={mainTitle} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">{linkLabel}</label>
            <input type="text" value={linkUrl} onChange={(e) => onLinkUrlChange(e.target.value)} placeholder={linkPlaceholder} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono text-xs" />
            {linkHelp && <p className="text-xs text-slate-500 font-medium">{linkHelp}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Loại media</label>
              <select value={mediaType} onChange={(e) => onMediaTypeChange(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold">
                <option value="image">Hình ảnh</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Trạng thái</label>
              <select value={status} onChange={(e) => onStatusChange(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold">
                <option value={OPEN_STATUS}>Đang mở</option>
                <option value={CLOSED_STATUS}>Tạm đóng</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white z-10">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer">Hủy bỏ</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-60 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all cursor-pointer">
              {saving ? "Đang lưu..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


