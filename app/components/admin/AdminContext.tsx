"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { packages as seedPackages, posts as seedPosts } from "../../data/travel";

export type ContentTranslationFields = Record<string, string>;
export type ContentTranslationMap = Record<string, ContentTranslationFields>;

export type AdminPost = {
  id: number;
  title: string;
  category: string;
  destinationId?: number | null;
  destination?: string | null;
  date: string;
  status: string;
  imageUrl?: string;
  contentImageUrl?: string;
  excerpt?: string;
  readTime?: string;
  seoDescription?: string;
  summary?: string;
  translations?: ContentTranslationMap;
};

export type AdminPackage = {
  id: number;
  name: string;
  destination: string;
  duration: string;
  price: string;
  status: string;
};

export type PostCategory = {
  id: number;
  name: string;
  slug: string;
};

export type PackageCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
};

export type PromoPackage = {
  id: number;
  name: string;
  packageName: string;
  discountValue: string;
  validUntil: string;
  status: string;
};

export type ServicePackage = {
  id: number;
  name: string;
  price: string;
  type: string;
  description: string;
  status: string;
};

export type AdminBanner = {
  id: number;
  type: "homepage" | "subpage" | "detail";
  title: string;
  subtitle: string;
  image: string;
  link: string;
  status: string;
};

export type HeaderMenuItem = {
  id: number;
  label: string;
  url: string;
  order: number;
};

export type FooterInfo = {
  brandName: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  twitter: string;
  copyright: string;
};

export type AdminBooking = {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  tourName: string;
  bookingDate: string;
  travelDate: string;
  numberOfTravelers: number;
  totalPrice: string;
  status: "Chờ xử lý" | "Đang xử lý" | "Đã xác nhận" | "Đã hủy" | "Hoàn tất";
  notes?: string;
  adminNotes?: string;
};

export type LanguageSetting = {
  id: number;
  code: string;
  name: string;
  flag: string;
  isActive: boolean;
  isDefault: boolean;
};

export type StaticTranslation = {
  id: number;
  key: string;
  description: string;
  translations: {
    [langCode: string]: string;
  };
};

export type AdminReview = {
  id: number;
  customerName: string;
  packageName: string;
  rating: number;
  comment: string;
  date: string;
  status: "Hiển thị" | "Ẩn";
  avatar?: string;
};


export type AdminCustomer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: string;
  dateAdded: string;
  notes?: string;
  status: "Hoạt động" | "Khóa";
};

export type MediaFile = {
  id: number;
  name: string;
  url: string;
  type: "image" | "video";
  size: string;
  dimensions?: string;
  uploadedAt: string;
};

export type SeoConfig = {
  id: number;
  page: string;
  urlPath: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage?: string;
};

type AdminContextValue = {
  posts: AdminPost[];
  packages: AdminPackage[];
  postCategories: PostCategory[];
  packageCategories: PackageCategory[];
  promoPackages: PromoPackage[];
  servicePackages: ServicePackage[];
  banners: AdminBanner[];
  headerMenu: HeaderMenuItem[];
  footerInfo: FooterInfo;
  bookings: AdminBooking[];
  languages: LanguageSetting[];
  translations: StaticTranslation[];
  reviews: AdminReview[];

  customers: AdminCustomer[];
  mediaFiles: MediaFile[];
  seoConfigs: SeoConfig[];

  addPost: (p: {
    title: string;
    category: string;
    status?: string;
    date?: string;
    imageUrl?: string;
    contentImageUrl?: string;
    excerpt?: string;
    readTime?: string;
    seoDescription?: string;
    summary?: string;
    translations?: ContentTranslationMap;
  }) => void;
  updatePost: (id: number, updated: Partial<AdminPost>) => void;
  removePost: (id: number) => void;

  addPackage: (p: { name: string; destination: string; duration?: string; price?: string; status?: string }) => void;
  updatePackage: (id: number, updated: Partial<AdminPackage>) => void;
  removePackage: (id: number) => void;

  addPostCategory: (name: string, slug?: string) => void;
  updatePostCategory: (id: number, name: string, slug: string) => void;
  removePostCategory: (id: number) => void;

  addPackageCategory: (cat: Omit<PackageCategory, "id">) => void;
  updatePackageCategory: (id: number, updated: Partial<PackageCategory>) => void;
  removePackageCategory: (id: number) => void;

  addPromoPackage: (promo: Omit<PromoPackage, "id">) => void;
  updatePromoPackage: (id: number, updated: Partial<PromoPackage>) => void;
  removePromoPackage: (id: number) => void;

  addServicePackage: (service: Omit<ServicePackage, "id">) => void;
  updateServicePackage: (id: number, updated: Partial<ServicePackage>) => void;
  removeServicePackage: (id: number) => void;

  addBanner: (banner: Omit<AdminBanner, "id">) => void;
  updateBanner: (id: number, updated: Partial<AdminBanner>) => void;
  removeBanner: (id: number) => void;

  addHeaderMenuItem: (item: Omit<HeaderMenuItem, "id">) => void;
  updateHeaderMenuItem: (id: number, updated: Partial<HeaderMenuItem>) => void;
  removeHeaderMenuItem: (id: number) => void;

  updateFooterInfo: (info: Partial<FooterInfo>) => void;

  addBooking: (b: Omit<AdminBooking, "id" | "bookingDate" | "status">) => void | Promise<void>;
  updateBooking: (id: number, updated: Partial<AdminBooking>) => void | Promise<void>;
  removeBooking: (id: number) => void | Promise<void>;

  addLanguage: (lang: Omit<LanguageSetting, "id">) => void;
  updateLanguage: (id: number, updated: Partial<LanguageSetting>) => void;
  removeLanguage: (id: number) => void;

  addTranslation: (trans: Omit<StaticTranslation, "id">) => void;
  updateTranslation: (id: number, updated: Partial<StaticTranslation>) => void;
  removeTranslation: (id: number) => void;

  addReview: (rev: Omit<AdminReview, "id" | "date">) => void;
  updateReview: (id: number, updated: Partial<AdminReview>) => void;
  removeReview: (id: number) => void;



  addCustomer: (c: Omit<AdminCustomer, "id" | "dateAdded" | "totalBookings" | "totalSpent">) => void;
  updateCustomer: (id: number, updated: Partial<AdminCustomer>) => void;
  removeCustomer: (id: number) => void;

  addMediaFile: (file: Omit<MediaFile, "id" | "uploadedAt">) => void;
  removeMediaFile: (id: number) => void;

  updateSeoConfig: (id: number, updated: Partial<SeoConfig>) => void;

  isAuthenticated: boolean;
  authReady: boolean;
  currentAdmin: { id: number; email: string; fullName: string; role: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetDatabase: () => void;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const postStorageKey = "vietvista-admin-posts";
  const packageStorageKey = "vietvista-admin-packages";
  const postCatStorageKey = "vietvista-admin-post-cats";
  const pkgCatStorageKey = "vietvista-admin-pkg-cats";
  const promoStorageKey = "vietvista-admin-promos";
  const serviceStorageKey = "vietvista-admin-services";
  const bannerStorageKey = "vietvista-admin-banners";
  const headerStorageKey = "vietvista-admin-headers";
  const footerStorageKey = "vietvista-admin-footers";
  const authStorageKey = "vietvista-admin-auth";

  const bookingStorageKey = "vietvista-admin-bookings";
  const languageStorageKey = "vietvista-admin-languages";
  const translationStorageKey = "vietvista-admin-translations";
  const reviewStorageKey = "vietvista-admin-reviews";

  const customerStorageKey = "vietvista-admin-customers";
  const mediaStorageKey = "vietvista-admin-media";
  const seoStorageKey = "vietvista-admin-seo";

  // Initial Seed Data
  const initialPosts: AdminPost[] = seedPosts.map(({ id, title, category, date, status }) => ({ id, title, category, date, status }));
  const initialPackages: AdminPackage[] = seedPackages.map(({ id, name, destination, duration, price, status }) => ({ id, name, destination, duration, price, status }));

  const initialPostCategories: PostCategory[] = [
    { id: 1, name: "Vịnh Hạ Long", slug: "vinh-ha-long" },
    { id: 2, name: "ÄÃ  Náºµng - Há»™i An", slug: "da-nang-hoi-an" },
    { id: 3, name: "Phú Quốc", slug: "phu-quoc" },
    { id: 4, name: "Hà Giang", slug: "ha-giang" },
    { id: 5, name: "Sapa", slug: "sapa" },
    { id: 6, name: "Nha Trang", slug: "nha-trang" },
  ];

  const initialPackageCategories: PackageCategory[] = [
    { id: 1, name: "Adventure Tours", slug: "adventure-tours", description: "Trekking, motorbiking, and exploring rugged landscapes for adrenaline seekers." },
    { id: 2, name: "Luxury & Cruises", slug: "luxury-cruises", description: "Premium yachts, 5-star hotels, and customized high-end itineraries." },
    { id: 3, name: "Cultural & Heritage", slug: "cultural-heritage", description: "Immersive local life, ancient temples, cooking classes, and historical sites." },
    { id: 4, name: "Wellness & Spa", slug: "wellness-spa", description: "Yoga retreats, hot springs, and relaxing resort staycations." },
    { id: 5, name: "Eco-tourism & Nature", slug: "eco-tourism-nature", description: "Sustainable stays, national parks, and wildlife observation tours." },
  ];

  const initialPromoPackages: PromoPackage[] = [
    { id: 1, name: "Early Bird 15%", packageName: "Luxury Phú Quốc Getaway", discountValue: "15%", validUntil: "2026-08-31", status: "Äang má»Ÿ" },
    { id: 2, name: "Summer Deal 10%", packageName: "Ninh BÃ¬nh Weekend Getaway", discountValue: "10%", validUntil: "2026-07-15", status: "Äang má»Ÿ" },
  ];

  const initialServicePackages: ServicePackage[] = [
    { id: 1, name: "Private English-speaking Guide", price: "$50/Day", type: "Hướng dẫn viên", description: "Professional local guide fluent in English with rich knowledge.", status: "Äang má»Ÿ" },
    { id: 2, name: "Luxury Airport Pickup (Sedan)", price: "$30/Trip", type: "Vận chuyển", description: "Private luxury airport pickup to hotel in Da Nang or Hanoi.", status: "Äang má»Ÿ" },
    { id: 3, name: "Local 4G/5G SIM Card", price: "$10/Unit", type: "Tiện ích", description: "Pre-paid sim card with 4GB high-speed data daily, pre-activated.", status: "Äang má»Ÿ" },
  ];

  const initialBanners: AdminBanner[] = [
    { id: 1, type: "homepage", title: "Discover Untouched Vietnam", subtitle: "Handcrafted private itineraries tailored just for you", image: "/hero-bg.jpg", link: "/goi-du-lich", status: "Äang má»Ÿ" },
    { id: 2, type: "subpage", title: "Travel Guides & Insider Tips", subtitle: "Get inspiration from our local experts", image: "/news-banner.jpg", link: "/tin-tuc", status: "Äang má»Ÿ" },
    { id: 3, type: "detail", title: "Exclusive Offers & Packages", subtitle: "Book early, save more on standard packages", image: "/detail-banner.jpg", link: "/uu-dai", status: "Äang má»Ÿ" },
  ];

  const initialHeaderMenu: HeaderMenuItem[] = [
    { id: 1, label: "Home", url: "/", order: 1 },
    { id: 2, label: "Tours & Packages", url: "/goi-du-lich", order: 2 },
    { id: 3, label: "Travel Blog", url: "/tin-tuc", order: 3 },
    { id: 4, label: "Offers", url: "/uu-dai", order: 4 },
    { id: 5, label: "Contact Us", url: "/lien-he", order: 5 },
  ];

  const initialFooterInfo: FooterInfo = {
    brandName: "VietVista",
    description: "Your ultimate gateway to exploring local, authentic, and customized journeys across Vietnam.",
    address: "123 Le Loi Street, Hai Chau, Da Nang, Vietnam",
    phone: "+84 1900 1234",
    email: "contact@vietvista.com",
    facebook: "https://facebook.com/vietvista",
    instagram: "https://instagram.com/vietvista",
    twitter: "https://twitter.com/vietvista",
    copyright: "Â© 2026 VietVista Travel. All Rights Reserved.",
  };

  const initialBookings: AdminBooking[] = [
    { id: 1, customerName: "David Miller", email: "david.miller@example.com", phone: "+1 415 555 2671", tourName: "Hội An đi chậm", bookingDate: "2026-05-20", travelDate: "2026-06-15", numberOfTravelers: 2, totalPrice: "11.800.000đ", status: "Chờ xử lý", notes: "YÃªu cáº§u phÃ²ng non-smoking, táº§ng cao." },
    { id: 2, customerName: "Sarah Connor", email: "sarah.c@gmail.com", phone: "+61 2 9382 0192", tourName: "Cung đường ảnh Hà Giang", bookingDate: "2026-05-18", travelDate: "2026-07-10", numberOfTravelers: 1, totalPrice: "7.400.000đ", status: "Đang xử lý", notes: "Muá»‘n thuÃª thÃªm xe mÃ¡y tá»± lÃ¡i." },
    { id: 3, customerName: "Nguyen Van A", email: "anguyen@vietnam.com", phone: "0905123456", tourName: "Kỳ nghỉ gia đình Phú Quốc", bookingDate: "2026-05-15", travelDate: "2026-06-05", numberOfTravelers: 4, totalPrice: "24.800.000đ", status: "Đã xác nhận", notes: "CÃ³ ngÆ°á» i giÃ  Ä‘i cÃ¹ng, cáº§n xe lÄƒn há»— trá»£ táº¡i sÃ¢n bay." },
    { id: 4, customerName: "Yuki Tanaka", email: "yuki.tanaka@japan-travel.jp", phone: "+81 90 1234 5678", tourName: "Hội An đi chậm", bookingDate: "2026-05-10", travelDate: "2026-05-25", numberOfTravelers: 2, totalPrice: "11.800.000đ", status: "Đã hủy", notes: "Há»§y do thay Ä‘á»•i lá»‹ch bay." }
  ];

  const initialLanguages: LanguageSetting[] = [
    { id: 1, code: "vi", name: "Tiếng Việt", flag: "ðŸ‡»ðŸ‡³", isActive: true, isDefault: true },
    { id: 2, code: "en", name: "English", flag: "ðŸ‡ºðŸ‡¸", isActive: true, isDefault: false },
    { id: 3, code: "zh", name: "ä¸­æ–‡", flag: "ðŸ‡¨ðŸ‡³", isActive: false, isDefault: false },
    { id: 4, code: "ja", name: "æ—¥æœ¬èªž", flag: "ðŸ‡¯ðŸ‡µ", isActive: false, isDefault: false }
  ];

  const initialTranslations: StaticTranslation[] = [
    { id: 1, key: "explore_vietnam", description: "TiÃªu Ä‘á» lá»›n táº¡i trang chá»§", translations: { vi: "Khám phá Việt Nam", en: "Explore Vietnam", zh: "æŽ¢ç´¢è¶Šå—", ja: "ãƒ™ãƒˆãƒŠãƒ ã‚’æŽ¢ç´¢" } },
    { id: 2, key: "search_tours", description: "Placeholder cho thanh tÃ¬m kiáº¿m tour", translations: { vi: "Tìm tên gói, điểm đến...", en: "Search tours, destinations...", zh: "æœç´¢è¡Œç¨‹ï¼Œç›®çš„åœ°...", ja: "ãƒ„ã‚¢ãƒ¼ã€ç›®çš„åœ°ã‚’æ¤œç´¢..." } },
    { id: 3, key: "contact_us", description: "Menu liÃªn há»‡", translations: { vi: "Liên hệ", en: "Contact Us", zh: "è”ç³» chúng tôi", ja: "ãŠå•ã„åˆã‚ã›" } },
    { id: 4, key: "book_now", description: "NÃºt Ä‘áº·t tour", translations: { vi: "Äáº·t tour ngay", en: "Book Now", zh: "ç«‹å³é¢„è®¢", ja: "ä»Šã™ãäºˆç´„" } }
  ];

  const initialReviews: AdminReview[] = [
    { id: 1, customerName: "Emily Watson", packageName: "Hội An đi chậm", rating: 5, comment: "An absolutely wonderful experience. The cooking class on the river bank was the highlight of our trip!", date: "2026-05-10", status: "Hiển thị", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
    { id: 2, customerName: "Marcus Aurelius", packageName: "Cung Ä‘Æ°á»ng áº£nh Hà Giang", rating: 5, comment: "Breathtaking landscapes and extremely professional organization. The tour guide was very knowledgeable.", date: "2026-05-08", status: "Hiển thị", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
    { id: 3, customerName: "Jeanne d'Arc", packageName: "Kỳ nghỉ gia đình Phú Quốc", rating: 4, comment: "The resort was top-notch, very child friendly. Transfer service could be slightly faster.", date: "2026-05-05", status: "Hiển thị", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" }
  ];



  const initialCustomers: AdminCustomer[] = [
    { id: 1, name: "David Miller", email: "david.miller@example.com", phone: "+1 415 555 2671", totalBookings: 1, totalSpent: "11.800.000Ä‘", dateAdded: "2026-05-20", status: "Hoạt động" },
    { id: 2, name: "Sarah Connor", email: "sarah.c@gmail.com", phone: "+61 2 9382 0192", totalBookings: 1, totalSpent: "7.400.000Ä‘", dateAdded: "2026-05-18", status: "Hoạt động" },
    { id: 3, name: "Nguyen Van A", email: "anguyen@vietnam.com", phone: "0905123456", totalBookings: 1, totalSpent: "24.800.000Ä‘", dateAdded: "2026-05-15", status: "Hoạt động" },
    { id: 4, name: "Yuki Tanaka", email: "yuki.tanaka@japan-travel.jp", phone: "+81 90 1234 5678", totalBookings: 1, totalSpent: "11.800.000Ä‘", dateAdded: "2026-05-10", status: "Hoạt động" }
  ];

  const initialMediaFiles: MediaFile[] = [
    { id: 1, name: "ha-long-bay-sunset.jpg", url: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80", type: "image", size: "485 KB", dimensions: "1200x800", uploadedAt: "2026-05-20 14:30" },
    { id: 2, name: "hoi-an-street.jpg", url: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80", type: "image", size: "512 KB", dimensions: "1200x900", uploadedAt: "2026-05-19 09:15" },
    { id: 3, name: "phu-quoc-resort-aerial.jpg", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", type: "image", size: "620 KB", dimensions: "1600x1000", uploadedAt: "2026-05-18 16:45" },
    { id: 4, name: "vietnam-intro-video.mp4", url: "https://assets.mixkit.co/videos/preview/mixkit-beautiful-aerial-view-of-a-green-valley-in-vietnam-40019-large.mp4", type: "video", size: "12.4 MB", uploadedAt: "2026-05-15 11:20" }
  ];

  const initialSeoConfigs: SeoConfig[] = [
    { id: 1, page: "Trang chá»§", urlPath: "/", metaTitle: "VietVista - Tour du lá»‹ch Viá»‡t Nam Ä‘á»™c báº£n cho khÃ¡ch nÆ°á»›c ngoÃ i", metaDescription: "Thiáº¿t káº¿ tour du lá»‹ch riÃªng tÆ°, Ä‘á»™c Ä‘Ã¡o khÃ¡m phÃ¡ vÄƒn hÃ³a báº£n Ä‘á»‹a, áº©m thá»±c vÃ  danh lam tháº¯ng cáº£nh Viá»‡t Nam vá»›i dá»‹ch vá»¥ 5 sao.", metaKeywords: "vietnam travel, private tour vietnam, luxury vietnam holiday, customized tour", ogImage: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80" },
    { id: 2, page: "Danh sÃ¡ch Tour", urlPath: "/goi-du-lich", metaTitle: "GÃ³i Tour Du Lá»‹ch Viá»‡t Nam Tá»± Chá»n - VietVista Travel", metaDescription: "Danh sÃ¡ch gÃ³i tour nghá»‰ dÆ°á»¡ng biá»ƒn Ä‘áº£o Phú Quốc, trekking Hà Giang, khÃ¡m phÃ¡ vÄƒn hÃ³a di sáº£n Há»™i An. Äáº·t tour trá»±c tuyáº¿n tÆ° váº¥n miá»…n phÃ­.", metaKeywords: "tours vietnam, sapa tour, hoi an package, phu quoc vacation", ogImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80" },
    { id: 3, page: "BÃ i viáº¿t Cáº©m nang", urlPath: "/tin-tuc", metaTitle: "Blog Chia Sáº» Cáº©m Nang Du Lá»‹ch Viá»‡t Nam Tá»± TÃºc - VietVista", metaDescription: "Lá»i khuyÃªn, hÆ°á»›ng dáº«n chi tiáº¿t, Ä‘iá»ƒm check-in áº©n vÃ  máº¹o Äƒn uá»‘ng báº£n Ä‘á»‹a tá»« cÃ¡c chuyÃªn gia lá»¯ hÃ nh VietVista.", metaKeywords: "vietnam blog, travel guide vietnam, sapa guide, local tips", ogImage: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80" },
    { id: 4, page: "Liên hệ", urlPath: "/lien-he", metaTitle: "LiÃªn Há»‡ Thiáº¿t Káº¿ Tour RiÃªng - VietVista Support 24/7", metaDescription: "Liên hệ vá»›i Ä‘á»™i ngÅ© VietVista Ä‘á»ƒ nháº­n lá»‹ch trÃ¬nh Ä‘Æ°á»£c cÃ¡ nhÃ¢n hÃ³a miá»…n phÃ­ trong vÃ²ng 24 giá». Gá»i ngay hotline hoáº·c gá»­i tin nháº¯n.", metaKeywords: "contact travel agency, customized tour service, vietnam travel agent", ogImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80" }
  ];

  // State Definitions with lazy localstorage loading
  const [posts, setPosts] = useState<AdminPost[]>(() => {
    if (typeof window === "undefined") return initialPosts;
    const saved = window.localStorage.getItem(postStorageKey);
    return saved ? JSON.parse(saved) : initialPosts;
  });

  const [packages, setPackages] = useState<AdminPackage[]>(() => {
    if (typeof window === "undefined") return initialPackages;
    const saved = window.localStorage.getItem(packageStorageKey);
    return saved ? JSON.parse(saved) : initialPackages;
  });

  const [postCategories, setPostCategories] = useState<PostCategory[]>(() => {
    if (typeof window === "undefined") return initialPostCategories;
    const saved = window.localStorage.getItem(postCatStorageKey);
    return saved ? JSON.parse(saved) : initialPostCategories;
  });

  const [packageCategories, setPackageCategories] = useState<PackageCategory[]>(() => {
    if (typeof window === "undefined") return initialPackageCategories;
    const saved = window.localStorage.getItem(pkgCatStorageKey);
    return saved ? JSON.parse(saved) : initialPackageCategories;
  });

  const [promoPackages, setPromoPackages] = useState<PromoPackage[]>(() => {
    if (typeof window === "undefined") return initialPromoPackages;
    const saved = window.localStorage.getItem(promoStorageKey);
    return saved ? JSON.parse(saved) : initialPromoPackages;
  });

  const [servicePackages, setServicePackages] = useState<ServicePackage[]>(() => {
    if (typeof window === "undefined") return initialServicePackages;
    const saved = window.localStorage.getItem(serviceStorageKey);
    return saved ? JSON.parse(saved) : initialServicePackages;
  });

  const [banners, setBanners] = useState<AdminBanner[]>(() => {
    if (typeof window === "undefined") return initialBanners;
    const saved = window.localStorage.getItem(bannerStorageKey);
    return saved ? JSON.parse(saved) : initialBanners;
  });

  const [headerMenu, setHeaderMenu] = useState<HeaderMenuItem[]>(() => {
    if (typeof window === "undefined") return initialHeaderMenu;
    const saved = window.localStorage.getItem(headerStorageKey);
    return saved ? JSON.parse(saved) : initialHeaderMenu;
  });

  const [footerInfo, setFooterInfo] = useState<FooterInfo>(() => {
    if (typeof window === "undefined") return initialFooterInfo;
    const saved = window.localStorage.getItem(footerStorageKey);
    return saved ? JSON.parse(saved) : initialFooterInfo;
  });

  const [bookings, setBookings] = useState<AdminBooking[]>(() => {
    if (typeof window === "undefined") return initialBookings;
    const saved = window.localStorage.getItem(bookingStorageKey);
    return saved ? JSON.parse(saved) : initialBookings;
  });

  const [languages, setLanguages] = useState<LanguageSetting[]>(() => {
    if (typeof window === "undefined") return initialLanguages;
    const saved = window.localStorage.getItem(languageStorageKey);
    return saved ? JSON.parse(saved) : initialLanguages;
  });

  const [translations, setTranslations] = useState<StaticTranslation[]>(() => {
    if (typeof window === "undefined") return initialTranslations;
    const saved = window.localStorage.getItem(translationStorageKey);
    return saved ? JSON.parse(saved) : initialTranslations;
  });

  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(() => {
    if (typeof window === "undefined") return initialMediaFiles;
    const saved = window.localStorage.getItem(mediaStorageKey);
    return saved ? JSON.parse(saved) : initialMediaFiles;
  });

  const [seoConfigs, setSeoConfigs] = useState<SeoConfig[]>(() => {
    if (typeof window === "undefined") return initialSeoConfigs;
    const saved = window.localStorage.getItem(seoStorageKey);
    return saved ? JSON.parse(saved) : initialSeoConfigs;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    // HTTP-only cookie mới là nguồn xác thực chính; chờ /api/admin/me trước khi kết luận.
    return true;
  });
  const [authReady, setAuthReady] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<{ id: number; email: string; fullName: string; role: string } | null>(null);
  // Kiá»ƒm tra phiÃªn lÃ m viá»‡c ngay khi load trang
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/admin/me");
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(data.isAuthenticated);
          setCurrentAdmin(data.admin);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(authStorageKey, "1");
          }
        } else {
          setIsAuthenticated(false);
          setCurrentAdmin(null);
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(authStorageKey);
          }
        }
      } catch (err) {
        console.error("Lá»—i kiá»ƒm tra phiÃªn lÃ m viá»‡c:", err);
        setIsAuthenticated(false);
        setCurrentAdmin(null);
      } finally {
        setAuthReady(true);
      }
    }
    checkSession();
  }, []);

  // Tải danh sách bài viết từ database khi đã đăng nhập
  useEffect(() => {
    async function loadDbPosts() {
      if (authReady && isAuthenticated) {
        try {
          const res = await fetch("/api/admin/posts");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.posts)) {
              setPosts(data.posts);
            }
          }
        } catch (err) {
          console.error("Lỗi khi tải danh sách bài viết từ database:", err);
        }
      }
    }
    loadDbPosts();
  }, [authReady, isAuthenticated]);

  useEffect(() => {
    async function loadDbPackages() {
      if (authReady && isAuthenticated) {
        try {
          const res = await fetch("/api/admin/packages");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.packages)) {
              setPackages(data.packages);
            }
          }
        } catch (err) {
          console.error("Lỗi khi tải danh sách gói du lịch từ database:", err);
        }
      }
    }
    loadDbPackages();
  }, [authReady, isAuthenticated]);

  useEffect(() => {
    async function loadDbBookings() {
      if (authReady && isAuthenticated) {
        try {
          const res = await fetch("/api/admin/bookings");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.bookings)) {
              setBookings(data.bookings);
            }
          }
        } catch (err) {
          console.error("Lá»—i khi táº£i danh sÃ¡ch bookings tá»« database:", err);
        }
      }
    }
    loadDbBookings();
  }, [authReady, isAuthenticated]);

  useEffect(() => {
    async function loadDbReviews() {
      if (authReady && isAuthenticated) {
        try {
          const res = await fetch("/api/admin/reviews");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.reviews)) {
              setReviews(data.reviews);
            }
          }
        } catch (err) {
          console.error("Lá»—i khi táº£i danh sÃ¡ch reviews tá»« database:", err);
        }
      }
    }
    loadDbReviews();
  }, [authReady, isAuthenticated]);

  useEffect(() => {
    async function loadDbCustomers() {
      if (authReady && isAuthenticated) {
        try {
          const res = await fetch("/api/admin/customers");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.customers)) {
              setCustomers(data.customers);
            }
          }
        } catch (err) {
          console.error("Lá»—i khi táº£i danh sÃ¡ch khÃ¡ch hÃ ng tá»« database:", err);
        }
      }
    }
    loadDbCustomers();
  }, [authReady, isAuthenticated]);

  // Effects to save states to localstorage
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(postStorageKey, JSON.stringify(posts)); }, [posts]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(packageStorageKey, JSON.stringify(packages)); }, [packages]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(postCatStorageKey, JSON.stringify(postCategories)); }, [postCategories]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(pkgCatStorageKey, JSON.stringify(packageCategories)); }, [packageCategories]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(promoStorageKey, JSON.stringify(promoPackages)); }, [promoPackages]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(serviceStorageKey, JSON.stringify(servicePackages)); }, [servicePackages]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(bannerStorageKey, JSON.stringify(banners)); }, [banners]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(headerStorageKey, JSON.stringify(headerMenu)); }, [headerMenu]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(footerStorageKey, JSON.stringify(footerInfo)); }, [footerInfo]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(bookingStorageKey, JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(languageStorageKey, JSON.stringify(languages)); }, [languages]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(translationStorageKey, JSON.stringify(translations)); }, [translations]);

  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(mediaStorageKey, JSON.stringify(mediaFiles)); }, [mediaFiles]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(seoStorageKey, JSON.stringify(seoConfigs)); }, [seoConfigs]);

  async function addPost(p: {
    title: string;
    category: string;
    status?: string;
    date?: string;
    imageUrl?: string;
    contentImageUrl?: string;
    excerpt?: string;
    readTime?: string;
    seoDescription?: string;
    summary?: string;
    translations?: ContentTranslationMap;
  }) {
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.post) {
          setPosts((current) => [data.post, ...current]);
        } else {
          alert(data.error || "Lá»—i khi táº¡o bÃ i viáº¿t.");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Lá»—i káº¿t ná»‘i mÃ¡y chá»§ khi táº¡o bÃ i viáº¿t.");
      }
    } catch (err) {
      console.error("Lá»—i khi thÃªm bÃ i viáº¿t:", err);
      alert("Lá»—i há»‡ thá»‘ng khi thÃªm bÃ i viáº¿t.");
    }
  }

  async function updatePost(id: number, updated: Partial<AdminPost>) {
    try {
      const res = await fetch("/api/admin/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updated }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.post) {
          setPosts((current) =>
            current.map((post) => (post.id === id ? { ...post, ...data.post } : post))
          );
        } else {
          alert(data.error || "Lá»—i khi cáº­p nháº­t bÃ i viáº¿t.");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Lá»—i káº¿t ná»‘i mÃ¡y chá»§ khi cáº­p nháº­t bÃ i viáº¿t.");
      }
    } catch (err) {
      console.error("Lá»—i khi cáº­p nháº­t bÃ i viáº¿t:", err);
      alert("Lá»—i há»‡ thá»‘ng khi cáº­p nháº­t bÃ i viáº¿t.");
    }
  }

  async function removePost(id: number) {
    try {
      const res = await fetch(`/api/admin/posts?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPosts((current) => current.filter((p) => p.id !== id));
        } else {
          alert(data.error || "Lá»—i khi xÃ³a bÃ i viáº¿t.");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Lá»—i káº¿t ná»‘i mÃ¡y chá»§ khi xÃ³a bÃ i viáº¿t.");
      }
    } catch (err) {
      console.error("Lá»—i khi xÃ³a bÃ i viáº¿t:", err);
      alert("Lá»—i há»‡ thá»‘ng khi xÃ³a bÃ i viáº¿t.");
    }
  }

  function addPackage(p: { name: string; destination: string; duration?: string; price?: string; status?: string }) {
    setPackages((current) => [
      {
        id: Date.now(),
        name: p.name,
        destination: p.destination,
        duration: p.duration ?? "3 ngÃ y 2 Ä‘Ãªm",
        price: p.price ?? "Liên hệ",
        status: p.status ?? "Äang má»Ÿ",
      },
      ...current,
    ]);
  }

  function updatePackage(id: number, updated: Partial<AdminPackage>) {
    setPackages((current) => current.map((it) => (it.id === id ? { ...it, ...updated } : it)));
  }

  function removePackage(id: number) {
    setPackages((current) => current.filter((i) => i.id !== id));
  }

  // Post Categories CRUD
  function addPostCategory(name: string, slug?: string) {
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setPostCategories((current) => [...current, { id: Date.now(), name, slug: finalSlug }]);
  }

  function updatePostCategory(id: number, name: string, slug: string) {
    setPostCategories((current) =>
      current.map((cat) => (cat.id === id ? { ...cat, name, slug } : cat))
    );
  }

  function removePostCategory(id: number) {
    setPostCategories((current) => current.filter((c) => c.id !== id));
  }

  // Package Categories CRUD
  function addPackageCategory(cat: Omit<PackageCategory, "id">) {
    setPackageCategories((current) => [...current, { id: Date.now(), ...cat }]);
  }

  function updatePackageCategory(id: number, updated: Partial<PackageCategory>) {
    setPackageCategories((current) => current.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  }

  function removePackageCategory(id: number) {
    setPackageCategories((current) => current.filter((c) => c.id !== id));
  }

  // Promo Packages CRUD
  function addPromoPackage(promo: Omit<PromoPackage, "id">) {
    setPromoPackages((current) => [...current, { id: Date.now(), ...promo }]);
  }

  function updatePromoPackage(id: number, updated: Partial<PromoPackage>) {
    setPromoPackages((current) => current.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  }

  function removePromoPackage(id: number) {
    setPromoPackages((current) => current.filter((p) => p.id !== id));
  }

  // Service Packages CRUD
  function addServicePackage(service: Omit<ServicePackage, "id">) {
    setServicePackages((current) => [...current, { id: Date.now(), ...service }]);
  }

  function updateServicePackage(id: number, updated: Partial<ServicePackage>) {
    setServicePackages((current) => current.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  }

  function removeServicePackage(id: number) {
    setServicePackages((current) => current.filter((s) => s.id !== id));
  }

  // Banners CRUD
  function addBanner(banner: Omit<AdminBanner, "id">) {
    setBanners((current) => [...current, { id: Date.now(), ...banner }]);
  }

  function updateBanner(id: number, updated: Partial<AdminBanner>) {
    setBanners((current) => current.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  }

  function removeBanner(id: number) {
    setBanners((current) => current.filter((b) => b.id !== id));
  }

  // Header Menu CRUD
  function addHeaderMenuItem(item: Omit<HeaderMenuItem, "id">) {
    setHeaderMenu((current) => [...current, { id: Date.now(), ...item }]);
  }

  function updateHeaderMenuItem(id: number, updated: Partial<HeaderMenuItem>) {
    setHeaderMenu((current) => current.map((item) => (item.id === id ? { ...item, ...updated } : item)));
  }

  function removeHeaderMenuItem(id: number) {
    setHeaderMenu((current) => current.filter((item) => item.id !== id));
  }

  // Footer Info update
  function updateFooterInfo(info: Partial<FooterInfo>) {
    setFooterInfo((current) => ({ ...current, ...info }));
  }

  // Booking CRUD
  async function addBooking(b: Omit<AdminBooking, "id" | "bookingDate" | "status">) {
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(b),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.booking) {
          setBookings((current) => [data.booking, ...current]);
        } else {
          alert(data.error || "Lá»—i khi táº¡o booking.");
        }
      }
    } catch (err) {
      console.error("Lá»—i khi thÃªm booking:", err);
      alert("Lá»—i há»‡ thá»‘ng khi thÃªm booking.");
    }
  }

  async function updateBooking(id: number, updated: Partial<AdminBooking>) {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.booking) {
          setBookings((current) => current.map((it) => (it.id === id ? { ...it, ...data.booking } : it)));
        } else {
          alert(data.error || "Lá»—i khi cáº­p nháº­t booking.");
        }
      }
    } catch (err) {
      console.error("Lá»—i khi cáº­p nháº­t booking:", err);
      alert("Lá»—i há»‡ thá»‘ng khi cáº­p nháº­t booking.");
    }
  }

  async function removeBooking(id: number) {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBookings((current) => current.filter((it) => it.id !== id));
        } else {
          alert(data.error || "Lá»—i khi xÃ³a booking.");
        }
      }
    } catch (err) {
      console.error("Lá»—i khi xÃ³a booking:", err);
      alert("Lá»—i há»‡ thá»‘ng khi xÃ³a booking.");
    }
  }

  // Language CRUD
  function addLanguage(lang: Omit<LanguageSetting, "id">) {
    setLanguages((current) => [...current, { id: Date.now(), ...lang }]);
  }

  function updateLanguage(id: number, updated: Partial<LanguageSetting>) {
    setLanguages((current) => current.map((it) => (it.id === id ? { ...it, ...updated } : it)));
  }

  function removeLanguage(id: number) {
    setLanguages((current) => current.filter((it) => it.id !== id));
  }

  // Translation CRUD
  function addTranslation(trans: Omit<StaticTranslation, "id">) {
    setTranslations((current) => [...current, { id: Date.now(), ...trans }]);
  }

  function updateTranslation(id: number, updated: Partial<StaticTranslation>) {
    setTranslations((current) => current.map((it) => (it.id === id ? { ...it, ...updated } : it)));
  }

  function removeTranslation(id: number) {
    setTranslations((current) => current.filter((it) => it.id !== id));
  }

  // Review CRUD
  async function addReview(rev: Omit<AdminReview, "id" | "date">) {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rev),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.review) {
          setReviews((current) => [data.review, ...current]);
        }
      }
    } catch (err) {
      console.error("Lá»—i khi thÃªm review:", err);
    }
  }

  async function updateReview(id: number, updated: Partial<AdminReview>) {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.review) {
          setReviews((current) => current.map((it) => (it.id === id ? { ...it, ...data.review } : it)));
        }
      }
    } catch (err) {
      console.error("Lá»—i khi cáº­p nháº­t review:", err);
    }
  }

  async function removeReview(id: number) {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setReviews((current) => current.filter((it) => it.id !== id));
        }
      }
    } catch (err) {
      console.error("Lá»—i khi xÃ³a review:", err);
    }
  }


  // Customer CRUD
  async function addCustomer(c: Omit<AdminCustomer, "id" | "dateAdded" | "totalBookings" | "totalSpent">) {
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.customer) {
          setCustomers((current) => [data.customer, ...current]);
        }
      }
    } catch (err) {
      console.error("Lá»—i khi thÃªm customer:", err);
    }
  }

  async function updateCustomer(id: number, updated: Partial<AdminCustomer>) {
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.customer) {
          setCustomers((current) => current.map((it) => (it.id === id ? { ...it, ...data.customer } : it)));
        }
      }
    } catch (err) {
      console.error("Lá»—i khi cáº­p nháº­t customer:", err);
    }
  }

  async function removeCustomer(id: number) {
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCustomers((current) => current.filter((it) => it.id !== id));
        }
      }
    } catch (err) {
      console.error("Lá»—i khi xÃ³a customer:", err);
    }
  }

  // Media CRUD
  function addMediaFile(file: Omit<MediaFile, "id" | "uploadedAt">) {
    setMediaFiles((current) => [
      {
        id: Date.now(),
        uploadedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        ...file,
      },
      ...current,
    ]);
  }

  function removeMediaFile(id: number) {
    setMediaFiles((current) => current.filter((it) => it.id !== id));
  }

  // SEO Update
  function updateSeoConfig(id: number, updated: Partial<SeoConfig>) {
    setSeoConfigs((current) => current.map((it) => (it.id === id ? { ...it, ...updated } : it)));
  }

  async function login(username: string, password: string) {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.admin) {
        setIsAuthenticated(true);
        setCurrentAdmin(data.admin);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(authStorageKey, "1");
        }
        return true;
      } else {
        // NÃ©m lá»—i nháº­n Ä‘Æ°á»£c tá»« API Ä‘á»ƒ Client báº¯t Ä‘Æ°á»£c thÃ´ng bÃ¡o lá»—i cá»¥ thá»ƒ
        throw new Error(data.error || "TÃªn Ä‘Äƒng nháº­p hoáº·c máº­t kháº©u khÃ´ng há»£p lá»‡.");
      }
    } catch (error) {
      setIsAuthenticated(false);
      setCurrentAdmin(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(authStorageKey);
      }
      throw error;
    }
  }

  async function logout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch (error) {
      console.error("Lá»—i gá»i API Ä‘Äƒng xuáº¥t:", error);
    } finally {
      setIsAuthenticated(false);
      setCurrentAdmin(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(authStorageKey);
      }
    }
  }

  function resetDatabase() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(postStorageKey);
      window.localStorage.removeItem(packageStorageKey);
      window.localStorage.removeItem(postCatStorageKey);
      window.localStorage.removeItem(pkgCatStorageKey);
      window.localStorage.removeItem(promoStorageKey);
      window.localStorage.removeItem(serviceStorageKey);
      window.localStorage.removeItem(bannerStorageKey);
      window.localStorage.removeItem(headerStorageKey);
      window.localStorage.removeItem(footerStorageKey);

      window.localStorage.removeItem(bookingStorageKey);
      window.localStorage.removeItem(languageStorageKey);
      window.localStorage.removeItem(translationStorageKey);
      window.localStorage.removeItem(reviewStorageKey);

      window.localStorage.removeItem(customerStorageKey);
      window.localStorage.removeItem(mediaStorageKey);
      window.localStorage.removeItem(seoStorageKey);
    }
    setPosts(initialPosts);
    setPackages(initialPackages);
    setPostCategories(initialPostCategories);
    setPackageCategories(initialPackageCategories);
    setPromoPackages(initialPromoPackages);
    setServicePackages(initialServicePackages);
    setBanners(initialBanners);
    setHeaderMenu(initialHeaderMenu);
    setFooterInfo(initialFooterInfo);

    setBookings(initialBookings);
    setLanguages(initialLanguages);
    setTranslations(initialTranslations);
    setReviews(initialReviews);

    setCustomers(initialCustomers);
    setMediaFiles(initialMediaFiles);
    setSeoConfigs(initialSeoConfigs);
  }

  const value: AdminContextValue = {
    posts,
    packages,
    postCategories,
    packageCategories,
    promoPackages,
    servicePackages,
    banners,
    headerMenu,
    footerInfo,
    bookings,
    languages,
    translations,
    reviews,
    customers,
    mediaFiles,
    seoConfigs,

    addPost,
    updatePost,
    removePost,

    addPackage,
    updatePackage,
    removePackage,

    addPostCategory,
    updatePostCategory,
    removePostCategory,

    addPackageCategory,
    updatePackageCategory,
    removePackageCategory,

    addPromoPackage,
    updatePromoPackage,
    removePromoPackage,

    addServicePackage,
    updateServicePackage,
    removeServicePackage,

    addBanner,
    updateBanner,
    removeBanner,

    addHeaderMenuItem,
    updateHeaderMenuItem,
    removeHeaderMenuItem,

    updateFooterInfo,

    addBooking,
    updateBooking,
    removeBooking,

    addLanguage,
    updateLanguage,
    removeLanguage,

    addTranslation,
    updateTranslation,
    removeTranslation,

    addReview,
    updateReview,
    removeReview,



    addCustomer,
    updateCustomer,
    removeCustomer,

    addMediaFile,
    removeMediaFile,

    updateSeoConfig,

    isAuthenticated,
    authReady,
    currentAdmin,
    login,
    logout,
    resetDatabase,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}



