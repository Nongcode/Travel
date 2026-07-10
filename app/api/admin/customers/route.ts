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

    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formattedCustomers = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      totalBookings: customer.totalBookings,
      totalSpent: customer.totalSpent,
      notes: customer.notes || undefined,
      status: customer.status,
      dateAdded: customer.createdAt.toISOString().split("T")[0],
    }));

    return NextResponse.json({ success: true, customers: formattedCustomers });
  } catch (error) {
    console.error("Lỗi khi tải danh sách khách hàng:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải danh sách khách hàng." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, notes, status, totalBookings, totalSpent } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc." }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        totalBookings: totalBookings || 0,
        totalSpent: totalSpent || "0",
        notes: notes || null,
        status: status || "Hoạt động",
      },
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
    console.error("Lỗi khi tạo khách hàng:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tạo khách hàng." }, { status: 500 });
  }
}
