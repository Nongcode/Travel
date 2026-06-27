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

// Định dạng ngày thành DD/MM/YYYY thủ công để luôn đồng bộ
function formatDate(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Tự động phân tích summary thành các content blocks (đoạn văn & ảnh đan xen)
function generateContentBlocks(summaryText: string, contentImageUrl?: string, title?: string): any[] {
  const paragraphs = summaryText
    ? summaryText.split(/\r?\n/).map(p => p.trim()).filter(Boolean)
    : [];
  
  const blocks: any[] = paragraphs.map(text => ({
    type: "paragraph",
    text
  }));

  if (contentImageUrl && contentImageUrl.trim()) {
    const imgBlock = {
      type: "image",
      url: contentImageUrl.trim(),
      caption: title || "Hình ảnh mô tả nội dung bài viết"
    };
    
    if (blocks.length > 1) {
      // Chèn ảnh vào giữa (ví dụ sau đoạn văn đầu tiên)
      blocks.splice(1, 0, imgBlock);
    } else {
      // Nếu ít đoạn văn quá thì đẩy xuống cuối
      blocks.push(imgBlock);
    }
  }

  return blocks;
}

// GET: Lấy tất cả bài viết kèm tên chuyên mục (Category Name)
export async function GET(request: NextRequest) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
      },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      category: post.category?.name || "Chưa phân loại",
      date: formatDate(post.createdAt),
      status: post.status,
      imageUrl: post.imageUrl || "",
      contentImageUrl: post.contentImageUrl || "",
      excerpt: post.excerpt || "",
      readTime: post.readTime || "",
      seoDescription: post.seoDescription || "",
      summary: post.summary || "",
    }));

    return NextResponse.json({ success: true, posts: formattedPosts });
  } catch (error) {
    console.error("Lỗi khi tải danh sách bài viết:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải danh sách bài viết." }, { status: 500 });
  }
}

// POST: Tạo bài viết mới dưới dạng bản nháp
export async function POST(request: NextRequest) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const body = await request.json();
    const { title, category, status, imageUrl, contentImageUrl, excerpt, readTime, seoDescription, summary } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Tiêu đề bài viết không được trống." }, { status: 400 });
    }

    const categoryName = category ? category.trim() : "Chưa phân loại";
    const postStatus = status || "Bản nháp";

    // 1. Tạo slug độc nhất (unique slug)
    const baseSlug = slugify(title);
    let finalSlug = baseSlug || "bai-viet";
    let counter = 1;

    while (true) {
      const existingSlug = await prisma.post.findUnique({
        where: { slug: finalSlug },
      });
      if (!existingSlug) break;

      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 2. Tìm hoặc tạo mới chuyên mục
    let dbCategory = await prisma.category.findUnique({
      where: { name: categoryName },
    });

    if (!dbCategory) {
      dbCategory = await prisma.category.create({
        data: {
          name: categoryName,
          slug: slugify(categoryName),
        },
      });
    }

    // Sinh content blocks
    const contentBlocks = generateContentBlocks(summary, contentImageUrl, title);

    // 3. Tạo bài viết
    const newPost = await prisma.post.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        categoryId: dbCategory.id,
        status: postStatus,
        imageUrl: imageUrl ? imageUrl.trim() : null,
        contentImageUrl: contentImageUrl ? contentImageUrl.trim() : null,
        excerpt: excerpt ? excerpt.trim() : null,
        readTime: readTime ? readTime.trim() : null,
        seoDescription: seoDescription ? seoDescription.trim() : null,
        summary: summary ? summary.trim() : null,
        contentBlocks: contentBlocks,
        publishedAt: postStatus === "Đã xuất bản" ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      post: {
        id: newPost.id,
        title: newPost.title,
        category: dbCategory.name,
        date: formatDate(newPost.createdAt),
        status: newPost.status,
        imageUrl: newPost.imageUrl || "",
        contentImageUrl: newPost.contentImageUrl || "",
        excerpt: newPost.excerpt || "",
        readTime: newPost.readTime || "",
        seoDescription: newPost.seoDescription || "",
        summary: newPost.summary || "",
      },
    });
  } catch (error) {
    console.error("Lỗi khi tạo bài viết mới:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tạo bài viết." }, { status: 500 });
  }
}

// PUT: Cập nhật thông tin bài viết (Tiêu đề, Chuyên mục, Trạng thái)
export async function PUT(request: NextRequest) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, category, status, imageUrl, contentImageUrl, excerpt, readTime, seoDescription, summary } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID bài viết cần chỉnh sửa." }, { status: 400 });
    }

    const postId = Number(id);

    // Kiểm tra bài viết tồn tại
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Bài viết không tồn tại trên hệ thống." }, { status: 404 });
    }

    const updateData: any = {};

    // Cập nhật tiêu đề & slug
    if (title && title.trim()) {
      const trimmedTitle = title.trim();
      updateData.title = trimmedTitle;

      // Sinh slug mới nếu tiêu đề thay đổi
      if (trimmedTitle !== existingPost.title) {
        const baseSlug = slugify(trimmedTitle);
        let finalSlug = baseSlug || "bai-viet";
        let counter = 1;

        while (true) {
          const existingSlug = await prisma.post.findFirst({
            where: {
              slug: finalSlug,
              id: { not: postId }, // Tránh kiểm tra chính bài viết đang cập nhật
            },
          });
          if (!existingSlug) break;

          finalSlug = `${baseSlug}-${counter}`;
          counter++;
        }
        updateData.slug = finalSlug;
      }
    }

    // Cập nhật chuyên mục
    if (category && category.trim()) {
      const categoryName = category.trim();
      let dbCategory = await prisma.category.findUnique({
        where: { name: categoryName },
      });

      if (!dbCategory) {
        dbCategory = await prisma.category.create({
          data: {
            name: categoryName,
            slug: slugify(categoryName),
          },
        });
      }
      updateData.categoryId = dbCategory.id;
    }

    // Cập nhật trạng thái
    if (status) {
      updateData.status = status;
      if (status === "Đã xuất bản" && existingPost.status !== "Đã xuất bản") {
        updateData.publishedAt = new Date();
      } else if (status === "Bản nháp" && existingPost.status === "Đã xuất bản") {
        updateData.publishedAt = null;
      }
    }

    // Cập nhật các trường mở rộng
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl ? imageUrl.trim() : null;
    }
    if (contentImageUrl !== undefined) {
      updateData.contentImageUrl = contentImageUrl ? contentImageUrl.trim() : null;
    }
    if (excerpt !== undefined) {
      updateData.excerpt = excerpt ? excerpt.trim() : null;
    }
    if (readTime !== undefined) {
      updateData.readTime = readTime ? readTime.trim() : null;
    }
    if (seoDescription !== undefined) {
      updateData.seoDescription = seoDescription ? seoDescription.trim() : null;
    }
    if (summary !== undefined) {
      updateData.summary = summary ? summary.trim() : null;
    }

    // Tái tạo contentBlocks
    const finalSummary = summary !== undefined ? summary : existingPost.summary;
    const finalContentImageUrl = contentImageUrl !== undefined ? contentImageUrl : existingPost.contentImageUrl;
    const finalTitle = title !== undefined ? title : existingPost.title;
    updateData.contentBlocks = generateContentBlocks(finalSummary || "", finalContentImageUrl || "", finalTitle || "");

    // Tiến hành cập nhật
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      post: {
        id: updatedPost.id,
        title: updatedPost.title,
        category: updatedPost.category?.name || "Chưa phân loại",
        date: formatDate(updatedPost.createdAt),
        status: updatedPost.status,
        imageUrl: updatedPost.imageUrl || "",
        contentImageUrl: updatedPost.contentImageUrl || "",
        excerpt: updatedPost.excerpt || "",
        readTime: updatedPost.readTime || "",
        seoDescription: updatedPost.seoDescription || "",
        summary: updatedPost.summary || "",
      },
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật bài viết:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật bài viết." }, { status: 500 });
  }
}

// DELETE: Xóa bài viết khỏi cơ sở dữ liệu
export async function DELETE(request: NextRequest) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const url = new URL(request.url);
    let id = url.searchParams.get("id");

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID bài viết cần xóa." }, { status: 400 });
    }

    const postId = Number(id);

    // Kiểm tra tồn tại
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Bài viết không tồn tại trên hệ thống." }, { status: 404 });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true, message: "Xóa bài viết thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa bài viết:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa bài viết." }, { status: 500 });
  }
}
