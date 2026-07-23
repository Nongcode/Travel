"use client";

import { createContext, useContext, ReactNode } from "react";
import { withLocalePrefix } from "@/lib/i18n/config";

export type ClientTranslationMap = Record<string, string>;

export type ClientLanguageOption = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isActive: boolean;
  isDefault: boolean;
};

type I18nContextValue = {
  locale: string;
  translations: ClientTranslationMap;
  languages: ClientLanguageOption[];
  hiddenPageKeys: string[];
  t: (namespace: string, key: string, fallback: string) => string;
  href: (href: string) => string;
};

const I18nContext = createContext<I18nContextValue>({
  locale: "vi",
  translations: {},
  languages: [],
  hiddenPageKeys: [],
  t: (_namespace, _key, fallback) => fallback,
  href: (href) => href,
});

export function I18nProvider({ locale, translations, languages, hiddenPageKeys, children }: { locale: string; translations: ClientTranslationMap; languages: ClientLanguageOption[]; hiddenPageKeys: string[]; children: ReactNode }) {
  const value: I18nContextValue = {
    locale,
    translations,
    languages,
    hiddenPageKeys,
    t(namespace, key, fallback) {
      return translations[namespace + "." + key] || fallback;
    },
    href(href) {
      return withLocalePrefix(href, locale);
    },
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
