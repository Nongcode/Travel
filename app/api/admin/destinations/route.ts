import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// Hàm kiểm tra và xác thực phiên đăng nhập của Admin
function verifyAdminSession(request: NextRequest) {
  const tokenCookie = request.cookies.get("admin_token");
  if (!tokenCookie) return null;

  const decoded = verifyToken(tokenCookie.value);
  if (!decoded) return null;

  return decoded;
}

export async function GET(request: NextRequest) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const destinations = await prisma.destination.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, destinations });
  } catch (error) {
    console.error("Lỗi khi tải danh sách điểm đến:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải danh sách điểm đến." }, { status: 500 });
  }
}
