const MOJIBAKE_PATTERN = /Ã.|Ä.|Æ.|áº|á»|\uFFFD/;
const GOOD_TEXT_PATTERN = /[\u4e00-\u9fffăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;

const CP1252_SPECIAL_BYTES = new Map<number, number>([
  [0x20ac, 0x80],
  [0x201a, 0x82],
  [0x0192, 0x83],
  [0x201e, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02c6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8a],
  [0x2039, 0x8b],
  [0x0152, 0x8c],
  [0x017d, 0x8e],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201c, 0x93],
  [0x201d, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02dc, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9a],
  [0x203a, 0x9b],
  [0x0153, 0x9c],
  [0x017e, 0x9e],
  [0x0178, 0x9f],
]);

function cp1252Encode(value: string, unknownByte = 0x3f) {
  const bytes: number[] = [];
  for (const char of value) {
    const code = char.codePointAt(0) || 0;
    const mapped = CP1252_SPECIAL_BYTES.get(code);
    if (mapped !== undefined) bytes.push(mapped);
    else if (code <= 0xff) bytes.push(code);
    else bytes.push(unknownByte);
  }
  return Buffer.from(bytes);
}

function decodeAsUtf8(value: string, unknownByte = 0x3f) {
  return cp1252Encode(value, unknownByte).toString("utf8");
}

function textScore(value: string) {
  const mojibakeCount = (value.match(MOJIBAKE_PATTERN) || []).length;
  const replacementCount = (value.match(/�/g) || []).length;
  const c1ControlCount = (value.match(/[\u0080-\u009f]/g) || []).length;
  const goodCount = (value.match(GOOD_TEXT_PATTERN) || []).length;
  return goodCount * 3 - mojibakeCount * 12 - replacementCount * 24 - c1ControlCount * 20;
}

export function normalizeLegacyText(value: string) {
  let best = value;
  let current = value;

  for (let index = 0; index < 8; index += 1) {
    if (!MOJIBAKE_PATTERN.test(current)) break;

    const candidates = [decodeAsUtf8(current), decodeAsUtf8(current, 0x20)];
    const next = candidates.reduce((winner, candidate) => (textScore(candidate) > textScore(winner) ? candidate : winner), candidates[0]);
    if (!next || next === current) break;

    current = next;
    if (textScore(current) > textScore(best)) best = current;
  }

  return textScore(current) > textScore(best) ? current : best;
}


