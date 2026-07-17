import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS offer_id INTEGER`);
  await prisma.$executeRawUnsafe(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS description TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS min_people INTEGER`);
  await prisma.$executeRawUnsafe(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS max_people INTEGER`);
  await prisma.$executeRawUnsafe(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS people_note TEXT`);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'packages_offer_id_fkey'
      ) THEN
        ALTER TABLE packages
        ADD CONSTRAINT packages_offer_id_fkey
        FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS packages_offer_id_idx ON packages(offer_id)`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS package_details (
      id SERIAL PRIMARY KEY,
      package_id INTEGER NOT NULL UNIQUE,
      banner_image_url TEXT,
      gallery JSONB,
      overview TEXT,
      highlights JSONB,
      offers JSONB,
      included JSONB,
      itinerary JSONB,
      benefits JSONB,
      consult_title TEXT,
      consult_copy TEXT,
      consult_points JSONB,
      seo_title TEXT,
      seo_description TEXT,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT package_details_package_id_fkey
        FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO package_details (
      package_id,
      overview,
      highlights,
      offers,
      included,
      itinerary,
      benefits,
      consult_title,
      consult_copy,
      consult_points,
      created_at,
      updated_at
    )
    SELECT
      id,
      detail_content->>'overviewSuffix',
      detail_content->'moments',
      detail_content->'offers',
      detail_content->'included',
      detail_content->'itinerary',
      detail_content->'benefits',
      detail_content->>'consultTitle',
      detail_content->>'consultCopy',
      detail_content->'consultPoints',
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    FROM packages
    WHERE detail_content IS NOT NULL
    ON CONFLICT (package_id) DO UPDATE SET
      overview = COALESCE(package_details.overview, EXCLUDED.overview),
      highlights = COALESCE(package_details.highlights, EXCLUDED.highlights),
      offers = COALESCE(package_details.offers, EXCLUDED.offers),
      included = COALESCE(package_details.included, EXCLUDED.included),
      itinerary = COALESCE(package_details.itinerary, EXCLUDED.itinerary),
      benefits = COALESCE(package_details.benefits, EXCLUDED.benefits),
      consult_title = COALESCE(package_details.consult_title, EXCLUDED.consult_title),
      consult_copy = COALESCE(package_details.consult_copy, EXCLUDED.consult_copy),
      consult_points = COALESCE(package_details.consult_points, EXCLUDED.consult_points),
      updated_at = CURRENT_TIMESTAMP
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE packages
    SET description = summary
    WHERE description IS NULL AND summary IS NOT NULL
  `);

  console.log("Package detail upgrade completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
