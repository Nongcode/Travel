"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ScrollProgressIndicatorProps = {
  className: string;
  label: string;
  progress: number;
};

export function useHorizontalScrollProgress<T extends HTMLElement>(active = true) {
  const viewportRef = useRef<T>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [progress, setProgress] = useState(0);

  const updateProgress = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const nextProgress = maxScroll > 1
      ? Math.min(1, Math.max(0, viewport.scrollLeft / maxScroll))
      : 0;

    setHasOverflow(maxScroll > 1);
    setProgress(nextProgress);
  }, []);

  useEffect(() => {
    if (!active) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    const content = viewport.firstElementChild;
    const resizeObserver = new ResizeObserver(updateProgress);

    resizeObserver.observe(viewport);
    if (content) resizeObserver.observe(content);

    viewport.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => {
      resizeObserver.disconnect();
      viewport.removeEventListener("scroll", updateProgress);
    };
  }, [active, updateProgress]);

  return { viewportRef, hasOverflow, progress };
}

export function ScrollProgressIndicator({
  className,
  label,
  progress,
}: ScrollProgressIndicatorProps) {
  return (
    <div
      className={className}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <span style={{ transform: `translateX(${progress * 32}px)` }} />
    </div>
  );
}

