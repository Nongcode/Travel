import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding sample Local Specialties...");

  // CREATE
  const s1 = await prisma.localSpecialty.create({
    data: {
      name: "Nem chua Thanh Hóa",
      slug: "nem-chua-thanh-hoa",
      type: "FOOD",
      description: "Đặc sản trứ danh của xứ Thanh với vị chua thanh, cay nhẹ của tiêu tỏi.",
      priceText: "40.000đ - 60.000đ/chục",
      whereToBuy: "Cơ sở Nem chua Cây Đa, TP Thanh Hóa",
      status: "Hiển thị",
      destination: {
        connectOrCreate: {
          where: { name: "Thanh Hóa" },
          create: { name: "Thanh Hóa", slug: "thanh-hoa" }
        }
      }
    }
  });
  console.log("Created:", s1.name);

  const s2 = await prisma.localSpecialty.create({
    data: {
      name: "Lụa Vạn Phúc",
      slug: "lua-van-phuc",
      type: "HANDICRAFT",
      description: "Lụa tơ tằm dệt thủ công tinh xảo, mềm mại, thoáng mát.",
      priceText: "Từ 200.000đ/m",
      whereToBuy: "Làng lụa Vạn Phúc, Hà Đông, Hà Nội",
      status: "Hiển thị",
      destination: {
        connectOrCreate: {
          where: { name: "Hà Nội" },
          create: { name: "Hà Nội", slug: "ha-noi" }
        }
      }
    }
  });
  console.log("Created:", s2.name);

  // EDIT
  const updatedS1 = await prisma.localSpecialty.update({
    where: { id: s1.id },
    data: { priceText: "45.000đ - 65.000đ/chục (Giá mới cập nhật)" }
  });
  console.log("Updated price for:", updatedS1.name);

  // DELETE
  // Create a dummy one to delete
  const s3 = await prisma.localSpecialty.create({
    data: {
      name: "Sản phẩm test xóa",
      slug: "san-pham-test-xoa",
      type: "FOOD",
      status: "Ẩn"
    }
  });
  console.log("Created dummy product for deletion:", s3.name);
  
  await prisma.localSpecialty.delete({
    where: { id: s3.id }
  });
  console.log("Deleted dummy product successfully.");

  console.log("Test completed successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
