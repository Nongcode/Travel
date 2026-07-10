import { normalizeLocale } from "@/lib/i18n/config";

export type TranslationProvider = "google";

const GOOGLE_TRANSLATE_ENDPOINT = "https://translation.googleapis.com/language/translate/v2";
const MAX_TEXTS_PER_REQUEST = 100;

function googleTarget(locale: string) {
  const normalized = normalizeLocale(locale);
  return normalized === "zh-CN" ? "zh-CN" : normalized;
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function translateChunk(texts: string[], targetLocale: string, sourceLocale: string, apiKey: string) {
  const response = await fetch(GOOGLE_TRANSLATE_ENDPOINT + "?key=" + encodeURIComponent(apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: texts,
      source: sourceLocale,
      target: googleTarget(targetLocale),
      format: "text",
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || "GOOGLE_TRANSLATE_FAILED");
  }

  const translated = data?.data?.translations;
  if (!Array.isArray(translated)) return texts;
  return translated.map((item: { translatedText?: string }, index: number) => decodeHtmlEntities(item.translatedText || texts[index]));
}

async function translateFree(texts: string[], targetLocale: string, sourceLocale = "vi"): Promise<string[]> {
  const results: string[] = [];
  for (const text of texts) {
    if (!text.trim()) {
      results.push(text);
      continue;
    }
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLocale}&tl=${googleTarget(targetLocale)}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Free translate failed");
      const data = await res.json();
      const translatedText = data?.[0]?.map((item: any) => item[0]).join("") || text;
      results.push(translatedText);
    } catch (err) {
      console.error("Free translate error:", err);
      results.push(text);
    }
  }
  return results;
}

export async function translateTexts(texts: string[], targetLocale: string, sourceLocale = "vi") {
  if (texts.length === 0) return [];

  const provider = process.env.TRANSLATION_PROVIDER || "google";
  if (provider !== "google") {
    throw new Error("UNSUPPORTED_TRANSLATION_PROVIDER");
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_TRANSLATE_API_KEY is missing, falling back to free Google Translate client (gtx)");
    return translateFree(texts, targetLocale, sourceLocale);
  }

  const results: string[] = [];
  for (let index = 0; index < texts.length; index += MAX_TEXTS_PER_REQUEST) {
    const chunk = texts.slice(index, index + MAX_TEXTS_PER_REQUEST).map((text) => text || "");
    results.push(...(await translateChunk(chunk, targetLocale, sourceLocale, apiKey)));
  }

  return results;
}
