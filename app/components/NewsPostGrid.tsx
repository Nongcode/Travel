"use client";

import { useState } from "react";
import { PostCard } from "./PostCard";

type NewsPost = {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  date?: string;
};

type NewsPostGridProps = {
  posts: NewsPost[];
};

export function NewsPostGrid({ posts }: NewsPostGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts = posts.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const paginationItems: Array<number | "ellipsis"> = [];
  if (totalPages <= 5) {
    paginationItems.push(...Array.from({ length: totalPages }, (_, index) => index + 1));
  } else {
    paginationItems.push(1);

    if (safePage > 3) {
      paginationItems.push("ellipsis");
    }

    const startPage = Math.max(2, safePage - 1);
    const endPage = Math.min(totalPages - 1, safePage + 1);
    for (let page = startPage; page <= endPage; page += 1) {
      paginationItems.push(page);
    }

    if (safePage < totalPages - 2) {
      paginationItems.push("ellipsis");
    }

    paginationItems.push(totalPages);
  }

  return (
    <>
      <div className="post-grid news-page-grid">
        {paginatedPosts.map((post) => (
          <PostCard post={post} key={post.id} />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav className="news-pagination" aria-label="News pages">
          <button
            type="button"
            className="news-pagination-arrow"
            aria-label="Previous page"
            title="Previous page"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            <span aria-hidden="true">{"‹"}</span>
          </button>

          <div className="news-pagination-pages">
            {paginationItems.map((item, index) =>
              item === "ellipsis" ? (
                <span className="news-pagination-ellipsis" aria-hidden="true" key={"ellipsis-" + index}>
                  {"…"}
                </span>
              ) : (
                <button
                  type="button"
                  className={safePage === item ? "active" : ""}
                  aria-current={safePage === item ? "page" : undefined}
                  onClick={() => setCurrentPage(item)}
                  key={item}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            className="news-pagination-arrow"
            aria-label="Next page"
            title="Next page"
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          >
            <span aria-hidden="true">{"›"}</span>
          </button>
        </nav>
      ) : null}
    </>
  );
}