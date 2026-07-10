import fs from "fs";
import { normalizeLegacyText } from "../lib/text/encoding";
const text = fs.readFileSync("app/components/admin/AdminContext.tsx", "utf8");
const match = text.match(/name: "([^"]*VÃ[^"]*)"/);
if (match) {
  console.log(match[1]);
  console.log("---");
  console.log(normalizeLegacyText(match[1]));
}
