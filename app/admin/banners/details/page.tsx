import BannerManagerPage from "../BannerManagerPage";

export default function DetailBannersPage() {
  return (
    <BannerManagerPage
      bannerType="detail"
      heading="Quản lý Banner Chi tiết"
      modalTitle="Thêm Banner Chi tiết"
      description="Banner dùng cho từng trang chi tiết cụ thể, ví dụ một gói tour Hạ Long hoặc một bài viết riêng."
      mediaPlaceholder="Ví dụ: /ha-long-detail.jpg hoặc /banners/ha-long-video.mp4"
      linkColumnLabel="URL chi tiết áp dụng"
      linkLabel="URL chi tiết áp dụng"
      linkPlaceholder="Ví dụ: /goi-du-lich/ha-long-gia-dinh-du-thuyen"
      linkHelp="Nhập đúng URL chi tiết theo slug, ví dụ /goi-du-lich/{slug} hoặc /tin-tuc/{id}."
    />
  );
}
