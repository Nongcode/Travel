export const DEFAULT_LOCALE = "vi";
export const SUPPORTED_LOCALES = ["vi", "en", "zh-CN"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_PREFIXES: Record<SupportedLocale, string> = {
  vi: "",
  en: "/en",
  "zh-CN": "/zh",
};

export const PREFIX_TO_LOCALE: Record<string, SupportedLocale> = {
  vi: "vi",
  en: "en",
  zh: "zh-CN",
  "zh-CN": "zh-CN",
};

export const PUBLIC_LOCALE_SEGMENTS = new Set(["en", "zh"]);

export function normalizeLocale(value?: string | null): SupportedLocale {
  if (!value) return DEFAULT_LOCALE;
  const normalized = value.trim();
  return PREFIX_TO_LOCALE[normalized] || DEFAULT_LOCALE;
}

export function localePrefix(locale: string) {
  return LOCALE_PREFIXES[normalizeLocale(locale)];
}

export function stripLocaleFromPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (!first || !PUBLIC_LOCALE_SEGMENTS.has(first)) {
    return { locale: DEFAULT_LOCALE, pathname };
  }

  const stripped = "/" + segments.slice(1).join("/");
  return {
    locale: normalizeLocale(first),
    pathname: stripped === "/" ? "/" : stripped.replace(/\/$/, "") || "/",
  };
}

export function withLocalePrefix(href: string, locale: string) {
  const prefix = localePrefix(locale);
  if (!prefix || !href || href === "#" || href.startsWith("#")) return href;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) return href;
  if (href.startsWith("/api") || href.startsWith("/admin") || href.startsWith("/_next")) return href;
  if (href === "/") return prefix;
  if (href.startsWith(prefix + "/") || href === prefix) return href;
  return prefix + (href.startsWith("/") ? href : "/" + href);
}

export function detectLocaleFromAcceptLanguage(headerValue?: string | null): SupportedLocale {
  if (!headerValue) return DEFAULT_LOCALE;

  const preferences = headerValue
    .split(",")
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(";");
      const qParam = params.find((param) => param.trim().startsWith("q="));
      const q = qParam ? Number(qParam.trim().slice(2)) : 1;
      return { tag: rawTag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((item) => item.tag && item.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferences) {
    if (tag === "vi" || tag.startsWith("vi-")) return "vi";
    if (tag === "zh" || tag.startsWith("zh-")) return "zh-CN";
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }

  return DEFAULT_LOCALE;
}
