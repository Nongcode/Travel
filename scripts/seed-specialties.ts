import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const specialtiesData = [
  {
    name: "Nem chua Thanh Hóa",
    slug: "nem-chua-thanh-hoa",
    type: "FOOD",
    description: "Đặc sản trứ danh của xứ Thanh với vị chua dịu, cay nồng và giòn sần sật của bì lợn.",
    imageUrl: "https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&q=80&w=800",
    priceText: "45.000đ - 60.000đ/chục",
    whereToBuy: "Cơ sở Cây Đa, Cơ sở Thắng Tuyến (Thanh Hóa)",
    status: "Hiển thị",
    detail: {
      create: {
        bannerImageUrl: "https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&q=80&w=1600",
        overview: "Nem chua Thanh Hóa là món ăn truyền thống không thể thiếu trong các dịp lễ Tết, mang hương vị đặc trưng của vùng đất Bắc Trung Bộ.",
        history: "Nghề làm nem chua ở Thanh Hóa đã có từ rất lâu đời, truyền từ thế hệ này sang thế hệ khác...",
        ingredients: "Thịt nạc vai, bì lợn, tỏi, ớt, lá đinh lăng, thính gạo...",
        howToUse: "Ăn trực tiếp, chấm với tương ớt. Rất hợp dùng làm mồi nhậu.",
        preservation: "Bảo quản ở nhiệt độ phòng từ 2-3 ngày, hoặc ngăn mát tủ lạnh từ 5-7 ngày.",
      }
    }
  },
  {
    name: "Chả mực Hạ Long",
    slug: "cha-muc-ha-long",
    type: "FOOD",
    description: "Chả mực giã tay chuẩn vị Hạ Long, dai ngon sần sật.",
    imageUrl: "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&q=80&w=800",
    priceText: "350.000đ - 450.000đ/kg",
    whereToBuy: "Chợ Cái Dăm, Chợ Hạ Long 1",
    status: "Hiển thị",
    detail: {
      create: {
        bannerImageUrl: "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&q=80&w=1600",
        overview: "Chả mực Hạ Long là một trong những món ăn ngon nhất Việt Nam, được chế biến từ mực nang tươi rói đánh bắt tại vùng biển Vịnh Hạ Long.",
        history: "Món ăn xuất hiện từ những năm 1940 tại Hòn Gai, Hạ Long, và trở thành đặc sản nức tiếng cả nước.",
        ingredients: "Mực nang tươi, mỡ khổ, hành tỏi, tiêu, nước mắm mặn...",
        howToUse: "Chiên vàng ăn cùng xôi trắng, bánh cuốn hoặc cơm nóng.",
        preservation: "Bảo quản ngăn đá tủ lạnh lên tới 6 tháng.",
      }
    }
  },
  {
    name: "Nón lá bài thơ Huế",
    slug: "non-la-bai-tho-hue",
    type: "HANDICRAFT",
    description: "Chiếc nón lá đặc trưng của xứ Huế, mỏng manh và tinh tế với những bài thơ được ép ẩn bên trong.",
    imageUrl: "https://images.unsplash.com/photo-1542640244-7e672d62ea83?auto=format&fit=crop&q=80&w=800",
    priceText: "80.000đ - 150.000đ/chiếc",
    whereToBuy: "Chợ Đông Ba, Làng nghề nón Tây Hồ",
    status: "Hiển thị",
    detail: {
      create: {
        bannerImageUrl: "https://images.unsplash.com/photo-1542640244-7e672d62ea83?auto=format&fit=crop&q=80&w=1600",
        overview: "Nón lá bài thơ là biểu tượng văn hóa của người phụ nữ Huế, mang vẻ đẹp dịu dàng, e ấp.",
        history: "Làng nghề làm nón Tây Hồ có lịch sử hàng trăm năm, nơi ra đời của chiếc nón lá bài thơ nổi tiếng.",
        ingredients: "Lá gội, chỉ cước, khung tre trúc, giấy gió...",
        howToUse: "Đội che nắng, che mưa, hoặc làm quà lưu niệm, trang trí.",
        preservation: "Bảo quản nơi khô ráo, tránh vật nặng đè lên làm gãy vành nón.",
      }
    }
  },
  {
    name: "Lụa Hà Đông",
    slug: "lua-ha-dong",
    type: "HANDICRAFT",
    description: "Sản phẩm lụa tơ tằm dệt thủ công tinh xảo, mềm mại và sang trọng từ làng lụa Vạn Phúc.",
    imageUrl: "https://images.unsplash.com/photo-1584346083040-f1c5d9a9baee?auto=format&fit=crop&q=80&w=800",
    priceText: "250.000đ - 1.500.000đ/mét",
    whereToBuy: "Làng lụa Vạn Phúc, Hà Đông",
    status: "Hiển thị",
    detail: {
      create: {
        bannerImageUrl: "https://images.unsplash.com/photo-1584346083040-f1c5d9a9baee?auto=format&fit=crop&q=80&w=1600",
        overview: "Lụa Vạn Phúc (Hà Đông) từ lâu đã nổi tiếng với độ mềm, mỏng, nhẹ và thoáng mát, hoa văn trang trí đa dạng, sắc nét.",
        history: "Làng lụa Vạn Phúc đã có tuổi đời hơn 1000 năm, từng là nơi cung cấp lụa cho hoàng triều nhà Nguyễn.",
        ingredients: "100% tơ tằm tự nhiên, nhuộm màu thủ công...",
        howToUse: "May áo dài, váy lụa, khăn quàng cổ, quà tặng cao cấp.",
        preservation: "Giặt tay bằng nước lạnh với dầu gội hoặc sữa tắm, phơi trong bóng râm.",
      }
    }
  }
];

async function main() {
  await prisma.localSpecialtyDetail.deleteMany({});
  await prisma.localSpecialty.deleteMany({});
  console.log("Deleted old data");

  for (const item of specialtiesData) {
    await prisma.localSpecialty.create({ data: item });
    console.log(`Created: ${item.name}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
