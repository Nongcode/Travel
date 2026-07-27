export type SiteMenuLocation = "header" | "footer";

export type SiteMenuItem = {
  id: number;
  label: string;
  url: string;
  order: number;
  location: SiteMenuLocation;
  translationKey?: string;
  settingKey?: string;
};

export type HeaderSiteConfig = {
  logoUrl: string;
  logoAlt: string;
  companyName: string;
  menu: SiteMenuItem[];
};

export type FooterSiteConfig = {
  brandName: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  twitter: string;
  copyright: string;
  menu: SiteMenuItem[];
};

export type SiteChromeConfig = {
  header: HeaderSiteConfig;
  footer: FooterSiteConfig;
};

export const DEFAULT_HEADER_MENU: SiteMenuItem[] = [
  { id: -1, label: "Trang chủ", url: "/", order: 1, location: "header", translationKey: "home", settingKey: "page_home_status" },
  { id: -2, label: "Tin tức", url: "/tin-tuc", order: 2, location: "header", translationKey: "news", settingKey: "page_news_status" },
  { id: -3, label: "Gói du lịch", url: "/goi-du-lich", order: 3, location: "header", translationKey: "packages", settingKey: "page_tours_status" },
  { id: -4, label: "Visa", url: "/huong-dan-visa", order: 4, location: "header", translationKey: "visa", settingKey: "page_visa_status" },
  { id: -5, label: "Đặc sản", url: "/dac-san", order: 5, location: "header", translationKey: "local_specialty", settingKey: "page_local_specialties_status" },
  { id: -6, label: "Liên hệ", url: "/lien-he", order: 6, location: "header", translationKey: "contact", settingKey: "page_contact_status" },
];

export const DEFAULT_FOOTER_MENU: SiteMenuItem[] = [
  { id: -101, label: "Trang chủ", url: "/", order: 1, location: "footer", translationKey: "home", settingKey: "page_home_status" },
  { id: -102, label: "Tin tức", url: "/tin-tuc", order: 2, location: "footer", translationKey: "news", settingKey: "page_news_status" },
  { id: -103, label: "Gói du lịch", url: "/goi-du-lich", order: 3, location: "footer", translationKey: "packages", settingKey: "page_tours_status" },
  { id: -104, label: "Visa", url: "/huong-dan-visa", order: 4, location: "footer", translationKey: "visa", settingKey: "page_visa_status" },
  { id: -105, label: "Ưu đãi", url: "/uu-dai", order: 5, location: "footer", translationKey: "offers" },
  { id: -106, label: "Liên hệ", url: "/lien-he", order: 6, location: "footer", translationKey: "contact", settingKey: "page_contact_status" },
  { id: -107, label: "Admin", url: "/admin", order: 7, location: "footer", translationKey: "admin" },
];

export const DEFAULT_SITE_CHROME_CONFIG: SiteChromeConfig = {
  header: {
    logoUrl: "/vietvista-logo.png",
    logoAlt: "TimesGreen Travel & Discover",
    companyName: "TimesGreen",
    menu: DEFAULT_HEADER_MENU,
  },
  footer: {
    brandName: "TimesGreen",
    description: "Blog du lịch và kênh tư vấn hành trình Việt Nam. Website chỉ thu thập thông tin liên hệ, không xử lý thanh toán trực tuyến.",
    address: "",
    phone: "090 123 4567",
    email: "hello@vietvista.vn",
    facebook: "",
    instagram: "",
    twitter: "",
    copyright: "© 2026 TimesGreen. All rights reserved.",
    menu: DEFAULT_FOOTER_MENU,
  },
};

const MENU_METADATA_BY_URL: Record<string, Pick<SiteMenuItem, "translationKey" | "settingKey">> = {
  "/": { translationKey: "home", settingKey: "page_home_status" },
  "/tin-tuc": { translationKey: "news", settingKey: "page_news_status" },
  "/goi-du-lich": { translationKey: "packages", settingKey: "page_tours_status" },
  "/huong-dan-visa": { translationKey: "visa", settingKey: "page_visa_status" },
  "/dac-san": { translationKey: "local_specialty", settingKey: "page_local_specialties_status" },
  "/uu-dai": { translationKey: "offers" },
  "/lien-he": { translationKey: "contact", settingKey: "page_contact_status" },
  "/admin": { translationKey: "admin" },
};

export function decorateSiteMenuItem(item: Omit<SiteMenuItem, "translationKey" | "settingKey">): SiteMenuItem {
  return { ...item, ...MENU_METADATA_BY_URL[item.url] };
}

