"use client";

import { FormEvent, useState } from "react";
import { useI18n } from "./I18nProvider";

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

const visaFormCopy = {
  vi: {
    email: "Email",
    phone: "Số điện thoại",
    country: "Quốc gia cần xin visa",
    chooseCountry: "Chọn quốc gia",
    visaType: "Loại visa",
    chooseNeed: "Chọn nhu cầu",
    travelDate: "Thời gian dự kiến khởi hành",
    fileNote: "Ghi chú hồ sơ",
    filePlaceholder: "Số người đi, lịch sử visa, nghề nghiệp, nơi đang sinh sống...",
    submit: "Gửi yêu cầu tư vấn visa",
    success: "Đã ghi nhận thông tin. Quản trị viên có thể xem yêu cầu này trong mục Liên hệ & Tư vấn.",
    countries: ["Hàn Quốc", "Nhật Bản", "Trung Quốc", "Đài Loan", "Châu Âu - Schengen", "Úc", "Canada", "Mỹ", "Quốc gia khác"],
    types: ["Du lịch tự túc", "Du lịch theo tour", "Thăm thân kết hợp du lịch", "Công tác ngắn ngày"],
  },
  en: {
    email: "Email",
    phone: "Phone number",
    country: "Visa destination country",
    chooseCountry: "Choose a country",
    visaType: "Visa type",
    chooseNeed: "Choose a need",
    travelDate: "Expected departure time",
    fileNote: "File notes",
    filePlaceholder: "Number of travelers, visa history, occupation, current residence...",
    submit: "Send visa consultation request",
    success: "Your information has been received. Admins can view this request in Contact & Consultation.",
    countries: ["South Korea", "Japan", "China", "Taiwan", "Europe - Schengen", "Australia", "Canada", "United States", "Other country"],
    types: ["Independent travel", "Tour travel", "Family visit with travel", "Short business trip"],
  },
  "zh-CN": {
    email: "邮箱",
    phone: "电话号码",
    country: "签证目的地国家",
    chooseCountry: "选择国家",
    visaType: "签证类型",
    chooseNeed: "选择需求",
    travelDate: "预计出发时间",
    fileNote: "材料备注",
    filePlaceholder: "出行人数、签证记录、职业、现居地...",
    submit: "发送签证咨询请求",
    success: "已收到你的信息。管理员可在联系与咨询模块查看此请求。",
    countries: ["韩国", "日本", "中国", "台湾", "欧洲 - 申根", "澳大利亚", "加拿大", "美国", "其他国家"],
    types: ["自由行", "跟团游", "探亲结合旅游", "短期商务"],
  },
};

export function VisaConsultForm() {
  const { locale, t } = useI18n();
  const copy = visaFormCopy[locale as keyof typeof visaFormCopy] || visaFormCopy.vi;
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
        {t("form", "name", "Họ và tên")}
        <input suppressHydrationWarning name="name" type="text" placeholder="Nguyễn Minh Anh" required />
      </label>
      <div className="visa-form-grid">
        <label>
          {copy.email}
          <input suppressHydrationWarning name="email" type="email" placeholder="email@example.com" required />
        </label>
        <label>
          {copy.phone}
          <input suppressHydrationWarning name="phone" type="tel" placeholder="09xx xxx xxx" required />
        </label>
      </div>
      <div className="visa-form-grid">
        <label>
          {copy.country}
          <select suppressHydrationWarning name="destination" defaultValue="" required>
            <option value="" disabled>
              {copy.chooseCountry}
            </option>
            {copy.countries.map((country) => (
              <option key={country}>{country}</option>
            ))}
          </select>
        </label>
        <label>
          {copy.visaType}
          <select suppressHydrationWarning name="visaType" defaultValue="" required>
            <option value="" disabled>
              {copy.chooseNeed}
            </option>
            {copy.types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        {copy.travelDate}
        <input suppressHydrationWarning name="travelDate" type="month" />
      </label>
      <label>
        {copy.fileNote}
        <textarea suppressHydrationWarning name="message" rows={4} placeholder={copy.filePlaceholder} />
      </label>
      <button suppressHydrationWarning type="submit">{copy.submit}</button>
      {sent ? (
        <p className="form-status visa-form-status" role="status">
          {copy.success}
        </p>
      ) : null}
    </form>
  );
}
