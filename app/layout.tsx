import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { normalizeLocale, withLocalePrefix } from "@/lib/i18n/config";
import { getActiveLanguages, getStaticTranslationMap } from "@/lib/i18n/server";
import type { LanguageOption, TranslationMap } from "@/lib/i18n/server";
import { I18nProvider } from "./components/I18nProvider";
import { SiteFooter } from "./components/SiteFooter";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "VietVista | Blog du l\u1ecbch Vi\u1ec7t Nam",
  description: "Blog du l\u1ecbch hi\u1ec7n \u0111\u1ea1i v\u1ec1 \u0111i\u1ec3m \u0111\u1ebfn, l\u1ecbch tr\u00ecnh v\u00e0 t\u01b0 v\u1ea5n g\u00f3i du l\u1ecbch Vi\u1ec7t Nam kh\u00f4ng thanh to\u00e1n online.",
};

function DisabledScreen({ locale, title, message, actionLabel }: { locale: string; title: string; message: React.ReactNode; actionLabel?: string }) {
  return (
    <html lang={locale} className={roboto.variable + " h-full antialiased"}>
      <body className="min-h-full flex flex-col justify-center items-center bg-[#fcf9f2] p-6 text-center">
        <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-inner">
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">{message}</p>
          </div>
          {actionLabel && (
            <div className="pt-2">
              <a href={withLocalePrefix("/", locale)} className="inline-flex px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all">
                {actionLabel}
              </a>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const locale = normalizeLocale(headersList.get("x-locale"));
  const isAdminOrApi = pathname.startsWith("/admin") || pathname.startsWith("/api");

  let isSuspended = false;
  let isPageDisabled = false;
  let disabledPageName = "";
  let staticTranslations: TranslationMap = {};
  let activeLanguages: LanguageOption[] = [];

  if (!isAdminOrApi) {
    try {
      const settings = await prisma.siteSetting.findMany();
      const settingsMap = settings.reduce<Record<string, string | null>>((acc, curr) => {
        acc[curr.settingKey] = curr.settingValue;
        return acc;
      }, {});

      if (settingsMap.site_status === "suspended") {
        isSuspended = true;
      }

      if (!isSuspended) {
        if (pathname === "/" && settingsMap.page_home_status === "inactive") {
          isPageDisabled = true;
          disabledPageName = "Trang ch\u1ee7";
        } else if (pathname.startsWith("/goi-du-lich") && settingsMap.page_tours_status === "inactive") {
          isPageDisabled = true;
          disabledPageName = "G\u00f3i du l\u1ecbch";
        } else if (pathname.startsWith("/huong-dan-visa") && settingsMap.page_visa_status === "inactive") {
          isPageDisabled = true;
          disabledPageName = "H\u01b0\u1edbng d\u1eabn Visa";
        } else if (pathname.startsWith("/tin-tuc") && settingsMap.page_news_status === "inactive") {
          isPageDisabled = true;
          disabledPageName = "Tin t\u1ee9c & C\u1ea9m nang";
        } else if (pathname.startsWith("/lien-he") && settingsMap.page_contact_status === "inactive") {
          isPageDisabled = true;
          disabledPageName = "Li\u00ean h\u1ec7";
        } else if (pathname.startsWith("/dac-san") && settingsMap.page_local_specialties_status === "inactive") {
          isPageDisabled = true;
          disabledPageName = "Đặc sản";
        }
      }
    } catch (err) {
      console.error("Failed to check site status:", err);
    }

    try {
      staticTranslations = await getStaticTranslationMap(locale);
      activeLanguages = await getActiveLanguages();
    } catch (err) {
      console.error("Failed to load static translations:", err);
    }
  }

  if (isSuspended) {
    return <DisabledScreen locale={locale} title="D\u1ecbch v\u1ee5 t\u1ea1m ng\u01b0ng ho\u1ea1t \u0111\u1ed9ng" message="Website hi\u1ec7n \u0111ang t\u1ea1m ng\u01b0ng do ch\u01b0a ho\u00e0n t\u1ea5t th\u1ee7 t\u1ee5c thanh to\u00e1n ho\u1eb7c \u0111ang b\u1ea3o tr\u00ec k\u1ef9 thu\u1eadt." />;
  }

  if (isPageDisabled) {
    return (
      <DisabledScreen
        locale={locale}
        title="K\u00eanh d\u1ecbch v\u1ee5 t\u1ea1m \u0111\u00f3ng"
        message={<><strong className="text-emerald-700 font-bold">{disabledPageName}</strong> hi\u1ec7n \u0111ang t\u1ea1m \u0111\u00f3ng \u0111\u1ec3 n\u00e2ng c\u1ea5p c\u1ea5u h\u00ecnh ho\u1eb7c t\u00f9y ch\u1ec9nh n\u1ed9i dung.</>}
        actionLabel="Quay l\u1ea1i Trang ch\u1ee7"
      />
    );
  }

  return (
    <html lang={locale} suppressHydrationWarning className={roboto.variable + " h-full antialiased"}>
      <body className="min-h-full flex flex-col">
        <I18nProvider locale={locale} translations={staticTranslations} languages={activeLanguages}>
          {children}
          <SiteFooter />
        </I18nProvider>
      </body>
    </html>
  );
}