"use client";

import { useState, FormEvent } from "react";
import { useI18n } from "./I18nProvider";
import { CustomSelect } from "./CustomSelect";

type ReviewFormProps = {
  destinations: string[];
};

export function ReviewForm({ destinations }: ReviewFormProps) {
  const { t } = useI18n();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const packageName = formData.get("packageName") as string;
    const comment = formData.get("comment") as string;

    if (!packageName) {
      setError("Vui lòng chọn hành trình đã trải nghiệm.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          packageName,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        event.currentTarget.reset();
        setRating(5);
        // Force reload page to show the new review immediately
        window.location.reload();
      } else {
        setError(data.error || "Có lỗi xảy ra khi gửi đánh giá.");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="review-form-container">
      <div className="review-form-header">
        <h3>{t("reviews", "form_title", "Chia sẻ trải nghiệm của bạn")}</h3>
        <p>{t("reviews", "form_subtitle", "Những đóng góp của bạn sẽ giúp TimesGreen nâng cao chất lượng dịch vụ tốt hơn mỗi ngày.")}</p>
      </div>

      <form className="review-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            {t("form", "name", "Họ và tên")} *
            <input name="name" type="text" placeholder="Nguyễn Văn A" required />
          </label>
          <label>
            {t("form", "email", "Địa chỉ Email")} *
            <input name="email" type="email" placeholder="nguyenvana@gmail.com" required />
          </label>
        </div>

        <div className="form-row">
          <label>
            {t("form", "phone", "Số điện thoại")} *
            <input name="phone" type="tel" placeholder="09xx xxx xxx" required />
          </label>
          <label>
            {t("form", "destination", "Tour đã trải nghiệm")} *
            <CustomSelect
              name="packageName"
              defaultValue=""
              placeholder={t("form", "choose_destination", "Chọn hành trình")}
              options={destinations.map((dest) => ({ value: dest, label: dest }))}
            />
          </label>
        </div>

        <div className="rating-selector-group">
          <span className="rating-label">{t("form", "rating", "Đánh giá chất lượng dịch vụ")} *</span>
          <div className="stars-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className={`star-btn ${star <= (hoverRating || rating) ? "filled" : "empty"}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </button>
            ))}
            <span className="rating-text">
              {rating === 5 && "Tuyệt vời (5/5)"}
              {rating === 4 && "Rất tốt (4/5)"}
              {rating === 3 && "Bình thường (3/5)"}
              {rating === 2 && "Kém (2/5)"}
              {rating === 1 && "Tệ (1/5)"}
            </span>
          </div>
        </div>

        <label className="textarea-label">
          {t("form", "comment", "Lời nhận xét của bạn")} *
          <textarea
            name="comment"
            rows={4}
            placeholder={t("form", "comment_placeholder", "Cảm nhận của bạn về hướng dẫn viên, lịch trình, chỗ ở...")}
            required
          />
        </label>

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? "Đang gửi..." : t("form", "submit_review", "Gửi đánh giá ngay")}
        </button>

        {success && (
          <p className="form-status success" role="status">
            {t("form", "review_success", "Cảm ơn bạn! Đánh giá đã được ghi nhận và hiển thị lên hệ thống.")}
          </p>
        )}

        {error && (
          <p className="form-status error" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
