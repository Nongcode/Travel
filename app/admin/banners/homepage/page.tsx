import BannerManagerPage from "../BannerManagerPage";

export default function HomepageBannersPage() {
  return (
    <BannerManagerPage
      bannerType="homepage"
      heading="Quản lý Banner Trang chủ"
      modalTitle="Thêm Banner Trang chủ"
      description="Thiết lập ảnh hoặc video hero xuất hiện ở đầu trang chủ TimesGreen."
      mediaPlaceholder="Ví dụ: /Drone_flight_Vietnam_landscapes_202606220932.mp4"
    />
  );
}
