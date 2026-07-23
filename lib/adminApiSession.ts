import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export type AdminApiSession = {
  id?: number;
  email: string;
  role?: string;
};

export function getAdminApiSession(request: NextRequest): AdminApiSession | null {
  const token = request.cookies.get("admin_token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token) as Partial<AdminApiSession> | null;
  if (!decoded || typeof decoded.email !== "string" || !decoded.email) return null;

  return {
    id: typeof decoded.id === "number" ? decoded.id : undefined,
    email: decoded.email,
    role: typeof decoded.role === "string" ? decoded.role : undefined,
  };
}
