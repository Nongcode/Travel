const fs = require('fs');
const path = require('path');

const roots = ["app/admin", "app/components/admin", "app/api/admin"];
const extensions = new Set([".ts", ".tsx"]);

const replacements = {
  "Chá»  xá»­ lÃ½": "Chờ xử lý",
  "Ä ang xá»­ lÃ½": "Đang xử lý",
  "Ä Ã£ xÃ¡c nháº­n": "Đã xác nhận",
  "Ä Ã£ há»§y": "Đã hủy",
  "HoÃ n táº¥t": "Hoàn tất",
  "Hiá»ƒn thá»‹": "Hiển thị",
  "áº¨n": "Ẩn",
  "Hoáº¡t Ä‘á»™ng": "Hoạt động",
  "KhÃ³a": "Khóa",
  "Vá»‹nh Háº¡ Long": "Vịnh Hạ Long",
  "Ä Ã  Náºµng - Há»™i An": "Đà Nẵng - Hội An",
  "PhÃº Quá»‘c": "Phú Quốc",
  "HÃ  Giang": "Hà Giang",
  "Ä ang má»Ÿ": "Đang mở",
  "LiÃªn há»‡": "Liên hệ",
  "HÆ°á»›ng dáº«n viÃªn": "Hướng dẫn viên",
  "Váº­n chuyá»ƒn": "Vận chuyển",
  "Tiá»‡n Ã­ch": "Tiện ích",
  "Tiáº¿ng Viá»‡t": "Tiếng Việt",
  "KhÃ¡m phÃ¡ Viá»‡t Nam": "Khám phá Việt Nam",
  "TÃ¬m tÃªn gÃ³i": "Tìm tên gói",
  "Ä‘iá»ƒm Ä‘áº¿n": "điểm đến",
  "Ä áº·t tour ngay": "Đặt tour ngay",
  "Cung Ä‘Æ°á» ng áº£nh": "Cung đường ảnh",
  "Ká»³ nghá»‰ gia Ä‘Ã¬nh": "Kỳ nghỉ gia đình",
  "Há»™i An Ä‘i cháº­m": "Hội An đi chậm",
  "chÃºng tÃ´i": "chúng tôi",
  "ChÃ†Â°a ph?n lo?i": "Chưa phân loại",
  "BÃ¡ÂºÂ£n nhÃƒÂ¡p": "Bản nháp",
  "Ã„Â ÃƒÂ£ xuÃ¡ÂºÂ¥t bÃ¡ÂºÂ£n": "Đã xuất bản",
  "LÃ¡Â»â€”i": "Lỗi",
  "tÃ¡ÂºÂ£i": "tải",
  "bÃƒÂ i viÃ¡ÂºÂ¿t": "bài viết",
  "TÃ¡ÂºÂ¡o": "Tạo",
  "mÃ¡Â»â€ºi": "mới",
  "TiÃªu Ä‘á» ": "Tiêu đề",
  "khÃ´ng Ä‘Æ°á»£c trá»‘ng": "không được trống",
  "Vui lÃ²ng nháº­p Ä‘á»§ báº£n dá»‹ch": "Vui lòng nhập đủ bản dịch",
  "tiáº¿ng Anh vÃ  tiáº¿ng Trung": "tiếng Anh và tiếng Trung",
  "cho bÃ i viáº¿t": "cho bài viết",
  "cho gÃ³i du lá»‹ch": "cho gói du lịch",
  "XÃƒÂ³a": "Xóa",
  "thÃƒÂ nh cÃƒÂ´ng": "thành công",
  "QuyÃ¡Â»Â n truy cÃ¡ÂºÂ­p bÃ¡Â»â€¹ tÃ¡Â»Â« chÃ¡Â»â€˜i": "Quyền truy cập bị từ chối",
  "ChÆ°a phÃ¢n loáº¡i": "Chưa phân loại",
  "tá»“n táº¡i trÃªn há»‡ thá»‘ng": "tồn tại trên hệ thống"
};

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (entry.isFile() && extensions.has(path.extname(entry.name))) return [fullPath];
    return [];
  });
}

let filesChanged = 0;
for (const file of roots.flatMap(walk)) {
  const original = fs.readFileSync(file, "utf8");
  let cleaned = original;
  for (const [mojibake, correct] of Object.entries(replacements)) {
    cleaned = cleaned.split(mojibake).join(correct);
  }
  if (cleaned !== original) {
    fs.writeFileSync(file, cleaned, "utf8");
    filesChanged += 1;
    console.log("Fixed mojibake in:", file);
  }
}

console.log(`Cleaned ${filesChanged} files.`);
