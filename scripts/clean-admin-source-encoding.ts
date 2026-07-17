import fs from "fs";
import path from "path";
import { normalizeLegacyText } from "../lib/text/encoding";

const roots = ["app/admin", "app/components/admin", "app/api/admin"];
const extensions = new Set([".ts", ".tsx"]);
const suspectPattern = /Ã|Â|Ä|áº|á»|Æ|Å|â|€|™|œ|š|Ž|æ|é|è|å|ç|ä|ã|ï|¼|½|¾|»|º|¥|ƒ|�|\?/;

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (entry.isFile() && extensions.has(path.extname(entry.name))) return [fullPath];
    return [];
  });
}

function normalizeLiteralContent(content: string) {
  if (!suspectPattern.test(content)) return content;
  return normalizeLegacyText(content)
    .replace(/\?ang m\?/g, "Đang mở")
    .replace(/\?ang x\?/g, "Đang xử lý")
    .replace(/Ch\?a/g, "Chưa")
    .replace(/T\?t c\? /g, "Tất cả ")
    .replace(/T\?t c\?/g, "Tất cả")
    .replace(/Kh\?ng/g, "Không");
}

function cleanSource(source: string) {
  let output = "";
  let index = 0;
  let changed = false;

  while (index < source.length) {
    const quote = source[index];
    if (quote !== '"' && quote !== "'" && quote !== "`") {
      output += quote;
      index += 1;
      continue;
    }

    const start = index;
    index += 1;
    let content = "";
    let escaped = false;

    while (index < source.length) {
      const char = source[index];
      if (escaped) {
        content += char;
        escaped = false;
        index += 1;
        continue;
      }
      if (char === "\\") {
        content += char;
        escaped = true;
        index += 1;
        continue;
      }
      if (char === quote) break;
      content += char;
      index += 1;
    }

    if (index >= source.length) {
      output += source.slice(start);
      break;
    }

    const normalized = normalizeLiteralContent(content);
    if (normalized !== content) changed = true;
    output += quote + normalized + quote;
    index += 1;
  }

  return { source: output, changed };
}

let filesChanged = 0;
for (const file of roots.flatMap(walk)) {
  const original = fs.readFileSync(file, "utf8");
  const cleaned = cleanSource(original);
  if (!cleaned.changed) continue;
  fs.writeFileSync(file, cleaned.source, "utf8");
  filesChanged += 1;
  console.log(file);
}

console.log(`Cleaned ${filesChanged} admin source files.`);
