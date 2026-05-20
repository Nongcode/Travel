import Image from "next/image";
import { LeadForm } from "../components/LeadForm";
import { SiteHeader } from "../components/SiteHeader";
import { destinations } from "../data/travel";

export default function ContactPage() {
  return (
    <main>
      <SiteHeader variant="hero" />

      <section className="contact-hero">
        <div className="contact-hero-copy">
          <p className="eyebrow">Liên hệ tư vấn</p>
          <h1>Bắt đầu chuyến đi của bạn ngay từ bây giờ nhé!.</h1>
          <p>
            Cho VietVista biết điểm đến, thời gian du lịch và phong cách chuyến đi
            bạn mong muốn. Chúng tôi sẽ liên hệ lại để gợi ý lịch trình phù hợp,
            không yêu cầu thanh toán trực tuyến.
          </p>
        </div>
      </section>

      <section className="contact-info-band">
        <article>
          <span>01</span>
          <h2>Phản hồi trong 24h</h2>
          <p>Đội ngũ tư vấn sẽ liên hệ qua email hoặc số điện thoại bạn để lại.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Lịch trình linh hoạt</h2>
          <p>Khuyến nghị có thể điều chỉnh theo số người, ngân sách và nhịp nghỉ mong muốn.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Không cần thanh toán online</h2>
          <p>Website chỉ thu thập thông tin liên hệ để tư vấn và xác nhận nhu cầu.</p>
        </article>
      </section>

      <section className="contact-form-section">
        <div className="contact-form-wrapper">
          <div className="contact-form-header">
            <h2>Gửi yêu cầu tư vấn hành trình</h2>
            <p>
              Hãy điền thông tin dưới đây. 
              Các chuyên gia hành trình của VietVista sẽ 
              liên hệ lại để gợi ý lịch trình phù hợp với nhu cầu thực tế của bạn.
            </p>
          </div>

          <div className="contact-form-content">
            <div className="contact-form-container">
              <LeadForm destinations={destinations} />
            </div>

            <div className="contact-form-image">
              <Image
                src="/vietnam-map-light.png"
                alt="Ban do diem den VietVista"
                width={720}
                height={720}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
