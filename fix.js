const fs = require('fs');
let content = fs.readFileSync('app/api/admin/posts/route.ts', 'utf8');

const mapping = {
  '\u20AC': 0x80, '\u201A': 0x82, '\u0192': 0x83, '\u201E': 0x84, '\u2026': 0x85, '\u2020': 0x86, '\u2021': 0x87, '\u02C6': 0x88, '\u2030': 0x89, '\u0160': 0x8A, '\u2039': 0x8B, '\u0152': 0x8C, '\u017D': 0x8E, '\u2018': 0x91, '\u2019': 0x92, '\u201C': 0x93, '\u201D': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97, '\u02DC': 0x98, '\u2122': 0x99, '\u0161': 0x9A, '\u203A': 0x9B, '\u0153': 0x9C, '\u017E': 0x9E, '\u0178': 0x9F
};

function unmojibake(str) {
  let buf = Buffer.alloc(str.length);
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code >= 0 && code <= 0xFF) {
      buf[i] = code;
    } else if (mapping[str[i]] !== undefined) {
      buf[i] = mapping[str[i]];
    } else {
      return str; // Not a valid mojibake sequence for utf8->win1252
    }
  }
  return buf.toString('utf8');
}

// Find all words containing one or more characters > 0x7F
const regex = /[a-zA-Z]*[\x80-\uFFFF]+[a-zA-Z\x80-\uFFFF]*/g;
content = content.replace(regex, (match) => {
  if (match.includes('Quản lý')) return match; 
  if (match.includes('Đăng tải')) return match;
  
  let decoded = unmojibake(match);
  if (decoded !== match && !decoded.includes('\uFFFD')) { 
    return decoded;
  }
  return match;
});

const extraReplacements = {
  'Ä‘á»ƒ': 'để',
  'bÃ i viáº¿t': 'bài viết',
  'bÃ i viáº¿t': 'bài viết',
  'tÃ¬m kiáº¿m': 'tìm kiếm',
  'Tráº¡ng thÃ¡i': 'Trạng thái',
  'ThÃªm má»›i': 'Thêm mới',
  'Ä‘á»•i': 'đổi',
  'chi tiáº¿t': 'chi tiết',
  'ChÆ°a': 'Chưa',
  'loáº¡i': 'loại',
  'Ä Ã£': 'Đã',
  'xuáº¥t báº£n': 'xuất bản',
  'Báº£n nhÃ¡p': 'Bản nháp',
  'Quáº£n lÃ½': 'Quản lý',
  'chá»‰nh sá»­a': 'chỉnh sửa',
  'cáº©m nang': 'cẩm nang',
  'du lá»‹ch': 'du lịch',
  'tin tá»©c': 'tin tức',
  'lá»¯ hÃ nh': 'lữ hành',
  'ThÃªm': 'Thêm',
  'má»›i': 'mới',
  'Má»›i': 'Mới',
  'CÅ©': 'Cũ',
  'nháº¥t': 'nhất',
  'Báº¡n': 'Bạn',
  'cÃ³': 'có',
  'cháº¯c cháº¯n': 'chắc chắn',
  'muá»‘n': 'muốn',
  'xÃ³a': 'xóa',
  'nÃ y': 'này',
  'nÃ y': 'này',
  'khÃ´ng': 'không',
  'HÃ nh Ä‘á»™ng': 'Hành động',
  'HÃ nh Ä‘á»™ng': 'Hành động',
  'thá»ƒ': 'thể',
  'hoÃ n tÃ¡c': 'hoàn tác',
  'hoÃ n tÃ¡c': 'hoàn tác',
  'Ã nh': 'Ảnh',
  'bá»³a': 'bìa',
  'mÃ´ táº£': 'mô tả',
  'TiÃªu Ä‘á» ': 'Tiêu đề',
  'Nháº­p': 'Nhập',
  'TÃ³m táº¯t': 'Tóm tắt',
  'HÃ¬nh áº£nh': 'Hình ảnh',
  'Thao tÃ¡c': 'Thao tác',
  'Cáº­p nháº­t': 'Cập nhật',
  'Táº¥t cáº£': 'Tất cả',
  'Danh má»¥c': 'Danh mục',
  'LÆ°u': 'Lưu',
  'thay Ä‘á»•i': 'thay đổi',
  'Ä á»“ng Ã½': 'Đồng ý',
  'Há»§y': 'Hủy',
  'KhÃ´ng': 'Không',
  'nÃ o': 'nào',
  'nÃ o': 'nào',
  'Ná»™i dung': 'Nội dung',
  'ThÃ´ng tin': 'Thông tin',
  'cÆ¡ báº£n': 'cơ bản',
  'NgÃ y': 'Ngày',
  'NgÃ y': 'Ngày',
  'táº¡o': 'tạo'
};

for (const [bad, good] of Object.entries(extraReplacements)) {
  content = content.split(bad).join(good);
}

fs.writeFileSync('app/admin/posts/page.tsx', content);
