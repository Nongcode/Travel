"use client";

import { useI18n } from "./I18nProvider";

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
  const { t, href } = useI18n();
  const postHref = href("/tin-tuc/" + post.id);
  const readMoreLabel = t("common", "read_more", "\u0110\u1ecdc th\u00eam");

  return (
    <article className="post-card">
      <div className="post-image" style={{ backgroundImage: "url(" + post.image + ")" }} />
      <div className="post-body">
        <div className="post-meta">
          <span>{post.category}</span>
          <span>{post.date ?? post.readTime}</span>
        </div>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <a href={postHref} aria-label={readMoreLabel + " " + post.title}>
          {readMoreLabel}
        </a>
      </div>
    </article>
  );
}
