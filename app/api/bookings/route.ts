import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, tourName, notes } = body;

    // Validate inputs
    if (!name || !email || !phone || !tourName) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập đầy đủ các trường thông tin bắt buộc." },
        { status: 400 }
      );
    }

    // Insert or update customer profile
    const customer = await prisma.customer.upsert({
      where: { email },
      update: {
        name,
        phone,
        totalBookings: { increment: 1 }
      },
      create: {
        name,
        email,
        phone,
        totalBookings: 1,
        status: "Hoạt động",
      },
    });

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerName: name,
        email,
        phone,
        tourName,
        status: "Chờ xử lý",
        notes: notes || "",
      },
    });

    return NextResponse.json({ success: true, data: { booking, customer } });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, error: "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
