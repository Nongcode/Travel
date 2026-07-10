import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/adminAuth";
import { ensureDefaultI18nData } from "@/lib/i18n/server";
import { normalizeLocale } from "@/lib/i18n/config";

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureDefaultI18nData();
    const languages = await prisma.language.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
    return NextResponse.json({ success: true, languages });
  } catch (error) {
    console.error("Failed to load languages:", error);
    return NextResponse.json({ error: "Failed to load languages." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const code = normalizeLocale(body.code);
    const language = await prisma.language.create({
      data: {
        code,
        name: String(body.name || code).trim(),
        nativeName: String(body.nativeName || body.name || code).trim(),
        flag: body.flag ? String(body.flag) : null,
        isActive: body.isActive !== false,
        isDefault: false,
        sortOrder: Number(body.sortOrder || 99),
      },
    });
    return NextResponse.json({ success: true, language });
  } catch (error) {
    console.error("Failed to create language:", error);
    return NextResponse.json({ error: "Failed to create language." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid language id." }, { status: 400 });

    const existing = await prisma.language.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Language not found." }, { status: 404 });
    if (body.isDefault === true) {
      await prisma.language.updateMany({ data: { isDefault: false } });
    }

    const language = await prisma.language.update({
      where: { id },
      data: {
        name: body.name !== undefined ? String(body.name).trim() : undefined,
        nativeName: body.nativeName !== undefined ? String(body.nativeName).trim() : undefined,
        flag: body.flag !== undefined ? String(body.flag) : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
        isDefault: body.isDefault !== undefined ? Boolean(body.isDefault) : undefined,
        sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
      },
    });
    return NextResponse.json({ success: true, language });
  } catch (error) {
    console.error("Failed to update language:", error);
    return NextResponse.json({ error: "Failed to update language." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid language id." }, { status: 400 });
    const existing = await prisma.language.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Language not found." }, { status: 404 });
    if (existing.isDefault) return NextResponse.json({ error: "Cannot delete the default language." }, { status: 400 });
    await prisma.language.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete language:", error);
    return NextResponse.json({ error: "Failed to delete language." }, { status: 500 });
  }
}
