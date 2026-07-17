import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const offers = await prisma.offer.findMany({ orderBy: [{ validUntil: "desc" }, { id: "desc" }] });
    return NextResponse.json({
      success: true,
      offers: offers.map((offer) => ({
        id: offer.id,
        title: offer.title,
        description: offer.description || "",
        tag: offer.tag || "",
        imageUrl: offer.imageUrl || "",
        validUntil: offer.validUntil,
      })),
    });
  } catch (error) {
    console.error("Failed to load offers:", error);
    return NextResponse.json({ error: "Failed to load offers." }, { status: 500 });
  }
}
