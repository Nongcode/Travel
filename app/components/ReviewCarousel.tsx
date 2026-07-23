"use client";

import { ScrollProgressIndicator, useHorizontalScrollProgress } from "./ScrollProgressIndicator";

type ReviewItem = {
  id: number;
  customerName: string;
  packageName: string;
  rating: number;
  comment: string;
  avatar?: string | null;
};

type ReviewCarouselProps = {
  reviews: ReviewItem[];
};

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=150&q=80";

export function ReviewCarousel({ reviews }: ReviewCarouselProps) {
  const { viewportRef, hasOverflow, progress } =
    useHorizontalScrollProgress<HTMLDivElement>();

  return (
    <>
      <div className="reviews-grid review-carousel" ref={viewportRef}>
        {reviews.map((review) => (
          <article key={review.id} className="review-card">
            <div className="review-header">
              <div
                className="review-avatar"
                style={{
                  backgroundImage: "url(" + (review.avatar || FALLBACK_AVATAR) + ")",
                }}
              />
              <div className="review-meta">
                <h4>{review.customerName}</h4>
                <span className="review-package">{review.packageName}</span>
              </div>
              <div className="review-rating" aria-label={review.rating + " out of 5 stars"}>
                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
              </div>
            </div>
            <p className="review-comment">&quot;{review.comment}&quot;</p>
          </article>
        ))}
      </div>

      {hasOverflow ? (
        <ScrollProgressIndicator
          className="review-scroll-indicator"
          label="Customer review position"
          progress={progress}
        />
      ) : null}
    </>
  );
}