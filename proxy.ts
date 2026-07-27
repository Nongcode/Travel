import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { detectLocaleFromAcceptLanguage, localePrefix, stripLocaleFromPath } from "@/lib/i18n/config";
import { verifyToken } from "@/lib/auth";

function isCrawler(userAgent: string | null) {
  if (!userAgent) return false;
  return /bot|crawler|spider|crawling|google|bing|yandex|baidu|duckduck|slurp|facebookexternalhit|twitterbot|linkedinbot|telegrambot|zalo/i.test(userAgent);
}

function isPublicPageRequest(pathname: string) {
  if (pathname.startsWith("/admin") || pathname.startsWith("/api") || pathname.startsWith("/_next")) return false;
  if (pathname === "/favicon.ico" || pathname === "/robots.txt" || pathname === "/sitemap.xml") return false;
  return !/\.[a-z0-9]+$/i.test(pathname);
}

function isDocumentNavigationRequest(request: NextRequest) {
  const accept = request.headers.get("accept") || "";
  const fetchMode = request.headers.get("sec-fetch-mode");

  return request.method === "GET" && (fetchMode === "navigate" || accept.includes("text/html"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localized = stripLocaleFromPath(pathname);
  const effectivePathname = localized.pathname;

  const token = request.cookies.get("admin_token")?.value;

  const isInternalLocaleRewrite = request.headers.has("x-locale");
  const hasExplicitLocale = localized.pathname !== pathname;
  const preferredLocale = detectLocaleFromAcceptLanguage(request.headers.get("accept-language"));
  const preferredPrefix = localePrefix(preferredLocale);
  const shouldAutoRedirectLocale =
    !isInternalLocaleRewrite &&
    !hasExplicitLocale &&
    preferredPrefix.length > 0 &&
    isPublicPageRequest(pathname) &&
    isDocumentNavigationRequest(request) &&
    !isCrawler(request.headers.get("user-agent"));

  if (shouldAutoRedirectLocale) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname === "/" ? preferredPrefix : `${preferredPrefix}${pathname}`;
    return NextResponse.redirect(redirectUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", effectivePathname);
  requestHeaders.set("x-locale", localized.locale);

  const nextResponse = () => {
    if (effectivePathname !== pathname) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = effectivePathname;
      return NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders },
      });
    }

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  };

  const session = token ? verifyToken(token) : null;

  if (effectivePathname.startsWith("/admin")) {
    if (effectivePathname === "/admin/login") {
      if (session) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      const response = nextResponse();
      if (token) response.cookies.delete("admin_token");
      return response;
    }

    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      if (token) response.cookies.delete("admin_token");
      return response;
    }
  }

  return nextResponse()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
