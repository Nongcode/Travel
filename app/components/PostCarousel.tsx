"use client";

import { PostCard } from "./PostCard";
import { ScrollProgressIndicator, useHorizontalScrollProgress } from "./ScrollProgressIndicator";

type PostItem = {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  date?: string;
};

type PostCarouselProps = {
  posts: PostItem[];
};

export function PostCarousel({ posts }: PostCarouselProps) {
  const { viewportRef, hasOverflow, progress } =
    useHorizontalScrollProgress<HTMLDivElement>();

  return (
    <>
      <div className="post-grid news-grid" ref={viewportRef}>
        {posts.map((post) => (
          <PostCard post={post} key={post.id} />
        ))}
      </div>

      {hasOverflow ? (
        <ScrollProgressIndicator
          className="post-scroll-indicator"
          label="News story position"
          progress={progress}
        />
      ) : null}
    </>
  );
}

