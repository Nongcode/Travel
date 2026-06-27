import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Lấy token đăng nhập từ cookie của trình duyệt gửi lên
  const token = request.cookies.get("admin_token")?.value;

  // 2. Bảo vệ các trang quản trị bắt đầu bằng /admin
  if (pathname.startsWith("/admin")) {
    // Nếu người dùng truy cập trang đăng nhập /admin/login
    if (pathname === "/admin/login") {
      // Nếu đã có token đăng nhập -> chuyển hướng thẳng về trang điều khiển (dashboard)
      if (token) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.next();
    }

    // Nếu người dùng truy cập các trang quản trị khác mà chưa có token
    if (!token) {
      // Chuyển hướng về trang đăng nhập /admin/login
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Đính kèm x-pathname vào request headers để Server Components nhận diện được đường dẫn hiện tại
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Chạy middleware trên tất cả các trang ngoại trừ tài nguyên tĩnh và API
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};