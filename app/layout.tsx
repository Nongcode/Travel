import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { SiteFooter } from "./components/SiteFooter";
import "./globals.css";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "VietVista | Blog du lịch Việt Nam",
  description:
    "Blog du lịch hiện đại về điểm đến, lịch trình và tư vấn gói du lịch Việt Nam không thanh toán online.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Đọc pathname được đính kèm từ middleware
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // 2. Nếu là các trang admin, api, hoặc tài nguyên tĩnh -> Bỏ qua không chặn
  const isAdminOrApi = pathname.startsWith("/admin") || pathname.startsWith("/api");

  let isSuspended = false;
  let isPageDisabled = false;
  let disabledPageName = "";

  if (!isAdminOrApi) {
    try {
      // 3. Truy vấn các thiết lập cấu hình website từ cơ sở dữ liệu
      const settings = await prisma.siteSetting.findMany();
      const settingsMap = settings.reduce((acc: any, curr) => {
        acc[curr.settingKey] = curr.settingValue;
        return acc;
      }, {});

      // Kiểm tra trạng thái khóa toàn website (ví dụ khách hàng chưa thanh toán)
      if (settingsMap["site_status"] === "suspended") {
        isSuspended = true;
      }

      // Kiểm tra trạng thái ẩn/hiện của từng trang con cụ thể
      if (!isSuspended) {
        if (pathname === "/" && settingsMap["page_home_status"] === "inactive") {
          isPageDisabled = true;
          disabledPageName = "Trang chủ";
        } else if (pathname.startsWith("/goi-du-lich") && settingsMap["page_tours_status"] === "inactive") {
          isPageDisabled = true;
          disabledPageName = "Gói du lịch";
        } else if (pathname.startsWith("/huong-dan-visa") && settingsMap["page_visa_status"] === "inactive") {
          isPageDisabled = true;
          disabledPageName = "Hướng dẫn Visa";
        } else if (pathname.startsWith("/tin-tuc") && settingsMap["page_news_status"] === "inactive") {
          isPageDisabled = true;
          disabledPageName = "Tin tức & Cẩm nang";
        } else if (pathname.startsWith("/lien-he") && settingsMap["page_contact_status"] === "inactive") {
          isPageDisabled = true;
          disabledPageName = "Liên hệ";
        } else if (pathname.startsWith("/uu-dai") && settingsMap["page_offers_status"] === "inactive") {
          isPageDisabled = true;
          disabledPageName = "Ưu đãi";
        }
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra trạng thái hoạt động website:", err);
    }
  }

  // Giao diện Đình chỉ hoạt động khi Website bị Khóa (Khách chưa thanh toán)
  if (isSuspended) {
    return (
      <html lang="vi" className={`${roboto.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col justify-center items-center bg-[#fcf9f2] p-6 text-center">
          <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-inner">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Dịch Vụ Tạm Ngưng Hoạt Động</h2>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Hệ thống website này hiện đang tạm thời bị ngưng hoạt động do chưa hoàn tất thủ tục thanh toán hoặc bảo trì kỹ thuật mở rộng.
              </p>
            </div>
            <div className="border-t border-slate-100 pt-5">
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Vui lòng liên hệ với nhà quản trị hệ thống hoặc đơn vị phát triển để được hỗ trợ mở khóa.
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  // Giao diện khi một Trang Con cụ thể bị ẩn để bảo trì/custom
  if (isPageDisabled) {
    return (
      <html lang="vi" className={`${roboto.variable} h-full antialiased`}>
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
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Kênh dịch vụ tạm đóng</h2>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Mục <strong className="text-emerald-700 font-bold">{disabledPageName}</strong> hiện đang tạm đóng để nâng cấp cấu hình hoặc tùy chỉnh nội dung bài viết.
              </p>
            </div>
            <div className="pt-2">
              <a 
                href="/"
                className="inline-flex px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all"
              >
                Quay lại Trang chủ
              </a>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
