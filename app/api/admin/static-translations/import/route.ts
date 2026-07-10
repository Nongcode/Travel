import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/adminAuth";
import { normalizeLocale } from "@/lib/i18n/config";
import { normalizeLegacyText } from "@/lib/text/encoding";

const REQUIRED_COLUMNS = ["namespace", "key", "description", "vi", "en", "zh"];

function getCell(row: Record<string, unknown>, key: string) {
  const direct = row[key];
  if (direct !== undefined) return String(direct).trim();
  const found = Object.entries(row).find(([column]) => column.trim().toLowerCase() === key);
  return found ? String(found[1] ?? "").trim() : "";
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Missing import file." }, { status: 400 });
    }

    const workbook = XLSX.read(Buffer.from(await file.arrayBuffer()), { type: "buffer" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: "" });
    if (rows.length === 0) return NextResponse.json({ error: "Import file is empty." }, { status: 400 });

    const firstRowKeys = Object.keys(rows[0]).map((key) => key.trim().toLowerCase());
    const missing = REQUIRED_COLUMNS.filter((column) => !firstRowKeys.includes(column));
    if (missing.length > 0) {
      return NextResponse.json({ error: "Missing required columns: " + missing.join(", ") }, { status: 400 });
    }

    let imported = 0;
    for (const row of rows) {
      const namespace = getCell(row, "namespace").toLowerCase();
      const keyName = getCell(row, "key").toLowerCase().replace(/[^a-z0-9_.-]+/g, "_");
      if (!namespace || !keyName) continue;

      const key = await prisma.staticTranslationKey.upsert({
        where: { namespace_key: { namespace, key: keyName } },
        update: { description: normalizeLegacyText(getCell(row, "description")) || null },
        create: { namespace, key: keyName, description: normalizeLegacyText(getCell(row, "description")) || null },
      });

      for (const column of ["vi", "en", "zh"]) {
        const value = normalizeLegacyText(getCell(row, column));
        if (!value) continue;
        const locale = normalizeLocale(column);
        await prisma.staticTranslationValue.upsert({
          where: { keyId_locale: { keyId: key.id, locale } },
          update: { value },
          create: { keyId: key.id, locale, value },
        });
      }
      imported++;
    }

    return NextResponse.json({ success: true, imported });
  } catch (error) {
    console.error("Failed to import static translations:", error);
    return NextResponse.json({ error: "Failed to import static translations." }, { status: 500 });
  }
}


