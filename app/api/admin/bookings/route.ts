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

export async function GET(request: NextRequest) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formattedBookings = bookings.map((booking) => ({
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
    }));

    return NextResponse.json({ success: true, bookings: formattedBookings });
  } catch (error) {
    console.error("Lỗi khi tải danh sách bookings:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải danh sách booking." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const body = await request.json();
    const { customerName, email, phone, tourName, travelDate, numberOfTravelers, totalPrice, notes, adminNotes } = body;

    if (!customerName || !phone) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc (Tên, SĐT)." }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        customerName,
        email: email || null,
        phone,
        tourName: tourName || null,
        travelDate: travelDate || null,
        numberOfTravelers: numberOfTravelers || 1,
        totalPrice: totalPrice || null,
        notes: notes || null,
        adminNotes: adminNotes || null,
        status: "Chờ xử lý",
      },
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
    console.error("Lỗi khi tạo booking:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tạo booking." }, { status: 500 });
  }
}
