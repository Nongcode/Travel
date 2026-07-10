import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/adminAuth";
import { ensureDefaultI18nData } from "@/lib/i18n/server";
import { normalizeLocale } from "@/lib/i18n/config";
import { normalizeLegacyText } from "@/lib/text/encoding";

type StaticKeyRow = { id: number; namespace: string; key: string; description: string | null; values: { locale: string; value: string }[] };

function formatKey(row: StaticKeyRow | null) {
  if (!row) return null;
  return {
    id: row.id,
    namespace: row.namespace,
    key: row.key,
    description: row.description ? normalizeLegacyText(row.description) : "",
    translations: Object.fromEntries(row.values.map((value) => [value.locale, normalizeLegacyText(value.value)])),
  };
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureDefaultI18nData();
    const keys = await prisma.staticTranslationKey.findMany({
      orderBy: [{ namespace: "asc" }, { key: "asc" }],
      include: { values: true },
    });
    return NextResponse.json({ success: true, translations: keys.map(formatKey) });
  } catch (error) {
    console.error("Failed to load static translations:", error);
    return NextResponse.json({ error: "Failed to load static translations." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const namespace = String(body.namespace || "common").trim().toLowerCase();
    const keyName = String(body.key || "").trim().toLowerCase().replace(/[^a-z0-9_.-]+/g, "_");
    if (!keyName) return NextResponse.json({ error: "Translation key is required." }, { status: 400 });

    const key = await prisma.staticTranslationKey.upsert({
      where: { namespace_key: { namespace, key: keyName } },
      update: { description: body.description ? normalizeLegacyText(String(body.description)) : null },
      create: { namespace, key: keyName, description: body.description ? normalizeLegacyText(String(body.description)) : null },
    });

    const translations = body.translations && typeof body.translations === "object" ? body.translations : {};
    for (const [rawLocale, rawValue] of Object.entries(translations)) {
      const locale = normalizeLocale(rawLocale);
      const value = normalizeLegacyText(String(rawValue || "").trim());
      if (!value) continue;
      await prisma.staticTranslationValue.upsert({
        where: { keyId_locale: { keyId: key.id, locale } },
        update: { value },
        create: { keyId: key.id, locale, value },
      });
    }

    const saved = await prisma.staticTranslationKey.findUnique({ where: { id: key.id }, include: { values: true } });
    return NextResponse.json({ success: true, translation: formatKey(saved) });
  } catch (error) {
    console.error("Failed to save static translation:", error);
    return NextResponse.json({ error: "Failed to save static translation." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}

export async function DELETE(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid translation id." }, { status: 400 });
    await prisma.staticTranslationKey.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete static translation:", error);
    return NextResponse.json({ error: "Failed to delete static translation." }, { status: 500 });
  }
}



