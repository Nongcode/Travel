import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/adminAuth";
import { slugify } from "@/lib/slug";
import { getContentTranslations, saveContentTranslations, validateRequiredTranslations } from "@/lib/translation/adminContent";

type PackageRow = {
  id: number;
  slug: string;
  name: string;
  duration: string | null;
  priceText: string | null;
  summary: string | null;
  description: string | null;
  minPeople: number | null;
  maxPeople: number | null;
  peopleNote: string | null;
  imageUrl: string | null;
  status: string;
  offerId: number | null;
  detailContent?: unknown;
  destination?: { name: string } | null;
  offer?: { id: number; title: string; description: string | null; validUntil: Date | null; tag: string | null } | null;
  detail?: { id: number } | null;
  collections?: { collectionId: number; collection: { title: string; accent: string | null } }[];
};

const packageInclude = { destination: true, offer: true, detail: true, collections: { include: { collection: true }, orderBy: { sortOrder: "asc" as const } } } as const;

function optionalString(value: unknown) {
  const text = value === undefined || value === null ? "" : String(value).trim();
  return text || null;
}

function optionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function formatPackage(pkg: PackageRow) {
  return {
    id: pkg.id,
    slug: pkg.slug,
    name: pkg.name,
    destination: pkg.destination?.name || "",
    offerId: pkg.offerId,
    offer: pkg.offer ? { id: pkg.offer.id, title: pkg.offer.title, description: pkg.offer.description || "", validUntil: pkg.offer.validUntil ? pkg.offer.validUntil.toISOString() : null, tag: pkg.offer.tag || "" } : null,
    duration: pkg.duration || "",
    price: pkg.priceText || "",
    status: pkg.status,
    summary: pkg.summary || "",
    description: pkg.description || "",
    minPeople: pkg.minPeople,
    maxPeople: pkg.maxPeople,
    peopleNote: pkg.peopleNote || "",
    imageUrl: pkg.imageUrl || "",
    hasDetail: Boolean(pkg.detail),
    detailContent: pkg.detailContent || null,
    collectionIds: pkg.collections?.map((item) => item.collectionId) || [],
    collectionNames: pkg.collections?.map((item) => item.collection.title) || [],
    translations: await getContentTranslations("package", pkg.id),
  };
}

function normalizeCollectionIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<number>();
  return value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0)
    .filter((item) => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    });
}

async function syncPackageCollections(packageId: number, collectionIds: number[]) {
  await prisma.packageCollectionItem.deleteMany({ where: { packageId } });
  if (collectionIds.length === 0) return;

  const existingCollections = await prisma.packageCollection.findMany({
    where: { id: { in: collectionIds } },
    select: { id: true },
  });
  const validIds = new Set(existingCollections.map((item) => item.id));
  const data = collectionIds
    .filter((collectionId) => validIds.has(collectionId))
    .map((collectionId, index) => ({ collectionId, packageId, sortOrder: index }));

  if (data.length > 0) await prisma.packageCollectionItem.createMany({ data, skipDuplicates: true });
}
async function findOrCreateDestination(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  return prisma.destination.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed, slug: slugify(trimmed) },
  });
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const packages = await prisma.package.findMany({ orderBy: { id: "desc" }, include: packageInclude });
    return NextResponse.json({ success: true, packages: await Promise.all(packages.map(formatPackage)) });
  } catch (error) {
    console.error("Failed to load packages:", error);
    return NextResponse.json({ error: "Failed to load packages." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Package name is required." }, { status: 400 });
    const missingTranslations = validateRequiredTranslations("package", body.translations || {});
    if (missingTranslations.length > 0) {
      return NextResponse.json({ error: "Vui lòng nhập đủ bản dịch tiếng Anh và tiếng Trung cho gói du lịch.", missingTranslations }, { status: 400 });
    }

    const destination = await findOrCreateDestination(String(body.destination || ""));
    const baseSlug = slugify(body.slug || name) || "goi-du-lich";
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.package.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = baseSlug + "-" + counter++;
    }

    let finalOfferId = null;

    if (body.offerTitle) {
      const createdOffer = await prisma.offer.create({
        data: {
          title: body.offerTitle,
          description: optionalString(body.offerDescription),
          validUntil: body.offerValidUntil ? new Date(body.offerValidUntil) : null,
        }
      });
      finalOfferId = createdOffer.id;
    }

    const collectionIds = normalizeCollectionIds(body.collectionIds);
    if (collectionIds.length === 0) return NextResponse.json({ error: "Vui lòng chọn ít nhất một danh mục gói du lịch." }, { status: 400 });
    const pkg = await prisma.package.create({
      data: {
        slug: finalSlug,
        name,
        destinationId: destination?.id,
        offerId: finalOfferId,
        duration: optionalString(body.duration),
        priceText: optionalString(body.price),
        summary: optionalString(body.summary),
        description: optionalString(body.description) || optionalString(body.summary),
        minPeople: optionalNumber(body.minPeople),
        maxPeople: optionalNumber(body.maxPeople),
        peopleNote: optionalString(body.peopleNote),
        imageUrl: optionalString(body.imageUrl),
        status: body.status ? String(body.status) : "Đang mở bán",
        detailContent: body.detailContent || undefined,
      },
      include: packageInclude,
    });
    await syncPackageCollections(pkg.id, collectionIds);
    await saveContentTranslations("package", pkg.id, body.translations || {}, { name, destination: destination?.name || "", duration: pkg.duration, summary: pkg.summary, description: pkg.description });
    const createdPackage = await prisma.package.findUnique({ where: { id: pkg.id }, include: packageInclude });
    return NextResponse.json({ success: true, package: createdPackage ? await formatPackage(createdPackage) : await formatPackage(pkg) });
  } catch (error) {
    console.error("Failed to create package:", error);
    return NextResponse.json({ error: "Failed to create package." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid package id." }, { status: 400 });
    const existing = await prisma.package.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Package not found." }, { status: 404 });
    if (body.translations !== undefined) {
      const missingTranslations = validateRequiredTranslations("package", body.translations || {});
      if (missingTranslations.length > 0) {
        return NextResponse.json({ error: "Vui lòng nhập đủ bản dịch tiếng Anh và tiếng Trung cho gói du lịch.", missingTranslations }, { status: 400 });
      }
    }

    let finalOfferId = existing.offerId;

    if (body.offerTitle) {
      if (existing.offerId) {
        // Update existing offer
        await prisma.offer.update({
          where: { id: existing.offerId },
          data: {
            title: body.offerTitle,
            description: optionalString(body.offerDescription),
            validUntil: body.offerValidUntil ? new Date(body.offerValidUntil) : null,
          }
        });
      } else {
        // Create new offer
        const createdOffer = await prisma.offer.create({
          data: {
            title: body.offerTitle,
            description: optionalString(body.offerDescription),
            validUntil: body.offerValidUntil ? new Date(body.offerValidUntil) : null,
          }
        });
        finalOfferId = createdOffer.id;
      }
    } else if (body.offerTitle === "") {
      // If they clear the title, remove the offer
      finalOfferId = null;
      // Optionally delete the orphan offer, but leaving it null is safer for now.
    }

    const destination = body.destination !== undefined ? await findOrCreateDestination(String(body.destination || "")) : undefined;
    const pkg = await prisma.package.update({
      where: { id },
      data: {
        name: body.name !== undefined ? String(body.name).trim() : undefined,
        destinationId: destination === undefined ? undefined : destination?.id || null,
        offerId: finalOfferId,
        duration: body.duration !== undefined ? optionalString(body.duration) : undefined,
        priceText: body.price !== undefined ? optionalString(body.price) : undefined,
        summary: body.summary !== undefined ? optionalString(body.summary) : undefined,
        description: body.description !== undefined ? optionalString(body.description) : undefined,
        minPeople: body.minPeople !== undefined ? optionalNumber(body.minPeople) : undefined,
        maxPeople: body.maxPeople !== undefined ? optionalNumber(body.maxPeople) : undefined,
        peopleNote: body.peopleNote !== undefined ? optionalString(body.peopleNote) : undefined,
        imageUrl: body.imageUrl !== undefined ? optionalString(body.imageUrl) : undefined,
        status: body.status !== undefined ? String(body.status) : undefined,
        detailContent: body.detailContent !== undefined ? body.detailContent : undefined,
      },
      include: packageInclude,
    });
    if (body.collectionIds !== undefined) {
      const collectionIds = normalizeCollectionIds(body.collectionIds);
      if (collectionIds.length === 0) return NextResponse.json({ error: "Vui lòng chọn ít nhất một danh mục gói du lịch." }, { status: 400 });
      await syncPackageCollections(pkg.id, collectionIds);
    }
    if (body.translations !== undefined) {
      await saveContentTranslations("package", pkg.id, body.translations || {}, { name: pkg.name, destination: pkg.destination?.name || "", duration: pkg.duration, summary: pkg.summary, description: pkg.description });
    }
    const updatedPackage = await prisma.package.findUnique({ where: { id: pkg.id }, include: packageInclude });
    return NextResponse.json({ success: true, package: updatedPackage ? await formatPackage(updatedPackage) : await formatPackage(pkg) });
  } catch (error) {
    console.error("Failed to update package:", error);
    return NextResponse.json({ error: "Failed to update package." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid package id." }, { status: 400 });
    await prisma.contentTranslation.deleteMany({ where: { entityType: "package", entityId: id } });
    await prisma.package.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete package:", error);
    return NextResponse.json({ error: "Failed to delete package." }, { status: 500 });
  }
}








