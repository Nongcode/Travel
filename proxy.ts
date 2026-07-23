import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stripLocaleFromPath } from "@/lib/i18n/config";
import { verifyToken } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localized = stripLocaleFromPath(pathname);
  const effectivePathname = localized.pathname;

  const token = request.cookies.get("admin_token")?.value;

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
