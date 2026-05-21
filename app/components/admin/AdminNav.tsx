"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdmin } from "./AdminContext";

export default function AdminNav() {
  const { isAuthenticated, logout } = useAdmin();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  return (
    <header className="admin-nav">

      {isAuthenticated ? (
        <nav className="admin-links">
          <Link href="/admin/dashboard">Dashboard</Link>
          <Link href="/admin">Control</Link>
          <Link href="/admin">Bài viết</Link>
        </nav>
      ) : null}

      <div className="admin-actions">
        {isAuthenticated ? (
          <button onClick={handleLogout}>Đăng xuất</button>
        ) : (
          <Link href="/admin/login"></Link>
        )}
      </div>
    </header>
  );
}
