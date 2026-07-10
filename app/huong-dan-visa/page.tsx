import Link from "next/link";
import { headers } from "next/headers";
import { SiteHeader } from "../components/SiteHeader";
import { VisaConsultForm } from "../components/VisaConsultForm";
import { normalizeLocale } from "@/lib/i18n/config";
import { getStaticTranslationMap, translateFromMap } from "@/lib/i18n/server";

const pageCopy = {
  vi: {
    overviewEyebrow: "Tổng quan hồ sơ",
    overviewTitle: "Một bộ hồ sơ tốt cần nhất quán giữa mục đích đi, tài chính và lịch trình.",
    overviewCopy: "Visa du lịch không chỉ là danh sách giấy tờ. Lãnh sự quán thường đánh giá toàn bộ bức tranh: bạn đi đâu, đi trong bao lâu, có đủ chi phí không, và có lý do quay về Việt Nam sau chuyến đi hay không.",
    overviewCta: "Nhận tư vấn hồ sơ",
    timingLabel: "Thời điểm nên chuẩn bị",
    timingValue: "Trước ngày bay 30-60 ngày",
    timingCopy: "Một số quốc gia có mùa cao điểm hoặc yêu cầu lịch hẹn sớm. Chuẩn bị trước giúp bạn có thời gian bổ sung giấy tờ, chỉnh lịch trình và tránh nộp sát ngày.",
    checklistEyebrow: "Checklist cần có",
    checklistTitle: "Giấy tờ thường gặp khi xin visa du lịch",
    processEyebrow: "Quy trình đề xuất",
    processTitle: "4 bước để giảm rủi ro khi nộp visa",
    notesEyebrow: "Lưu ý theo điểm đến",
    notesTitle: "Mỗi quốc gia có trọng tâm xét duyệt khác nhau.",
    consultEyebrow: "Tư vấn visa",
    consultTitle: "Gửi thông tin để nhận tư vấn visa.",
    consultCopy: "Form này sẽ lưu yêu cầu vào mục quản trị Liên hệ & Tư vấn. Đội ngũ VietVista có thể xem tên, email, số điện thoại, điểm đến và ghi chú hồ sơ để phản hồi cho khách hàng.",
    checklist: [
      "Hộ chiếu còn hạn tối thiểu 6 tháng và còn trang trống để dán visa.",
      "Ảnh chân dung đúng kích thước, nền trắng, chụp trong 6 tháng gần nhất.",
      "Tờ khai xin visa theo mẫu của lãnh sự quán hoặc cổng e-visa.",
      "Giấy tờ chứng minh công việc, thu nhập và ràng buộc tại Việt Nam.",
      "Lịch trình du lịch, xác nhận vé máy bay, khách sạn hoặc thư mời nếu có.",
      "Bảo hiểm du lịch, sao kê ngân hàng và giấy tờ bổ sung theo từng quốc gia.",
    ],
    steps: [
      { title: "Xác định loại visa", detail: "Kiểm tra mục đích chuyến đi, số lần nhập cảnh, thời gian lưu trú và quy định riêng của điểm đến." },
      { title: "Rà soát hồ sơ", detail: "Đối chiếu checklist giấy tờ, dịch thuật/công chứng nếu cần và xử lý các điểm yếu trong hồ sơ." },
      { title: "Đặt lịch và nộp hồ sơ", detail: "Nộp online, nộp tại trung tâm tiếp nhận hoặc lãnh sự quán tùy quốc gia và loại thị thực." },
      { title: "Theo dõi kết quả", detail: "Theo dõi trạng thái, bổ sung giấy tờ khi được yêu cầu và chuẩn bị bản in visa trước ngày bay." },
    ],
    notes: [
      { country: "Hàn Quốc, Nhật Bản", note: "Cần hồ sơ tài chính rõ, lịch trình hợp lý và chứng minh công việc ổn định." },
      { country: "Schengen, Úc, Canada", note: "Thường yêu cầu bảo hiểm, lịch trình chi tiết, sao kê ngân hàng và bằng chứng ràng buộc mạnh." },
      { country: "Mỹ", note: "Trọng tâm là tờ khai DS-160, lịch hẹn phỏng vấn và khả năng giải trình mục đích chuyến đi." },
    ],
  },
  en: {
    overviewEyebrow: "File overview",
    overviewTitle: "A strong file needs consistency between travel purpose, finances, and itinerary.",
    overviewCopy: "A travel visa is more than a checklist. Consulates often review the full picture: where you go, how long you stay, whether you can cover the cost, and why you will return after the trip.",
    overviewCta: "Get file advice",
    timingLabel: "Best time to prepare",
    timingValue: "30-60 days before departure",
    timingCopy: "Some countries have peak seasons or early appointment requirements. Preparing ahead gives you time to add documents, adjust the itinerary, and avoid last-minute submission.",
    checklistEyebrow: "Required checklist",
    checklistTitle: "Common documents for travel visa applications",
    processEyebrow: "Suggested process",
    processTitle: "4 steps to reduce visa submission risk",
    notesEyebrow: "Notes by destination",
    notesTitle: "Each country reviews different priorities.",
    consultEyebrow: "Visa consultation",
    consultTitle: "Send your information to receive visa advice.",
    consultCopy: "This form stores the request in the admin Contact & Consultation area. VietVista can review the name, email, phone, destination, and file notes to respond to the customer.",
    checklist: [
      "Passport valid for at least 6 months with blank pages for visa stamps.",
      "Portrait photo in the required size, white background, taken within the last 6 months.",
      "Visa application form from the consulate or e-visa portal.",
      "Documents proving employment, income, and ties in Vietnam.",
      "Travel itinerary, flight confirmation, hotel booking, or invitation letter if available.",
      "Travel insurance, bank statements, and additional documents required by each country.",
    ],
    steps: [
      { title: "Identify visa type", detail: "Check the travel purpose, entry count, length of stay, and destination-specific rules." },
      { title: "Review the file", detail: "Compare documents with the checklist, translate/notarize when needed, and address weak points." },
      { title: "Book and submit", detail: "Submit online, at a visa center, or at the consulate depending on country and visa type." },
      { title: "Track the result", detail: "Monitor status, add documents when requested, and prepare printed visa copies before departure." },
    ],
    notes: [
      { country: "South Korea, Japan", note: "Requires clear financial documents, a reasonable itinerary, and stable employment proof." },
      { country: "Schengen, Australia, Canada", note: "Often requires insurance, detailed itinerary, bank statements, and strong evidence of ties." },
      { country: "United States", note: "Focuses on DS-160, interview appointment, and ability to explain travel purpose." },
    ],
  },
  "zh-CN": {
    overviewEyebrow: "材料概览",
    overviewTitle: "一份好的材料需要让出行目的、财务和行程保持一致。",
    overviewCopy: "旅游签证不只是材料清单。领馆通常会评估整体情况：你去哪里、停留多久、是否有足够费用，以及旅行后是否有理由返回越南。",
    overviewCta: "获取材料咨询",
    timingLabel: "建议准备时间",
    timingValue: "出发前 30-60 天",
    timingCopy: "部分国家有旺季或提前预约要求。提前准备可以留出补充材料、调整行程和避免临近提交的时间。",
    checklistEyebrow: "所需清单",
    checklistTitle: "申请旅游签证常见材料",
    processEyebrow: "建议流程",
    processTitle: "降低签证提交风险的 4 个步骤",
    notesEyebrow: "按目的地注意事项",
    notesTitle: "每个国家的审核重点不同。",
    consultEyebrow: "签证咨询",
    consultTitle: "提交信息以获取签证咨询。",
    consultCopy: "此表单会把请求保存到后台的联系与咨询模块。VietVista 团队可查看姓名、邮箱、电话、目的地和材料备注以便回复客户。",
    checklist: [
      "护照有效期至少 6 个月，并有空白签证页。",
      "符合尺寸要求的白底近 6 个月证件照。",
      "领馆或电子签证平台要求的签证申请表。",
      "证明工作、收入和在越南约束力的材料。",
      "旅行行程、机票确认、酒店预订或邀请函（如有）。",
      "旅行保险、银行流水以及各国要求的补充材料。",
    ],
    steps: [
      { title: "确认签证类型", detail: "检查出行目的、入境次数、停留时间以及目的地的具体规定。" },
      { title: "审核材料", detail: "对照清单检查材料，需要时翻译/公证，并处理材料中的薄弱点。" },
      { title: "预约并提交", detail: "根据国家和签证类型在线提交、到签证中心或领馆提交。" },
      { title: "跟进结果", detail: "跟踪状态，按要求补充材料，并在出发前准备签证打印件。" },
    ],
    notes: [
      { country: "韩国、日本", note: "需要清晰的财务材料、合理行程和稳定工作证明。" },
      { country: "申根、澳大利亚、加拿大", note: "通常需要保险、详细行程、银行流水和有力约束证明。" },
      { country: "美国", note: "重点是 DS-160 表、面试预约以及解释出行目的的能力。" },
    ],
  },
};

export default async function VisaGuidePage() {
  const locale = normalizeLocale((await headers()).get("x-locale"));
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);
  const copy = pageCopy[locale] || pageCopy.vi;

  return (
    <main>
      <SiteHeader variant="hero" />

      <section className="page-hero visa-hero">
        <p className="eyebrow">{t("visa", "hero_eyebrow", "Hướng dẫn làm visa du lịch")}</p>
        <h1>{t("visa", "hero_title", "Chuẩn bị hồ sơ visa rõ ràng trước khi lên đường.")}</h1>
        <p>{t("visa", "hero_copy", "Tổng hợp giấy tờ, quy trình và lưu ý quan trọng khi xin visa du lịch. Nếu hồ sơ của bạn có điểm cần kiểm tra, hãy gửi thông tin để VietVista tư vấn hướng xử lý phù hợp.")}</p>
      </section>

      <section className="visa-overview">
        <div className="visa-overview-copy">
          <p className="eyebrow">{copy.overviewEyebrow}</p>
          <h2>{copy.overviewTitle}</h2>
          <p>{copy.overviewCopy}</p>
          <Link href="#visa-consult">{copy.overviewCta}</Link>
        </div>
        <div className="visa-overview-panel">
          <span>{copy.timingLabel}</span>
          <strong>{copy.timingValue}</strong>
          <p>{copy.timingCopy}</p>
        </div>
      </section>

      <section className="visa-section">
        <div className="section-heading compact">
          <p className="eyebrow">{copy.checklistEyebrow}</p>
          <h2>{copy.checklistTitle}</h2>
        </div>
        <div className="visa-checklist">
          {copy.checklist.map((item) => (
            <article key={item}>
              <span aria-hidden="true">✓</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="visa-process-band">
        <div className="visa-process-heading">
          <p className="eyebrow">{copy.processEyebrow}</p>
          <h2>{copy.processTitle}</h2>
        </div>
        <div className="visa-step-grid">
          {copy.steps.map((step, index) => (
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
          <p className="eyebrow">{copy.notesEyebrow}</p>
          <h2>{copy.notesTitle}</h2>
        </div>
        <div className="visa-note-list">
          {copy.notes.map((item) => (
            <article key={item.country}>
              <h3>{item.country}</h3>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="visa-consult-section" id="visa-consult">
        <div className="visa-consult-copy">
          <p className="eyebrow">{copy.consultEyebrow}</p>
          <h2>{copy.consultTitle}</h2>
          <p>{copy.consultCopy}</p>
        </div>
        <VisaConsultForm />
      </section>
    </main>
  );
}
