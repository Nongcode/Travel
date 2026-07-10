import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json(
            { message: "Đăng xuất tài khoản thành công." },
            { status: 200 }
        );

        // Hủy cookie admin_token bằng cách ghi đè giá trị rỗng và đặt maxAge = 0
        response.cookies.set({
            name: "admin_token",
            value: "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0, // Trình duyệt xóa cookie này ngay lập tức
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Lỗi đăng xuất:", error);
        return NextResponse.json(
            { error: "?? x?y ra l?i h? th?ng khi x? l? ??ng xu?t." },
            { status: 500 }
        );
    }
}