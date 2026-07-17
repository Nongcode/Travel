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
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.totalBookings !== undefined) updateData.totalBookings = body.totalBookings;
    if (body.totalSpent !== undefined) updateData.totalSpent = body.totalSpent;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.status !== undefined) updateData.status = body.status;

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    const formattedCustomer = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      totalBookings: customer.totalBookings,
      totalSpent: customer.totalSpent,
      notes: customer.notes || undefined,
      status: customer.status,
      dateAdded: customer.createdAt.toISOString().split("T")[0],
    };

    return NextResponse.json({ success: true, customer: formattedCustomer });
  } catch (error) {
    console.error("Lỗi khi cập nhật khách hàng:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật khách hàng." }, { status: 500 });
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

    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi khi xóa khách hàng:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa khách hàng." }, { status: 500 });
  }
}
