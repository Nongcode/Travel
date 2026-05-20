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
          <p className="eyebrow">Lien he tu van</p>
          <h1>Bat dau chuyen di bang mot cuoc tro chuyen ro rang.</h1>
          <p>
            Cho VietVista biet diem den, thoi gian du kien va phong cach chuyen
            di ban mong muon. Chung toi se lien he lai de goi y lich trinh phu
            hop, khong yeu cau thanh toan truc tuyen.
          </p>
        </div>
      </section>

      <section className="contact-info-band">
        <article>
          <span>01</span>
          <h2>Phan hoi trong 24h</h2>
          <p>Doi ngu tu van se lien he qua email hoac so dien thoai ban de lai.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Lich trinh linh hoat</h2>
          <p>Goi y co the dieu chinh theo so nguoi, ngan sach va nhip nghi mong muon.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Khong thanh toan online</h2>
          <p>Website chi thu thap thong tin lien he de tu van va xac nhan nhu cau.</p>
        </article>
      </section>

      <section className="contact-form-section">
        <div className="contact-form-wrapper">
          <div className="contact-form-header">
            <h2>Gui yeu cau tu van hanh trinh</h2>
            <p>
              Hay dien thong tin cua ban duoi day. Cac chuyen gia hanh trinh cua
              chung toi se lien he tu van va thiet ke lich trinh mien phi trong
              vong 24 gio.
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
