import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function verifyAdminSession(request: NextRequest) {
  const tokenCookie = request.cookies.get("admin_token");
  if (!tokenCookie) return null;
  return verifyToken(tokenCookie.value);
}
