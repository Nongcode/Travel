import crypto from "crypto";

// Lấy secret key từ biến môi trường hoặc dùng tạm key dự phòng cho môi trường dev
const JWT_SECRET = process.env.JWT_SECRET || "vietvista-default-secret-key-2026";

/**
 * Băm mật khẩu sử dụng PBKDF2 (Native Node.js Crypto)
 * Kết quả trả về dưới dạng chuỗi ghép: salt:hash
 */
export function hashPassword(password: string): string {
    // Tạo salt ngẫu nhiên 16 bytes
    const salt = crypto.randomBytes(16).toString("hex");
    // Băm mật khẩu với salt sử dụng thuật toán PBKDF2 và SHA-512
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return `${salt}:${hash}`;
}

/**
 * Xác thực mật khẩu nhập vào với chuỗi băm đã lưu trong cơ sở dữ liệu
 */
export function verifyPassword(password: string, storedHash: string): boolean {
    const parts = storedHash.split(":");
    if (parts.length !== 2) return false;

    const [salt, originalHash] = parts;
    // Băm lại mật khẩu nhập vào bằng salt đã lưu
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === originalHash;
}

/**
 * Ký JWT token thủ công bằng thuật toán mã hóa HMAC-SHA256
 * @param payload Dữ liệu cần lưu trữ trong token (ví dụ: { id, email, role })
 * @param expiresInDays Thời gian sống của token (mặc định là 7 ngày)
 */
export function signToken(payload: object, expiresInDays: number = 7): string {
    const header = { alg: "HS256", typ: "JWT" };
    const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;

    const fullPayload = { ...payload, exp };

    // Chuyển đổi header và payload sang dạng Base64URL
    const base64UrlHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
    const base64UrlPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");

    const signatureInput = `${base64UrlHeader}.${base64UrlPayload}`;
    // Tạo chữ ký số HMAC-SHA256 bảo vệ tính toàn vẹn của token
    const signature = crypto
        .createHmac("sha256", JWT_SECRET)
        .update(signatureInput)
        .digest("base64url");

    return `${signatureInput}.${signature}`;
}

/**
 * Xác thực chuỗi JWT token gửi lên và trả về payload nếu hợp lệ
 */
export function verifyToken(token: string): any {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const [header, payload, signature] = parts;
        // Kiểm tra lại chữ ký
        const expectedSignature = crypto
            .createHmac("sha256", JWT_SECRET)
            .update(`${header}.${payload}`)
            .digest("base64url");

        if (signature !== expectedSignature) {
            return null; // Chữ ký không hợp lệ (token đã bị sửa đổi)
        }

        const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString());

        // Kiểm tra thời gian hết hạn (expiration time)
        if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
            return null; // Token đã hết hạn
        }

        return decodedPayload;
    } catch (error) {
        return null; // Lỗi cú pháp token hoặc lỗi phân tích JSON
    }
}