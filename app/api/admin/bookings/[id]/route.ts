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

function formatDate(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
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
      return NextResponse.json({ error: "ID booking không hợp lệ." }, { status: 400 });
    }

    const body = await request.json();
    const updateData: any = {};
    if (body.customerName !== undefined) updateData.customerName = body.customerName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.tourName !== undefined) updateData.tourName = body.tourName;
    if (body.travelDate !== undefined) updateData.travelDate = body.travelDate;
    if (body.numberOfTravelers !== undefined) updateData.numberOfTravelers = body.numberOfTravelers;
    if (body.totalPrice !== undefined) updateData.totalPrice = body.totalPrice;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.adminNotes !== undefined) updateData.adminNotes = body.adminNotes;
    if (body.status !== undefined) updateData.status = body.status;

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    const formattedBooking = {
      id: booking.id,
      customerName: booking.customerName,
      email: booking.email || "",
      phone: booking.phone,
      tourName: booking.tourName || "",
      bookingDate: formatDate(booking.createdAt),
      travelDate: booking.travelDate || "",
      numberOfTravelers: booking.numberOfTravelers,
      totalPrice: booking.totalPrice || "",
      status: booking.status === "Chờ xử lý" ? "Chờ xử lý" : booking.status,
      notes: booking.notes || "",
      adminNotes: booking.adminNotes || "",
    };

    return NextResponse.json({ success: true, booking: formattedBooking });
  } catch (error) {
    console.error("Lỗi khi cập nhật booking:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật booking." }, { status: 500 });
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
      return NextResponse.json({ error: "ID booking không hợp lệ." }, { status: 400 });
    }

    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi khi xóa booking:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa booking." }, { status: 500 });
  }
}
