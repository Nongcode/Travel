import type { Metadata } from "next";
import { LOCALE_PREFIXES, SUPPORTED_LOCALES, type SupportedLocale } from "@/lib/i18n/config";

export const SITE_NAME = "TimesGreen";
export const DEFAULT_SITE_URL = "https://timesgreen.net";
export const DEFAULT_OG_IMAGE_PATH = "/uploads/logos/logo-1784804267099-cda8540c.png";
export const DEFAULT_OG_IMAGE = {
  url: DEFAULT_OG_IMAGE_PATH,
  width: 1774,
  height: 887,
  alt: "TimesGreen",
};

export const indexRobots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    noimageindex: false,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

export const noIndexRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
};

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function localizedPath(path = "/", locale: SupportedLocale = "vi") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const prefix = LOCALE_PREFIXES[locale] || "";
  if (!prefix) return normalizedPath;
  if (normalizedPath === "/") return prefix;
  return `${prefix}${normalizedPath}`;
}

export function languageAlternates(path = "/") {
  const languages: Record<string, string> = {};
  for (const locale of SUPPORTED_LOCALES) {
    const hreflang = locale === "vi" ? "vi-VN" : locale;
    languages[hreflang] = localizedPath(path, locale);
  }
  languages["x-default"] = localizedPath(path, "vi");
  return languages;
}

export function absoluteLanguageAlternates(path = "/") {
  const languages = languageAlternates(path);
  return Object.fromEntries(Object.entries(languages).map(([locale, href]) => [locale, absoluteUrl(href)]));
}

export function publicAlternates(path = "/") {
  return {
    canonical: path,
    languages: languageAlternates(path),
  } satisfies Metadata["alternates"];
}

export function sitemapAlternates(path = "/") {
  return {
    languages: absoluteLanguageAlternates(path),
  };
}

export function publicPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: typeof DEFAULT_OG_IMAGE | { url: string; width?: number; height?: number; alt?: string };
  type?: "website" | "article";
}): Metadata {
  return {
    title,
    description,
    alternates: publicAlternates(path),
    openGraph: {
      title,
      description,
      url: path,
      type,
      siteName: SITE_NAME,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
    robots: indexRobots,
  };
}