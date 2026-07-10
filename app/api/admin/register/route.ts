import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, fullName, role } = body;

        // 1. Kiểm tra các trường dữ liệu bắt buộc
        if (!email || !password || !fullName) {
            return NextResponse.json(
                { error: "Vui lòng cung cấp đầy đủ thông tin: email, mật khẩu và họ tên." },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Mật khẩu phải chứa ít nhất 6 ký tự." },
                { status: 400 }
            );
        }

        // 2. Kiểm tra số lượng admin hiện có trong hệ thống
        const adminCount = await prisma.admin.count();

        if (adminCount > 0) {
            // Nếu đã có admin, yêu cầu người thực hiện phải là Admin tối cao (role = "admin")
            const tokenCookie = request.cookies.get("admin_token");
            if (!tokenCookie) {
                return NextResponse.json(
                    { error: "Yêu cầu đăng nhập quản trị viên để thực hiện chức năng này." },
                    { status: 401 }
                );
            }

            // Xác thực token JWT
            const decoded = verifyToken(tokenCookie.value);
            if (!decoded || decoded.role !== "admin") {
                return NextResponse.json(
                    { error: "Bạn không có quyền quản trị tối cao (role: admin) để tạo tài khoản mới." },
                    { status: 403 }
                );
            }
        } else {
            console.log("H? th?ng ch?a c? admin n?o. Cho ph?p ??ng k? t?i kho?n ??u ti?n.");
        }

        // 3. Kiểm tra xem email đăng ký đã tồn tại hay chưa
        const existingAdmin = await prisma.admin.findUnique({
            where: { email },
        });

        if (existingAdmin) {
            return NextResponse.json(
                { error: "Email n?y ?? ???c s? d?ng b?i m?t t?i kho?n qu?n tr? kh?c." },
                { status: 400 }
            );
        }

        // 4. Băm mật khẩu bằng hàm PBKDF2 của chúng ta
        const passwordHash = hashPassword(password);

        // Nếu là tài khoản đầu tiên -> bắt buộc là 'admin'. Các tài khoản sau tùy chọn (mặc định là 'editor')
        const finalRole = adminCount === 0 ? "admin" : (role || "editor");

        // 5. Lưu vào database
        const newAdmin = await prisma.admin.create({
            data: {
                email,
                passwordHash,
                fullName,
                role: finalRole,
                status: "active",
            },
        });

        return NextResponse.json(
            {
                message: "Tạo tài khoản quản trị mới thành công.",
                admin: {
                    id: newAdmin.id,
                    email: newAdmin.email,
                    fullName: newAdmin.fullName,
                    role: newAdmin.role,
                    status: newAdmin.status,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Lỗi đăng ký admin:", error);
        return NextResponse.json(
            { error: "?? x?y ra l?i h? th?ng khi x? l? y?u c?u." },
            { status: 500 }
        );
    }
}