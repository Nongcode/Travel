"use client";

import { useState } from "react";
import { uploadAssetToCloudinary } from "@/lib/adminCloudinaryUpload";

type AdminAssetUploadFieldProps = {
  value: string;
  onChange: (value: string) => void;
  inputClassName: string;
  placeholder?: string;
  accept?: string;
  disabled?: boolean;
  previewAlt?: string;
};

function isVideoUrl(value: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(value);
}

export default function AdminAssetUploadField({
  value,
  onChange,
  inputClassName,
  placeholder,
  accept = "image/*",
  disabled,
  previewAlt = "Preview",
}: AdminAssetUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const uploaded = await uploadAssetToCloudinary(file);
      onChange(uploaded.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Khong the tai file len Cloudinary.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={inputClassName}
        />
        <label className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 ${disabled || uploading ? "pointer-events-none opacity-60" : ""}`}>
          {uploading ? "Dang tai..." : "Upload"}
          <input type="file" accept={accept} onChange={handleFileChange} disabled={disabled || uploading} className="sr-only" />
        </label>
      </div>
      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
      {value && value.startsWith("http") && (
        <div className="w-fit overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
          {isVideoUrl(value) ? (
            <video src={value} className="max-h-32 object-cover" muted controls playsInline />
          ) : (
            <img src={value} alt={previewAlt} className="max-h-32 object-cover" />
          )}
        </div>
      )}
    </div>
  );
}
