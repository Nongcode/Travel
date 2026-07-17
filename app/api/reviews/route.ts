import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, packageName, rating, comment } = body;

    // Validate inputs
    if (!name || !email || !phone || !packageName || !rating || !comment) {
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
        // Since they just did something (left a review), maybe increment total bookings or leave it
      },
      create: {
        name,
        email,
        phone,
        totalBookings: 1, // Defaulting to 1 booking as they left a review for a package they went on
        status: "Hoạt động",
      },
    });

    // Create review
    const review = await prisma.review.create({
      data: {
        customerName: name,
        packageName,
        rating: Number(rating),
        comment,
        status: "Hiển thị",
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&w=150&q=80` // random avatar
      },
    });

    return NextResponse.json({ success: true, data: { review, customer } });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
