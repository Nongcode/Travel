import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, verifyToken } from "@/lib/auth";

// Hàm kiểm tra và xác thực tài khoản Super Admin (email === "admin")
function checkSuperAdmin(request: NextRequest) {
  const tokenCookie = request.cookies.get("admin_token");
  if (!tokenCookie) return null;
  
  const decoded = verifyToken(tokenCookie.value);
  if (!decoded || decoded.email !== "admin") return null;
  
  return decoded;
}

// GET: Lấy danh sách tất cả các tài khoản quản trị
export async function GET(request: NextRequest) {
  try {
    const isAuthorized = checkSuperAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Quyền truy cập bị từ chối. Chỉ tài khoản admin tối cao mới được phép truy cập." },
        { status: 403 }
      );
    }

    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, admins });
  } catch (error) {
    console.error("Lỗi lấy danh sách tài khoản:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải danh sách tài khoản." }, { status: 500 });
  }
}

// PUT: Cập nhật thông tin tài khoản admin (Họ tên, Email, Vai trò, Trạng thái và Mật khẩu mới)
export async function PUT(request: NextRequest) {
  try {
    const isAuthorized = checkSuperAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Quyền truy cập bị từ chối. Chỉ tài khoản admin tối cao mới được phép thực hiện." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, email, fullName, password, role, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID tài khoản cần chỉnh sửa." }, { status: 400 });
    }

    // 1. Kiểm tra tài khoản đích có tồn tại không
    const targetAdmin = await prisma.admin.findUnique({
      where: { id: Number(id) },
    });

    if (!targetAdmin) {
      return NextResponse.json({ error: "Tài khoản không tồn tại trên hệ thống." }, { status: 404 });
    }

    // 2. Thiết lập ràng buộc bảo mật cho tài khoản gốc "admin"
    let finalEmail = email ? email.trim() : targetAdmin.email;
    let finalRole = role || targetAdmin.role;
    let finalStatus = status || targetAdmin.status;

    if (targetAdmin.email === "admin") {
      finalEmail = "admin"; // Không được đổi tên đăng nhập
      finalRole = "admin";  // Bắt buộc giữ quyền admin tối cao
      finalStatus = "active"; // Không cho phép khóa tài khoản chính
    }

    // 3. Chuẩn bị dữ liệu cập nhật
    const updateData: any = {
      email: finalEmail,
      fullName: fullName || targetAdmin.fullName,
      role: finalRole,
      status: finalStatus,
    };

    // 4. Nếu đổi mật khẩu mới
    if (password && password.trim().length > 0) {
      if (password.trim().length < 6) {
        return NextResponse.json({ error: "Mật khẩu mới phải từ 6 ký tự trở lên." }, { status: 400 });
      }
      updateData.passwordHash = hashPassword(password);
    }

    // 5. Cập nhật vào CSDL
    const updated = await prisma.admin.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật tài khoản quản trị thành công.",
      admin: {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        role: updated.role,
        status: updated.status,
      },
    });
  } catch (error: any) {
    console.error("Lỗi cập nhật tài khoản:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật thông tin." }, { status: 500 });
  }
}

// DELETE: Xóa tài khoản admin
export async function DELETE(request: NextRequest) {
  try {
    const isAuthorized = checkSuperAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Quyền truy cập bị từ chối. Chỉ tài khoản admin tối cao mới được phép thực hiện." },
        { status: 403 }
      );
    }

    // Lấy ID từ URL searchParams hoặc body
    const url = new URL(request.url);
    let id = url.searchParams.get("id");
    
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID tài khoản cần xóa." }, { status: 400 });
    }

    // 1. Kiểm tra tài khoản đích
    const targetAdmin = await prisma.admin.findUnique({
      where: { id: Number(id) },
    });

    if (!targetAdmin) {
      return NextResponse.json({ error: "Tài khoản cần xóa không tồn tại." }, { status: 404 });
    }

    // 2. Ngăn chặn tự xóa tài khoản gốc "admin"
    if (targetAdmin.email === "admin") {
      return NextResponse.json(
        { error: "Không được phép xóa tài khoản quản trị tối cao của hệ thống." },
        { status: 400 }
      );
    }

    // 3. Thực hiện xóa trong CSDL
    await prisma.admin.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Xóa tài khoản quản trị thành công.",
    });
  } catch (error) {
    console.error("Lỗi xóa tài khoản admin:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xử lý xóa tài khoản." }, { status: 500 });
  }
}
