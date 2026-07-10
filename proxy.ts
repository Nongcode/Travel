import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stripLocaleFromPath } from "@/lib/i18n/config";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localized = stripLocaleFromPath(pathname);
  const effectivePathname = localized.pathname;

  const token = request.cookies.get("admin_token")?.value;

  if (effectivePathname.startsWith("/admin")) {
    if (effectivePathname === "/admin/login") {
      if (token) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.next();
    }

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", effectivePathname);
  requestHeaders.set("x-locale", localized.locale);

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
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
