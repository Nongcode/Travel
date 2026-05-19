import { PackageCard } from "./PackageCard";

type PackageItem = {
  id: number;
  slug: string;
  name: string;
  destination: string;
  duration: string;
  price: string;
  summary: string;
  image: string;
  status: string;
};

type PackageCarouselProps = {
  items: PackageItem[];
};

export function PackageCarousel({ items }: PackageCarouselProps) {
  const loopItems = [...items, ...items];

  return (
    <div className="package-carousel">
      <div className="package-carousel-track">
        {loopItems.map((item, index) => (
          <PackageCard item={item} key={`${item.slug}-${index}`} />
        ))}
      </div>
    </div>
  );
}
