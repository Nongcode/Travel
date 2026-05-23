import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { VisaConsultForm } from "../components/VisaConsultForm";

const checklist = [
  "Hộ chiếu còn hạn tối thiểu 6 tháng và còn trang trống để dán visa.",
  "Ảnh chân dung đúng kích thước, nền trắng, chụp trong 6 tháng gần nhất.",
  "Tờ khai xin visa theo mẫu của lãnh sự quán hoặc cổng e-visa.",
  "Giấy tờ chứng minh công việc, thu nhập và ràng buộc tại Việt Nam.",
  "Lịch trình du lịch, xác nhận vé máy bay, khách sạn hoặc thư mời nếu có.",
  "Bảo hiểm du lịch, sao kê ngân hàng và giấy tờ bổ sung theo từng quốc gia.",
];

const visaSteps = [
  {
    title: "Xác định loại visa",
    detail: "Kiểm tra mục đích chuyến đi, số lần nhập cảnh, thời gian lưu trú và quy định riêng của điểm đến.",
  },
  {
    title: "Rà soát hồ sơ",
    detail: "Đối chiếu checklist giấy tờ, dịch thuật/công chứng nếu cần và xử lý các điểm yếu trong hồ sơ.",
  },
  {
    title: "Đặt lịch và nộp hồ sơ",
    detail: "Nộp online, nộp tại trung tâm tiếp nhận hoặc lãnh sự quán tùy quốc gia và loại thị thực.",
  },
  {
    title: "Theo dõi kết quả",
    detail: "Theo dõi trạng thái, bổ sung giấy tờ khi được yêu cầu và chuẩn bị bản in visa trước ngày bay.",
  },
];

const countryNotes = [
  {
    country: "Hàn Quốc, Nhật Bản",
    note: "Cần hồ sơ tài chính rõ, lịch trình hợp lý và chứng minh công việc ổn định.",
  },
  {
    country: "Schengen, Úc, Canada",
    note: "Thường yêu cầu bảo hiểm, lịch trình chi tiết, sao kê ngân hàng và bằng chứng ràng buộc mạnh.",
  },
  {
    country: "Mỹ",
    note: "Trọng tâm là tờ khai DS-160, lịch hẹn phỏng vấn và khả năng giải trình mục đích chuyến đi.",
  },
];

export default function VisaGuidePage() {
  return (
    <main>
      <SiteHeader variant="hero" />

      <section className="page-hero visa-hero">
        <p className="eyebrow">Hướng dẫn làm visa du lịch</p>
        <h1>Chuẩn bị hồ sơ visa rõ ràng trước khi lên đường.</h1>
        <p>
          Tổng hợp giấy tờ, quy trình và lưu ý quan trọng khi xin visa du lịch. Nếu hồ sơ của bạn có điểm cần kiểm tra,
          hãy gửi thông tin để VietVista tư vấn hướng xử lý phù hợp.
        </p>
      </section>

      <section className="visa-overview">
        <div className="visa-overview-copy">
          <p className="eyebrow">Tổng quan hồ sơ</p>
          <h2>Một bộ hồ sơ tốt cần nhất quán giữa mục đích đi, tài chính và lịch trình.</h2>
          <p>
            Visa du lịch không chỉ là danh sách giấy tờ. Lãnh sự quán thường đánh giá toàn bộ bức tranh: bạn đi đâu,
            đi trong bao lâu, có đủ chi phí không, và có lý do quay về Việt Nam sau chuyến đi hay không.
          </p>
          <Link href="#visa-consult">Nhận tư vấn hồ sơ</Link>
        </div>
        <div className="visa-overview-panel">
          <span>Thời điểm nên chuẩn bị</span>
          <strong>Trước ngày bay 30-60 ngày</strong>
          <p>
            Một số quốc gia có mùa cao điểm hoặc yêu cầu lịch hẹn sớm. Chuẩn bị trước giúp bạn có thời gian bổ sung giấy
            tờ, chỉnh lịch trình và tránh nộp sát ngày.
          </p>
        </div>
      </section>

      <section className="visa-section">
        <div className="section-heading compact">
          <p className="eyebrow">Checklist cần có</p>
          <h2>Giấy tờ thường gặp khi xin visa du lịch</h2>
        </div>
        <div className="visa-checklist">
          {checklist.map((item) => (
            <article key={item}>
              <span aria-hidden="true">✓</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="visa-process-band">
        <div className="visa-process-heading">
          <p className="eyebrow">Quy trình đề xuất</p>
          <h2>4 bước để giảm rủi ro khi nộp visa</h2>
        </div>
        <div className="visa-step-grid">
          {visaSteps.map((step, index) => (
            <article key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="visa-country-notes">
        <div>
          <p className="eyebrow">Lưu ý theo điểm đến</p>
          <h2>Mỗi quốc gia có trọng tâm xét duyệt khác nhau.</h2>
        </div>
        <div className="visa-note-list">
          {countryNotes.map((item) => (
            <article key={item.country}>
              <h3>{item.country}</h3>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="visa-consult-section" id="visa-consult">
        <div className="visa-consult-copy">
          <p className="eyebrow">Tư vấn visa</p>
          <h2>Gửi thông tin để nhận tư vấn visa.</h2>
          <p>
            Form này sẽ lưu yêu cầu vào mục quản trị Liên hệ & Tư vấn. Đội ngũ VietVista có thể xem tên, email, số điện
            thoại, điểm đến và ghi chú hồ sơ để phản hồi cho khách hàng.
          </p>
        </div>
        <VisaConsultForm />
      </section>
    </main>
  );
}
