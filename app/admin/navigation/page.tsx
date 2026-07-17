"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

export default function HeaderFooterNavigationPage() {
  const {
    headerMenu,
    footerInfo,
    isAuthenticated,
    addHeaderMenuItem,
    updateHeaderMenuItem,
    removeHeaderMenuItem,
    updateFooterInfo,
  } = useAdmin();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"header" | "footer">("header");

  // Header Menu form state
  const [menuLabel, setMenuLabel] = useState("");
  const [menuUrl, setMenuUrl] = useState("");
  const [menuOrder, setMenuOrder] = useState<number>(1);
  const [editingMenuItem, setEditingMenuItem] = useState<any>(null);

  // Footer Info form state
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [copyright, setCopyright] = useState("");
  const [footerMessage, setFooterMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  // Load footer info values when mounted/changed
  useEffect(() => {
    if (footerInfo) {
      setBrandName(footerInfo.brandName || "");
      setDescription(footerInfo.description || "");
      setAddress(footerInfo.address || "");
      setPhone(footerInfo.phone || "");
      setEmail(footerInfo.email || "");
      setFacebook(footerInfo.facebook || "");
      setInstagram(footerInfo.instagram || "");
      setTwitter(footerInfo.twitter || "");
      setCopyright(footerInfo.copyright || "");
    }
  }, [footerInfo]);

  if (!isAuthenticated) return null;

  // Sort header menus by order asc
  const sortedMenuItems = [...headerMenu].sort((a, b) => a.order - b.order);

  // Header Submit
  const handleHeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuLabel.trim() || !menuUrl.trim()) return;

    const itemData = {
      label: menuLabel.trim(),
      url: menuUrl.trim(),
      order: Number(menuOrder) || 1,
    };

    if (editingMenuItem) {
      updateHeaderMenuItem(editingMenuItem.id, itemData);
      setEditingMenuItem(null);
    } else {
      addHeaderMenuItem(itemData);
    }

    setMenuLabel("");
    setMenuUrl("");
    setMenuOrder(headerMenu.length + 2);
  };

  // Footer Submit
  const handleFooterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFooterInfo({
      brandName,
      description,
      address,
      phone,
      email,
      facebook,
      instagram,
      twitter,
      copyright,
    });
    setFooterMessage("Cập nhật thông tin footer thành công!");
    setTimeout(() => setFooterMessage(""), 3000);
  };

  const startEditHeader = (item: any) => {
    setEditingMenuItem(item);
    setMenuLabel(item.label);
    setMenuUrl(item.url);
    setMenuOrder(item.order);
  };

  const cancelEditHeader = () => {
    setEditingMenuItem(null);
    setMenuLabel("");
    setMenuUrl("");
    setMenuOrder(headerMenu.length + 1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
          Cấu hình Header & Footer
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Tùy chỉnh thông tin liên hệ, mạng xã hội ở chân trang và các liên kết điều hướng trên thanh menu chính.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab("header")}
          className={
            "pb-3 text-sm font-bold border-b-2 transition-all " +
            (activeTab === "header"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800")
          }
        >
          Thanh điều hướng chính (Header)
        </button>
        <button
          onClick={() => setActiveTab("footer")}
          className={
            "pb-3 text-sm font-bold border-b-2 transition-all " +
            (activeTab === "footer"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800")
          }
        >
          Thông tin chân trang (Footer)
        </button>
      </div>

      {activeTab === "header" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Add/Edit Menu Link */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm sticky top-24">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
                {editingMenuItem ? "Cập nhật liên kết" : "Thêm liên kết mới"}
              </h3>
              <form onSubmit={handleHeaderSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Tên hiển thị (Label)
                  </label>
                  <input
                    type="text"
                    required
                    value={menuLabel}
                    onChange={(e) => setMenuLabel(e.target.value)}
                    placeholder="Ví dụ: Giới thiệu, Blog..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Đường dẫn (URL/Path)
                  </label>
                  <input
                    type="text"
                    required
                    value={menuUrl}
                    onChange={(e) => setMenuUrl(e.target.value)}
                    placeholder="Ví dụ: /about, /tin-tuc..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono text-xs text-slate-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                    Thứ tự hiển thị (Order)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={menuOrder}
                    onChange={(e) => setMenuOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all"
                  >
                    {editingMenuItem ? "Cập nhật link" : "Thêm vào Menu"}
                  </button>
                  {editingMenuItem && (
                    <button
                      type="button"
                      onClick={cancelEditHeader}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Table */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                  Thứ tự Menu điều hướng
                </h4>
                <span className="text-xs text-slate-500 font-medium">
                  {headerMenu.length} mục liên kết
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                      <th className="px-6 py-3 w-16">Thứ tự</th>
                      <th className="px-6 py-3">Nhãn menu</th>
                      <th className="px-6 py-3">Đường dẫn</th>
                      <th className="px-6 py-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                    {sortedMenuItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-slate-400 font-medium"
                        >
                          Không có liên kết nào.
                        </td>
                      </tr>
                    ) : (
                      sortedMenuItems.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono font-bold text-slate-800">
                            {item.order}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {item.label}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">
                            {item.url}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => startEditHeader(item)}
                                className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg transition-colors"
                                aria-label="Sửa"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Bạn có chắc chắn muốn xóa liên kết "${item.label}"?`
                                    )
                                  ) {
                                    removeHeaderMenuItem(item.id);
                                  }
                                }}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                                aria-label="Xóa"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <line x1="10" y1="11" x2="10" y2="17" />
                                  <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm max-w-4xl">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">
            Thông tin thương hiệu & Liên hệ ở Footer
          </h3>

          {footerMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-sm font-bold animate-in fade-in duration-200">
              {footerMessage}
            </div>
          )}

          <form onSubmit={handleFooterSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                  Tên thương hiệu (Brand Name)
                </label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                  Bản quyền (Copyright text)
                </label>
                <input
                  type="text"
                  required
                  value={copyright}
                  onChange={(e) => setCopyright(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                Mô tả ngắn thương hiệu (Bio/Description)
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                  Địa chỉ văn phòng
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                  Số điện thoại hỗ trợ (Hotline)
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                  Email liên hệ
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-700"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                Đường dẫn mạng xã hội
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono text-slate-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono text-slate-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                    Twitter (X)
                  </label>
                  <input
                    type="url"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://twitter.com/..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono text-slate-600"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all"
            >
              Lưu cấu hình Footer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
