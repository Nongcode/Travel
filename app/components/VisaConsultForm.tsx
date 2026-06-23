"use client";

import { FormEvent, useState } from "react";

type StoredContact = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: "Chưa đọc" | "Đã đọc" | "Đã trả lời";
};

const contactStorageKey = "vietvista-admin-contacts";

export function VisaConsultForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const destination = String(formData.get("destination") || "").trim();
    const travelDate = String(formData.get("travelDate") || "").trim();
    const visaType = String(formData.get("visaType") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const contact: StoredContact = {
      id: Date.now(),
      name,
      email,
      phone,
      subject: `Tư vấn visa du lịch: ${destination || "Chưa chọn điểm đến"}`,
      message: [
        `Loại visa: ${visaType || "Chưa chọn"}`,
        `Điểm đến: ${destination || "Chưa chọn"}`,
        `Thời gian dự kiến: ${travelDate || "Chưa cung cấp"}`,
        message ? `Ghi chú: ${message}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      date: new Date().toISOString().split("T")[0],
      status: "Chưa đọc",
    };

    const saved = window.localStorage.getItem(contactStorageKey);
    const contacts: StoredContact[] = saved ? JSON.parse(saved) : [];
    window.localStorage.setItem(contactStorageKey, JSON.stringify([contact, ...contacts]));

    setSent(true);
    form.reset();
  }

  return (
    <form className="lead-form visa-consult-form" onSubmit={handleSubmit}>
      <label>
        Họ và tên
        <input suppressHydrationWarning name="name" type="text" placeholder="Nguyễn Minh Anh" required />
      </label>
      <div className="visa-form-grid">
        <label>
          Email
          <input suppressHydrationWarning name="email" type="email" placeholder="email@example.com" required />
        </label>
        <label>
          Số điện thoại
          <input suppressHydrationWarning name="phone" type="tel" placeholder="09xx xxx xxx" required />
        </label>
      </div>
      <div className="visa-form-grid">
        <label>
          Quốc gia cần xin visa
          <select suppressHydrationWarning name="destination" defaultValue="" required>
            <option value="" disabled>
              Chọn quốc gia
            </option>
            <option>Hàn Quốc</option>
            <option>Nhật Bản</option>
            <option>Trung Quốc</option>
            <option>Đài Loan</option>
            <option>Châu Âu - Schengen</option>
            <option>Úc</option>
            <option>Canada</option>
            <option>Mỹ</option>
            <option>Quốc gia khác</option>
          </select>
        </label>
        <label>
          Loại visa
          <select suppressHydrationWarning name="visaType" defaultValue="" required>
            <option value="" disabled>
              Chọn nhu cầu
            </option>
            <option>Du lịch tự túc</option>
            <option>Du lịch theo tour</option>
            <option>Thăm thân kết hợp du lịch</option>
            <option>Công tác ngắn ngày</option>
          </select>
        </label>
      </div>
      <label>
        Thời gian dự kiến khởi hành
        <input suppressHydrationWarning name="travelDate" type="month" />
      </label>
      <label>
        Ghi chú hồ sơ
        <textarea
          suppressHydrationWarning
          name="message"
          rows={4}
          placeholder="Số người đi, lịch sử visa, nghề nghiệp, nơi đang sinh sống..."
        />
      </label>
      <button suppressHydrationWarning type="submit">Gửi yêu cầu tư vấn visa</button>
      {sent ? (
        <p className="form-status visa-form-status" role="status">
          Đã ghi nhận thông tin. Quản trị viên có thể xem yêu cầu này trong mục Liên hệ & Tư vấn.
        </p>
      ) : null}
    </form>
  );
}
