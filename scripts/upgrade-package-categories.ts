import prisma from "../lib/prisma";

const seedCategories = [
  {
    name: "Adventure Tours",
    slug: "adventure-tours",
    description: "Trekking, motorbiking, and exploring rugged landscapes for adrenaline seekers.",
  },
  {
    name: "Luxury & Cruises",
    slug: "luxury-cruises",
    description: "Premium yachts, 5-star hotels, and customized high-end itineraries.",
  },
  {
    name: "Cultural & Heritage",
    slug: "cultural-heritage",
    description: "Immersive local life, ancient temples, cooking classes, and historical sites.",
  },
  {
    name: "Wellness & Spa",
    slug: "wellness-spa",
    description: "Yoga retreats, hot springs, and relaxing resort staycations.",
  },
];

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS package_categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE packages
    ADD COLUMN IF NOT EXISTS category_id INTEGER;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'packages_category_id_fkey'
      ) THEN
        ALTER TABLE packages
        ADD CONSTRAINT packages_category_id_fkey
        FOREIGN KEY (category_id)
        REFERENCES package_categories(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;
      END IF;
    END $$;
  `);

  for (const category of seedCategories) {
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO package_categories (name, slug, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (slug)
        DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          updated_at = CURRENT_TIMESTAMP;
      `,
      category.name,
      category.slug,
      category.description,
    );
  }

  console.log("Package categories upgrade completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });