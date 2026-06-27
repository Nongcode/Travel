"use client";

import { FormEvent, useState } from "react";

type LeadFormProps = {
  destinations: string[];
};

export function LeadForm({ destinations }: LeadFormProps) {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
    event.currentTarget.reset();
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <label>
        Họ và tên
        <input suppressHydrationWarning name="name" type="text" placeholder="Nguyễn Minh Anh" required />
      </label>
      <label>
        Email hoặc số điện thoại
        <input suppressHydrationWarning
          name="contact"
          type="text"
          placeholder="email@example.com / 09xx xxx xxx"
          required
        />
      </label>
      <label>
        Điểm đến quan tâm
        <select suppressHydrationWarning name="destination" defaultValue="">
          <option value="" disabled>
            Chọn điểm đến
          </option>
          {destinations.map((destination) => (
            <option value={destination} key={destination}>
              {destination}
            </option>
          ))}
        </select>
      </label>
      <label>
        Ghi chú ngắn
        <textarea suppressHydrationWarning
          name="message"
          rows={4}
          placeholder="Thời gian dự kiến, số người, phong cách mong muốn..."
        />
      </label>
      <button suppressHydrationWarning type="submit">Gửi yêu cầu tư vấn</button>
      {sent ? (
        <p className="form-status" role="status">
          Đã ghi nhận thông tin. Đội ngũ tư vấn sẽ liên hệ lại theo kênh bạn đã cung cấp.
        </p>
      ) : null}
    </form>
  );
}
