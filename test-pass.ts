import crypto from "crypto";

export function verifyPassword(password: string, storedHash: string): boolean {
    const parts = storedHash.split(":");
    if (parts.length !== 2) return false;

    const [salt, originalHash] = parts;
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === originalHash;
}

const hashes = {
  hau: "88be7e4f30ed1c5c6456e4f272bc448a:54735715488f40996d398ee98bbcb10768c7e486dea8cfbd25baabefc47e0b3e7a7f743ce7f888fccded463c9211fcad9b84d6824124bca61e20a202af638d9a",
  admin: "5e6c9d5738a5930a8c499da2eaba24a5:5cdcc2d4960170fdcf85e4cdf9b1bcf45498b5280e5271606edc34b0de59d21f4ba1457102beeb5f5673d84dbf82fe6ac54bd01493a5af1750142cb9e8fcdcc0"
};

const commonPasswords = ["admin", "admin123", "password", "hau123", "hau", "123456", "12345678", "password123"];

for (const p of commonPasswords) {
  if (verifyPassword(p, hashes.hau)) {
    console.log("hau password is: " + p);
  }
  if (verifyPassword(p, hashes.admin)) {
    console.log("admin password is: " + p);
  }
}
