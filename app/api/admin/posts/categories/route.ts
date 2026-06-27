import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { slugify } from "@/lib/slug";

// Hàm kiểm tra và xác thực phiên đăng nhập của Admin hoặc Editor
function verifyAdminSession(request: NextRequest) {
  const tokenCookie = request.cookies.get("admin_token");
  if (!tokenCookie) return null;

  const decoded = verifyToken(tokenCookie.value);
  if (!decoded) return null;

  return decoded;
}

// GET: Lấy danh sách chuyên mục kèm số lượng bài viết liên kết
export async function GET(request: NextRequest) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { id: "asc" },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    // Định dạng lại kết quả để khớp với frontend
    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug || "",
      postCount: cat._count.posts,
    }));

    return NextResponse.json({ success: true, categories: formattedCategories });
  } catch (error) {
    console.error("Lỗi khi tải danh sách chuyên mục:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải danh sách chuyên mục." }, { status: 500 });
  }
}

// POST: Tạo mới chuyên mục bài viết
export async function POST(request: NextRequest) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tên chuyên mục không được trống." }, { status: 400 });
    }

    const trimmedName = name.trim();
    const finalSlug = slug && slug.trim() ? slugify(slug.trim()) : slugify(trimmedName);

    // Kiểm tra trùng lặp
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: trimmedName, mode: "insensitive" } },
          { slug: finalSlug },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Tên chuyên mục hoặc đường dẫn tĩnh (slug) đã tồn tại." }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name: trimmedName,
        slug: finalSlug,
      },
    });

    return NextResponse.json({
      success: true,
      category: {
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        postCount: 0,
      },
    });
  } catch (error) {
    console.error("Lỗi khi tạo chuyên mục bài viết:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tạo chuyên mục." }, { status: 500 });
  }
}

// DELETE: Xóa chuyên mục bài viết (chỉ được xóa khi chuyên mục rỗng)
export async function DELETE(request: NextRequest) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID chuyên mục cần xóa." }, { status: 400 });
    }

    const catId = Number(id);

    // Kiểm tra xem chuyên mục có bài viết nào không
    const postCount = await prisma.post.count({
      where: { categoryId: catId },
    });

    if (postCount > 0) {
      return NextResponse.json({ error: "Không thể xóa chuyên mục này vì đang có bài viết thuộc danh mục này." }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id: catId },
    });

    return NextResponse.json({ success: true, message: "Xóa chuyên mục thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa chuyên mục bài viết:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa chuyên mục." }, { status: 500 });
  }
}

// PUT: Cập nhật thông tin chuyên mục bài viết (Đổi tên & cập nhật slug)
export async function PUT(request: NextRequest) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, slug } = body;

    if (!id || !name || !name.trim()) {
      return NextResponse.json({ error: "Dữ liệu cập nhật không hợp lệ." }, { status: 400 });
    }

    const catId = Number(id);
    const trimmedName = name.trim();
    const finalSlug = slug && slug.trim() ? slugify(slug.trim()) : slugify(trimmedName);

    // Kiểm tra trùng lặp với chuyên mục khác
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: trimmedName, mode: "insensitive" } },
          { slug: finalSlug },
        ],
        id: { not: catId },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Tên chuyên mục hoặc đường dẫn tĩnh (slug) đã tồn tại." }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id: catId },
      data: {
        name: trimmedName,
        slug: finalSlug,
      },
    });

    return NextResponse.json({
      success: true,
      category: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
      },
    });
  } catch (error) {
    console.error("Lỗi khi sửa chuyên mục bài viết:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi sửa chuyên mục." }, { status: 500 });
  }
}
