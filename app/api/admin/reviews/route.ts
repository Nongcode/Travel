import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

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

    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      customerName: review.customerName,
      packageName: review.packageName,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      avatar: review.avatar || undefined,
      date: review.createdAt.toISOString().split("T")[0],
    }));

    return NextResponse.json({ success: true, reviews: formattedReviews });
  } catch (error) {
    console.error("Lỗi khi tải danh sách reviews:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải danh sách reviews." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const body = await request.json();
    const { customerName, packageName, rating, comment, avatar, status } = body;

    if (!customerName || !packageName || !comment) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc." }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        customerName,
        packageName,
        rating: rating || 5,
        comment,
        status: status || "Hiển thị",
        avatar: avatar || null,
      },
    });

    const formattedReview = {
      id: review.id,
      customerName: review.customerName,
      packageName: review.packageName,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      avatar: review.avatar || undefined,
      date: review.createdAt.toISOString().split("T")[0],
    };

    return NextResponse.json({ success: true, review: formattedReview });
  } catch (error) {
    console.error("Lỗi khi tạo review:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tạo review." }, { status: 500 });
  }
}
