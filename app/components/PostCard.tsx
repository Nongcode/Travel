
"use client";

import Link from "next/link";
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
        <Link href={href("/tin-tuc/" + post.id)} aria-label={t("common", "read_more", "??c ti?p") + " " + post.title}>
          {t("common", "read_more", "??c ti?p")}
        </Link>
      </div>
    </article>
  );
}
