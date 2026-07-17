"use client";

import { FormEvent, useState } from "react";
import { useI18n } from "./I18nProvider";
import { CustomSelect } from "./CustomSelect";

type LeadFormProps = {
  packages: string[];
  defaultPackage?: string;
};

export function LeadForm({ packages, defaultPackage }: LeadFormProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSent(false);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const tourName = formData.get("tourName") as string;
    const notes = formData.get("notes") as string;

    if (!tourName) {
      setError("Vui lòng chọn gói du lịch.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          tourName,
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSent(true);
        event.currentTarget.reset();
      } else {
        setError(data.error || "Có lỗi xảy ra khi gửi yêu cầu.");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <label>
        {t("form", "name", "Họ và tên")} *
        <input suppressHydrationWarning name="name" type="text" placeholder="Nguyễn Minh Anh" required />
      </label>

      <div className="form-row">
        <label>
          {t("form", "email", "Địa chỉ Email")} *
          <input suppressHydrationWarning name="email" type="email" placeholder="email@example.com" required />
        </label>
        <label>
          {t("form", "phone", "Số điện thoại")} *
          <input suppressHydrationWarning name="phone" type="tel" placeholder="09xx xxx xxx" required />
        </label>
      </div>

      <label>
        {t("form", "package", "Gói du lịch quan tâm")} *
        <CustomSelect
          name="tourName"
          defaultValue={defaultPackage || ""}
          placeholder={t("form", "choose_package", "Chọn gói du lịch")}
          options={packages.map((pkg) => ({ value: pkg, label: pkg }))}
          isMulti={true}
        />
      </label>

      <label>
        {t("form", "message", "Ghi chú ngắn")}
        <textarea
          suppressHydrationWarning
          name="notes"
          rows={4}
          placeholder={t("form", "message_placeholder", "Thời gian dự kiến, số người, phong cách mong muốn...")}
        />
      </label>

      <button suppressHydrationWarning type="submit" disabled={loading}>
        {loading ? "Đang gửi..." : t("form", "submit", "Gửi yêu cầu tư vấn")}
      </button>

      {sent && (
        <p className="form-status success" role="status" style={{ marginTop: "16px" }}>
          {t("form", "success", "Đã ghi nhận thông tin. Đội ngũ tư vấn sẽ liên hệ lại theo kênh bạn đã cung cấp.")}
        </p>
      )}

      {error && (
        <p className="form-status error" role="alert" style={{ marginTop: "16px" }}>
          {error}
        </p>
      )}
    </form>
  );
}

