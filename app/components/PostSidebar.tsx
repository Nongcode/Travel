"use client";

import { useEffect, useState } from "react";

type HeadingItem = {
  id: string;
  text: string;
};

type PostSidebarProps = {
  headings: HeadingItem[];
  title: string;
};

export function PostSidebar({ headings, title }: PostSidebarProps) {
  const [activeId, setActiveId] = useState("");
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => {
      headings.forEach((heading) => {
        const el = document.getElementById(heading.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [headings]);

  const copyToClipboard = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareClick = (e: React.MouseEvent<HTMLAnchorElement>, platform: string) => {
    // Standard open share in new window popup
    e.preventDefault();
    const url = e.currentTarget.href;
    window.open(url, `share-${platform}`, "width=600,height=400,status=no,toolbar=no");
  };

  return (
    <aside className="post-sidebar">
      {/* Share panel */}
      <div className="share-panel">
        <span className="share-title">Chia sẻ bài viết</span>
        <div className="share-buttons">
          <button
            onClick={copyToClipboard}
            className={`share-btn copy-btn ${copied ? "copied" : ""}`}
            title="Sao chép liên kết"
            aria-label="Sao chép liên kết bài viết"
          >
            <span className="btn-icon">📋</span>
            <span className="btn-text">{copied ? "Đã sao chép!" : "Copy Link"}</span>
          </button>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
            onClick={(e) => handleShareClick(e, "facebook")}
            className="share-btn fb-btn"
            title="Chia sẻ Facebook"
            aria-label="Chia sẻ Facebook"
          >
            <span className="btn-icon">📘</span>
            <span className="btn-text">Facebook</span>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`}
            onClick={(e) => handleShareClick(e, "twitter")}
            className="share-btn tw-btn"
            title="Chia sẻ Twitter"
            aria-label="Chia sẻ Twitter"
          >
            <span className="btn-icon">🐦</span>
            <span className="btn-text">Twitter</span>
          </a>
        </div>
      </div>

      {/* Table of contents */}
      {headings.length > 0 && (
        <nav className="table-of-contents">
          <span className="toc-title">Mục lục bài viết</span>
          <ul>
            {headings.map((heading) => (
              <li key={heading.id} className={activeId === heading.id ? "active" : ""}>
                <a href={`#${heading.id}`}>{heading.text}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </aside>
  );
}
