"use client";

import { useState } from "react";

type PackageDetailGalleryProps = {
  images: string[];
  title: string;
};

export function PackageDetailGallery({
  images,
  title,
}: PackageDetailGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const selectImage = (index: number) => {
    setActiveIndex(index);
  };

  const showPrevious = () => {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const showNext = () => {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  return (
    <div className="detail-gallery-shell" aria-label={`Bộ sưu tập ảnh của ${title}`}>
      <div
        className="detail-gallery-main"
        style={{ backgroundImage: `url(${images[activeIndex]})` }}
      >
        <div className="detail-gallery-status">
          <span>{String(activeIndex + 1).padStart(2, "0")}</span>
          <small>/ {String(images.length).padStart(2, "0")}</small>
        </div>
      </div>

      <div className="detail-gallery-strip">
        <button
          type="button"
          className="gallery-nav prev"
          aria-label="Ảnh trước"
          onClick={showPrevious}
        />

        <div className="detail-gallery-thumbs">
          {images.map((image, index) => (
            <button
              type="button"
              key={`${image}-${index}`}
              className={`detail-gallery-thumb${index === activeIndex ? " active" : ""}`}
              style={{ backgroundImage: `url(${image})` }}
              aria-label={`Chọn ảnh ${index + 1}`}
              aria-pressed={index === activeIndex}
              onClick={() => selectImage(index)}
            >
              <span className="sr-only">Ảnh {index + 1}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="gallery-nav next"
          aria-label="Ảnh tiếp theo"
          onClick={showNext}
        />
      </div>
    </div>
  );
}
