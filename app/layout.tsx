import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { SiteFooter } from "./components/SiteFooter";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
