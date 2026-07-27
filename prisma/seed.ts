import { Prisma, PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { destinations, posts, offers, packages, packageCollections } from "../app/data/travel";
import { detailedPosts } from "../app/data/postsContent";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Seed Destinations
  for (const name of destinations) {
    await prisma.destination.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("Destinations seeded.");

  // 2. Seed Offers
  for (const offer of offers) {
    // Valid until format is DD/MM/YYYY, needs parsing
    let validDate = null;
    if (offer.validUntil) {
      const [day, month, year] = offer.validUntil.split("/");
      if (day && month && year) {
        validDate = new Date(Number(year), Number(month) - 1, Number(day));
      }
    }
    await prisma.offer.create({
      data: {
        title: offer.title,
        description: offer.description,
        tag: offer.tag,
        imageUrl: offer.image,
        validUntil: validDate,
      },
    });
  }
  console.log("Offers seeded.");

  // 3. Seed Packages
  for (const pkg of packages) {
    // Find destination
    const destination = await prisma.destination.findUnique({
      where: { name: pkg.destination },
    });

    await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: {},
      create: {
        slug: pkg.slug,
        name: pkg.name,
        destinationId: destination?.id,
        duration: pkg.duration,
        priceText: pkg.price,
        summary: pkg.summary,
        imageUrl: pkg.image,
        status: pkg.status,
      },
    });
  }
  console.log("Packages seeded.");

  // 4. Seed Package Collections
  for (const collection of packageCollections) {
    const existingCollection = await prisma.packageCollection.findFirst({
      where: { accent: collection.accent },
      orderBy: { id: "asc" },
    });

    const createdCollection = existingCollection
      ? await prisma.packageCollection.update({
          where: { id: existingCollection.id },
          data: {
            eyebrow: collection.eyebrow,
            title: collection.title,
            description: collection.description,
            accent: collection.accent,
          },
        })
      : await prisma.packageCollection.create({
          data: {
            eyebrow: collection.eyebrow,
            title: collection.title,
            description: collection.description,
            accent: collection.accent,
          },
        });

    // Link items
    for (let i = 0; i < collection.items.length; i++) {
      const item = collection.items[i];
      const pkg = await prisma.package.findUnique({
        where: { slug: item.slug },
      });
      if (pkg) {
        await prisma.packageCollectionItem.upsert({
          where: {
            collectionId_packageId: {
              collectionId: createdCollection.id,
              packageId: pkg.id,
            },
          },
          update: { sortOrder: i },
          create: {
            collectionId: createdCollection.id,
            packageId: pkg.id,
            sortOrder: i,
          },
        });
      }
    }
  }
  console.log("Package Collections seeded.");

  // 5. Seed Categories & Authors
  const categoryNames = Array.from(new Set(posts.map((p) => p.category)));
  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Define default author since travel.ts doesn't have it
  const defaultAuthor = await prisma.author.create({
    data: {
      name: "Admin TimesGreen",
      role: "Content Manager",
    },
  });

  // 6. Seed Posts
  for (const post of posts) {
    const detailed = detailedPosts[post.id];
    const category = await prisma.category.findUnique({
      where: { name: post.category },
    });

    let authorId = defaultAuthor.id;
    if (detailed && detailed.author) {
      // Find or create author
      let author = await prisma.author.findFirst({
        where: { name: detailed.author.name },
      });
      if (!author) {
        author = await prisma.author.create({
          data: {
            name: detailed.author.name,
            avatarUrl: detailed.author.avatar,
            role: detailed.author.role,
          },
        });
      }
      authorId = author.id;
    }

    let relatedPackageId = null;
    if (detailed && detailed.relatedPackageSlug) {
      const relatedPkg = await prisma.package.findUnique({
        where: { slug: detailed.relatedPackageSlug },
      });
      if (relatedPkg) {
        relatedPackageId = relatedPkg.id;
      }
    }

    let publishDate = null;
    if (post.date) {
      const [day, month, year] = post.date.split("/");
      if (day && month && year) {
        publishDate = new Date(Number(year), Number(month) - 1, Number(day));
      }
    }

    await prisma.post.create({
      data: {
        title: post.title,
        excerpt: post.excerpt,
        imageUrl: post.image,
        readTime: post.readTime,
        status: post.status,
        categoryId: category?.id,
        authorId: authorId,
        relatedPackageId: relatedPackageId,
        summary: detailed?.summary,
        seoDescription: detailed?.seoDescription,
        contentBlocks: detailed ? (detailed.blocks as Prisma.InputJsonValue) : undefined,
        publishedAt: publishDate,
      },
    });
  }
  console.log("Posts seeded.");

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
