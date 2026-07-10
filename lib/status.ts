export function normalizeStatus(status: string) {
  if (!status) return "";
  return status
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d");
}

export function getStatusStyleAndLabel(status: string, locale: string, t: (ns: string, k: string, fb: string) => string) {
  const normalized = normalizeStatus(status);
  let statusClass = "status-open";
  let statusLabel = status || "Đang mở bán";

  if (normalized.includes("sap ra mat") || normalized.includes("coming")) {
    statusClass = "status-coming-soon";
    if (locale === "en") statusLabel = t("packageStatus", "coming_soon", "Coming Soon");
    else if (locale === "zh-CN") statusLabel = t("packageStatus", "coming_soon", "即将推出");
    else statusLabel = status || "Sắp ra mắt";
  } else if (normalized.includes("dang mo ban") || normalized.includes("dang mo") || normalized.includes("open") || normalized.includes("available")) {
    statusClass = "status-open";
    if (locale === "en") statusLabel = t("packageStatus", "open", "Available");
    else if (locale === "zh-CN") statusLabel = t("packageStatus", "open", "开放");
    else statusLabel = status || "Đang mở bán";
  } else if (normalized.includes("sap kin cho") || normalized.includes("sap het") || normalized.includes("almost") || normalized.includes("limited")) {
    statusClass = "status-limited";
    if (locale === "en") statusLabel = t("packageStatus", "almost_full", "Almost Full");
    else if (locale === "zh-CN") statusLabel = t("packageStatus", "almost_full", "即将满员");
    else statusLabel = status || "Sắp kín chỗ";
  } else if (normalized.includes("da het cho") || normalized.includes("het cho") || normalized.includes("sold")) {
    statusClass = "status-sold-out";
    if (locale === "en") statusLabel = t("packageStatus", "sold_out", "Sold Out");
    else if (locale === "zh-CN") statusLabel = t("packageStatus", "sold_out", "已售罄");
    else statusLabel = status || "Đã hết chỗ";
  } else if (normalized.includes("da dong") || normalized.includes("closed")) {
    statusClass = "status-closed";
    if (locale === "en") statusLabel = t("packageStatus", "closed", "Closed");
    else if (locale === "zh-CN") statusLabel = t("packageStatus", "closed", "已关闭");
    else statusLabel = status || "Đã đóng";
  } else if (normalized.includes("tam ngung") || normalized.includes("tam dung") || normalized.includes("suspended")) {
    statusClass = "status-suspended";
    if (locale === "en") statusLabel = t("packageStatus", "suspended", "Suspended");
    else if (locale === "zh-CN") statusLabel = t("packageStatus", "suspended", "暂停");
    else statusLabel = status || "Tạm ngưng";
  } else {
    // If it doesn't match any standard normalized string, we just display it directly for 'vi' or translate to 'open' fallback for others
    statusClass = "status-open";
    if (locale === "vi") statusLabel = status;
    else statusLabel = t("packageStatus", "open", "Available");
  }

  return { statusClass, statusLabel };
}
