import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        // 1. Lấy token từ cookie
        const tokenCookie = request.cookies.get("admin_token");

        if (!tokenCookie) {
            return NextResponse.json(
                { isAuthenticated: false, error: "Phiên làm việc chưa được thiết lập." },
                { status: 401 }
            );
        }

        // 2. Xác thực và giải mã token
        const decoded = verifyToken(tokenCookie.value);

        if (!decoded) {
            return NextResponse.json(
                { isAuthenticated: false, error: "Token kh?ng h?p l? ho?c ?? h?t h?n." },
                { status: 401 }
            );
        }

        // 3. Trả về thông tin quản trị viên hiện tại
        return NextResponse.json(
            {
                isAuthenticated: true,
                admin: {
                    id: decoded.id,
                    email: decoded.email,
                    fullName: decoded.fullName,
                    role: decoded.role,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Lỗi kiểm tra phiên làm việc:", error);
        return NextResponse.json(
            { isAuthenticated: false, error: "?? x?y ra l?i h? th?ng khi ki?m tra phi?n." },
            { status: 500 }
        );
    }
}