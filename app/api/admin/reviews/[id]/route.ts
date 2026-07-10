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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID không hợp lệ." }, { status: 400 });
    }

    const body = await request.json();
    const updateData: any = {};
    if (body.customerName !== undefined) updateData.customerName = body.customerName;
    if (body.packageName !== undefined) updateData.packageName = body.packageName;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.comment !== undefined) updateData.comment = body.comment;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;

    const review = await prisma.review.update({
      where: { id },
      data: updateData,
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
    console.error("Lỗi khi cập nhật review:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật review." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID không hợp lệ." }, { status: 400 });
    }

    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi khi xóa review:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa review." }, { status: 500 });
  }
}
