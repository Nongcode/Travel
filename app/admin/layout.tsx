import AdminShell from "../components/admin/AdminShell";
import { AdminProvider } from "../components/admin/AdminContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
