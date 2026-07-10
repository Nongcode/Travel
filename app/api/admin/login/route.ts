import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // Chấp nhận cả "email" hoặc "username" từ form đăng nhập của frontend gửi lên
        const identifier = body.email || body.username;
        const { password } = body;

        // 1. Kiểm tra đầu vào hợp lệ
        if (!identifier || !password) {
            return NextResponse.json(
                { error: "Vui lòng cung cấp đầy đủ tên đăng nhập/email và mật khẩu." },
                { status: 400 }
            );
        }

        // 2. Tìm admin bằng email trong cơ sở dữ liệu
        const admin = await prisma.admin.findUnique({
            where: { email: identifier.trim() },
        });

        if (!admin) {
            return NextResponse.json(
                { error: "Tên đăng nhập hoặc mật khẩu không chính xác." },
                { status: 401 }
            );
        }

        // 3. Kiểm tra trạng thái hoạt động của tài khoản quản trị
        if (admin.status !== "active") {
            return NextResponse.json(
                { error: "Tài khoản quản trị này hiện đang bị khóa hoặc ngưng hoạt động." },
                { status: 403 }
            );
        }

        // 4. So khớp mật khẩu đã băm
        const isPasswordCorrect = verifyPassword(password, admin.passwordHash);
        if (!isPasswordCorrect) {
            return NextResponse.json(
                { error: "Tên đăng nhập hoặc mật khẩu không chính xác." },
                { status: 401 }
            );
        }

        // 5. Tạo Payload chứa các thông tin cơ bản cần dùng ở client
        const payload = {
            id: admin.id,
            email: admin.email,
            fullName: admin.fullName,
            role: admin.role,
        };

        // Ký tạo token JWT
        const token = signToken(payload);

        // 6. Trả về response và ghi nhận HTTP-Only Cookie
        const response = NextResponse.json(
            {
                message: "Đăng nhập hệ thống thành công.",
                admin: payload,
            },
            { status: 200 }
        );

        // Lưu token vào Cookie bảo mật cao
        response.cookies.set({
            name: "admin_token",
            value: token,
            httpOnly: true, // Bảo vệ chống XSS
            secure: process.env.NODE_ENV === "production", // Chỉ dùng HTTPS ở môi trường production
            sameSite: "lax", // Phòng vệ CSRF
            maxAge: 7 * 24 * 60 * 60, // Hạn dùng cookie 7 ngày (tương đương giây)
            path: "/", // Áp dụng cookie cho tất cả các đường dẫn trong app
        });

        return response;
    } catch (error: any) {
        console.error("Lỗi đăng nhập admin:", error);
        return NextResponse.json(
            { error: "?? x?y ra l?i h? th?ng khi x? l? ??ng nh?p." },
            { status: 500 }
        );
    }
}