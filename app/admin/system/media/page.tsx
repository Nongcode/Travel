"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

export default function MediaAdminPage() {
  const { mediaFiles, isAuthenticated, addMediaFile, removeMediaFile } = useAdmin();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tất cả");

  // Upload state
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState<"image" | "video">("image");
  const [fileSize, setFileSize] = useState("120 KB");
  const [fileDimensions, setFileDimensions] = useState("1200x800");
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Copy indicator state
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Detail Modal state
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !fileUrl.trim()) return;

    addMediaFile({
      name: fileName,
      url: fileUrl,
      type: fileType,
      size: fileSize,
      dimensions: fileType === "image" ? fileDimensions : undefined,
    });

    // Reset Upload form
    setFileName("");
    setFileUrl("");
    setFileSize("120 KB");
    setFileDimensions("1200x800");
    setShowUploadForm(false);
  };

  const handleCopyLink = (id: number, url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  // Filter media files
  const filteredFiles = mediaFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === "Tất cả" ||
      (typeFilter === "Ảnh" && file.type === "image") ||
      (typeFilter === "Video" && file.type === "video");

    return matchesSearch && matchesType;
  });

  const selectedFile = mediaFiles.find((f) => f.id === selectedFileId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Thư viện Media
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý và tải lên các file hình ảnh/video để chèn vào các bài viết cẩm nang hoặc các tour du lịch.
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all self-start sm:self-center"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            <polyline points="16 16 12 12 8 16" />
          </svg>
          {showUploadForm ? "Đóng mục tải lên" : "Tải file mới lên"}
        </button>
      </section>

      {/* Simulated Upload Section */}
      {showUploadForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-in slide-in-from-top-4 duration-200">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
            Upload File vào Thư Viện (Simulated)
          </h3>
          <form onSubmit={handleUploadFile} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Tên File (đầy đủ định dạng)</label>
              <input
                type="text"
                required
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Ví dụ: sapa-trekking-view.jpg"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Đường dẫn file (URL)</label>
              <input
                type="url"
                required
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="Ví dụ: https://images.unsplash.com/photo-1528127269322-539801943592..."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Loại file</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              >
                <option value="image">🖼️ Ảnh (Image)</option>
                <option value="video">🎥 Video (MP4/WebM)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Kích thước giả lập (Size)</label>
              <input
                type="text"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="Ví dụ: 350 KB"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
              />
            </div>
            {fileType === "image" && (
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Độ phân giải (Dimensions)</label>
                <input
                  type="text"
                  value={fileDimensions}
                  onChange={(e) => setFileDimensions(e.target.value)}
                  placeholder="Ví dụ: 1920x1080"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>
            )}
            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition-all"
              >
                Thêm vào thư viện
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controls */}
      <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Type toggle */}
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-slate-50 rounded-xl">
          {["Tất cả", "Ảnh", "Video"].map((tp) => (
            <button
              key={tp}
              onClick={() => setTypeFilter(tp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                typeFilter === tp
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tp}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên file..."
            className="w-full pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700"
          />
        </div>
      </section>

      {/* Grid List of media */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredFiles.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 font-medium">
            Không tìm thấy hình ảnh hoặc video nào.
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all"
            >
              {/* Media Preview Box */}
              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => setSelectedFileId(file.id)}>
                {file.type === "image" ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={file.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="w-10 h-10 rounded-full bg-white/95 text-slate-800 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current pl-0.5" stroke="none">
                          <polygon points="5 3 19 12 5 21" />
                        </svg>
                      </span>
                    </div>
                  </div>
                )}
                {/* Format Tag */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white font-mono text-[9px] font-bold uppercase tracking-wider">
                  {file.type}
                </span>
              </div>

              {/* Media detail summary bar */}
              <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs truncate" title={file.name}>
                    {file.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono font-medium">
                    {file.size} {file.dimensions ? `| ${file.dimensions}` : ""}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-1.5 border-t border-slate-50">
                  <button
                    onClick={() => handleCopyLink(file.id, file.url)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      copiedId === file.id
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/50"
                    }`}
                  >
                    {copiedId === file.id ? (
                      "?? copy!"
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy URL
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Xóa file "${file.name}" khỏi thư viện?`)) {
                        removeMediaFile(file.id);
                      }
                    }}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-100/50"
                    aria-label="Xóa"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Media Detail Side Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base truncate max-w-md">Chi tiết Media: {selectedFile.name}</h3>
              <button
                onClick={() => setSelectedFileId(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Column: Preview */}
              <div className="bg-slate-900 flex items-center justify-center p-6 min-h-[300px]">
                {selectedFile.type === "image" ? (
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.name}
                    className="max-h-[350px] object-contain rounded-lg shadow-lg"
                  />
                ) : (
                  <video
                    src={selectedFile.url}
                    controls
                    autoPlay
                    className="max-h-[350px] w-full object-contain rounded-lg shadow-lg"
                  />
                )}
              </div>

              {/* Right Column: Metadata details */}
              <div className="p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Tên file</span>
                    <p className="text-slate-800 font-bold text-sm select-all break-all">{selectedFile.name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Đường dẫn file</span>
                    <p className="text-emerald-800 font-bold text-xs select-all break-all underline cursor-pointer" onClick={() => handleCopyLink(selectedFile.id, selectedFile.url)}>
                      {selectedFile.url}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Loại định dạng</span>
                      <p className="text-slate-700 font-bold text-xs uppercase">{selectedFile.type}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Dung lượng file</span>
                      <p className="text-slate-700 font-bold text-xs">{selectedFile.size}</p>
                    </div>
                    {selectedFile.dimensions && (
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Độ phân giải</span>
                        <p className="text-slate-700 font-bold text-xs">{selectedFile.dimensions}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Ngày tải lên</span>
                      <p className="text-slate-700 font-bold text-xs">{selectedFile.uploadedAt}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => handleCopyLink(selectedFile.id, selectedFile.url)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
                  >
                    Copy Link hình ảnh
                  </button>
                  <button
                    onClick={() => setSelectedFileId(null)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
