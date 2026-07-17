import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { getContentTranslations, saveContentTranslations, validateRequiredTranslations } from "@/lib/translation/adminContent";

const DRAFT_STATUS = "Bản nháp";
const PUBLISHED_STATUS = "Đã xuất bản";
const UNCATEGORIZED = "Chưa phân loại";

function verifyAdminSession(request: NextRequest) {
  const tokenCookie = request.cookies.get("admin_token");
  if (!tokenCookie) return null;

  const decoded = verifyToken(tokenCookie.value);
  if (!decoded) return null;

  return decoded;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function generateContentBlocks(summaryText: string, contentImageUrl?: string, title?: string): Prisma.InputJsonArray {
  const paragraphs = summaryText
    ? summaryText.split(/\r?\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
    : [];

  const blocks: Prisma.InputJsonObject[] = paragraphs.map((text) => ({
    type: "paragraph",
    text,
  }));

  if (contentImageUrl && contentImageUrl.trim()) {
    const imgBlock: Prisma.InputJsonObject = {
      type: "image",
      url: contentImageUrl.trim(),
      caption: title || "Hình ảnh mô tả nội dung bài viết",
    };

    if (blocks.length > 1) {
      blocks.splice(1, 0, imgBlock);
    } else {
      blocks.push(imgBlock);
    }
  }

  return blocks;
}

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
        destination: true,
      },
    });

    const formattedPosts = await Promise.all(posts.map(async (post) => ({
      id: post.id,
      title: post.title,
      category: post.category?.name || UNCATEGORIZED,
      destinationId: post.destinationId,
      destination: post.destination?.name || null,
      date: formatDate(post.createdAt),
      status: post.status,
      imageUrl: post.imageUrl || "",
      contentImageUrl: post.contentImageUrl || "",
      excerpt: post.excerpt || "",
      readTime: post.readTime || "",
      seoDescription: post.seoDescription || "",
      summary: post.summary || "",
      translations: await getContentTranslations("post", post.id),
    })));

    return NextResponse.json({ success: true, posts: formattedPosts });
  } catch (error) {
    console.error("Lỗi khi tải danh sách bài viết:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải danh sách bài viết." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const body = await request.json();
    const { title, category, destinationId, status, imageUrl, contentImageUrl, excerpt, readTime, seoDescription, summary } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Tiêu đề bài viết không được trống." }, { status: 400 });
    }

    const missingTranslations = validateRequiredTranslations("post", body.translations || {});
    if (missingTranslations.length > 0) {
      return NextResponse.json({ error: "Vui lòng nhập đủ bản dịch tiếng Anh và tiếng Trung cho bài viết.", missingTranslations }, { status: 400 });
    }

    const categoryName = category ? category.trim() : UNCATEGORIZED;
    const postStatus = status || DRAFT_STATUS;

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

    const contentBlocks = generateContentBlocks(summary, contentImageUrl, title);

    const newPost = await prisma.post.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        categoryId: dbCategory.id,
        destinationId: destinationId ? Number(destinationId) : null,
        status: postStatus,
        imageUrl: imageUrl ? imageUrl.trim() : null,
        contentImageUrl: contentImageUrl ? contentImageUrl.trim() : null,
        excerpt: excerpt ? excerpt.trim() : null,
        readTime: readTime ? readTime.trim() : null,
        seoDescription: seoDescription ? seoDescription.trim() : null,
        summary: summary ? summary.trim() : null,
        contentBlocks,
        publishedAt: postStatus === PUBLISHED_STATUS ? new Date() : null,
      },
    });

    await saveContentTranslations("post", newPost.id, body.translations || {}, {
      title: newPost.title,
      excerpt: newPost.excerpt,
      summary: newPost.summary,
      seoDescription: newPost.seoDescription,
      readTime: newPost.readTime,
      contentBlocks: newPost.contentBlocks,
    });

    return NextResponse.json({
      success: true,
      post: {
        id: newPost.id,
        title: newPost.title,
        category: dbCategory.name,
        destinationId: newPost.destinationId,
        date: formatDate(newPost.createdAt),
        status: newPost.status,
        imageUrl: newPost.imageUrl || "",
        contentImageUrl: newPost.contentImageUrl || "",
        excerpt: newPost.excerpt || "",
        readTime: newPost.readTime || "",
        seoDescription: newPost.seoDescription || "",
        summary: newPost.summary || "",
        translations: await getContentTranslations("post", newPost.id),
      },
    });
  } catch (error) {
    console.error("Lỗi khi tạo bài viết mới:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tạo bài viết." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, category, destinationId, status, imageUrl, contentImageUrl, excerpt, readTime, seoDescription, summary } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID bài viết cần chỉnh sửa." }, { status: 400 });
    }

    const postId = Number(id);

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Bài viết không tồn tại trên hệ thống." }, { status: 404 });
    }

    if (body.translations !== undefined) {
      const missingTranslations = validateRequiredTranslations("post", body.translations || {});
      if (missingTranslations.length > 0) {
        return NextResponse.json({ error: "Vui lòng nhập đủ bản dịch tiếng Anh và tiếng Trung cho bài viết.", missingTranslations }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};

    if (title && title.trim()) {
      const trimmedTitle = title.trim();
      updateData.title = trimmedTitle;

      if (trimmedTitle !== existingPost.title) {
        const baseSlug = slugify(trimmedTitle);
        let finalSlug = baseSlug || "bai-viet";
        let counter = 1;

        while (true) {
          const existingSlug = await prisma.post.findFirst({
            where: {
              slug: finalSlug,
              id: { not: postId },
            },
          });
          if (!existingSlug) break;

          finalSlug = `${baseSlug}-${counter}`;
          counter++;
        }
        updateData.slug = finalSlug;
      }
    }

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

    if (destinationId !== undefined) {
      updateData.destinationId = destinationId ? Number(destinationId) : null;
    }

    if (status) {
      updateData.status = status;
      if (status === PUBLISHED_STATUS && existingPost.status !== PUBLISHED_STATUS) {
        updateData.publishedAt = new Date();
      } else if (status === DRAFT_STATUS && existingPost.status === PUBLISHED_STATUS) {
        updateData.publishedAt = null;
      }
    }

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

    const finalSummary = summary !== undefined ? summary : existingPost.summary;
    const finalContentImageUrl = contentImageUrl !== undefined ? contentImageUrl : existingPost.contentImageUrl;
    const finalTitle = title !== undefined ? title : existingPost.title;
    updateData.contentBlocks = generateContentBlocks(finalSummary || "", finalContentImageUrl || "", finalTitle || "");

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        category: true,
        destination: true,
      },
    });

    if (body.translations !== undefined) {
      await saveContentTranslations("post", updatedPost.id, body.translations || {}, {
        title: updatedPost.title,
        excerpt: updatedPost.excerpt,
        summary: updatedPost.summary,
        seoDescription: updatedPost.seoDescription,
        readTime: updatedPost.readTime,
        contentBlocks: updatedPost.contentBlocks,
      });
    }

    return NextResponse.json({
      success: true,
      post: {
        id: updatedPost.id,
        title: updatedPost.title,
        category: updatedPost.category?.name || UNCATEGORIZED,
        destinationId: updatedPost.destinationId,
        destination: updatedPost.destination?.name || null,
        date: formatDate(updatedPost.createdAt),
        status: updatedPost.status,
        imageUrl: updatedPost.imageUrl || "",
        contentImageUrl: updatedPost.contentImageUrl || "",
        excerpt: updatedPost.excerpt || "",
        readTime: updatedPost.readTime || "",
        seoDescription: updatedPost.seoDescription || "",
        summary: updatedPost.summary || "",
        translations: await getContentTranslations("post", updatedPost.id),
      },
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật bài viết:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật bài viết." }, { status: 500 });
  }
}

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

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Bài viết không tồn tại trên hệ thống." }, { status: 404 });
    }

    await prisma.contentTranslation.deleteMany({ where: { entityType: "post", entityId: postId } });
    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true, message: "Xóa bài viết thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa bài viết:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa bài viết." }, { status: 500 });
  }
}