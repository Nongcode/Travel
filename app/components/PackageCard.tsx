import Link from "next/link";

type PackageCardProps = {
  item: {
    slug: string;
    name: string;
    destination: string;
    duration: string;
    price: string;
    summary: string;
    image: string;
    status: string;
  };
};

export function PackageCard({ item }: PackageCardProps) {
  return (
    <Link className="package-card" href={`/goi-du-lich/${item.slug}`}>
      <div
        className="package-image"
        style={{ backgroundImage: `url(${item.image})` }}
      >
        <span>{item.status}</span>
      </div>
      <div className="package-body">
        <p className="package-kicker">
          {item.destination} / {item.duration}
        </p>
        <h3>{item.name}</h3>
        <p>{item.summary}</p>
        <div className="package-footer">
          <strong>{item.price}</strong>
          <span>Chi tiết</span>
        </div>
      </div>
    </Link>
  );
}
