export type UploadedAsset = {
  url: string;
};

export async function uploadAssetToCloudinary(file: File): Promise<UploadedAsset> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || typeof data.url !== "string" || !data.url) {
    throw new Error(typeof data.error === "string" ? data.error : "Khong the tai file len Cloudinary.");
  }

  return { url: data.url };
}

export function getAssetTypeFromFile(file: File): "image" | "video" {
  return file.type.startsWith("video/") ? "video" : "image";
}

export function formatFileSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${size} B`;
}
