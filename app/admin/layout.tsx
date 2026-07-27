import type { Metadata } from "next";
import { noIndexRobots } from "@/lib/seo";
import AdminShell from "../components/admin/AdminShell";
import { AdminProvider } from "../components/admin/AdminContext";

export const metadata: Metadata = {
  title: "Admin | TimesGreen",
  robots: noIndexRobots,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
