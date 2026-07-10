"use client";

import { useState } from "react";
import { ReviewForm } from "./ReviewForm";
import { useI18n } from "./I18nProvider";

type ReviewsHeaderProps = {
  eyebrow: string;
  destinations: string[];
};

export function ReviewsHeader({ eyebrow, destinations }: ReviewsHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();

  return (
    <>
      <div className="reviews-header-flex">
        <div className="section-heading compact" style={{ margin: 0 }}>
          <p className="eyebrow" style={{ margin: 0 }}>{eyebrow}</p>
        </div>
        <button className="write-review-trigger-btn" onClick={() => setIsOpen(true)}>
          {t("form", "submit_review_now", "Gửi đánh giá ngay")}
        </button>
      </div>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsOpen(false)}>
              &times;
            </button>
            <ReviewForm destinations={destinations} />
          </div>
        </div>
      )}
    </>
  );
}
