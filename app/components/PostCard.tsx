import Link from "next/link";

type PostCardProps = {
  post: {
    id: number;
    category: string;
    title: string;
    excerpt: string;
    image: string;
    readTime: string;
    date?: string;
  };
};

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="post-card">
      <div
        className="post-image"
        style={{ backgroundImage: `url(${post.image})` }}
      />
      <div className="post-body">
        <div className="post-meta">
          <span>{post.category}</span>
          <span>{post.date ?? post.readTime}</span>
        </div>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <Link href={`/tin-tuc/${post.id}`} aria-label={`Đọc tiếp ${post.title}`}>
          Đọc tiếp
        </Link>
      </div>
    </article>
  );
}
