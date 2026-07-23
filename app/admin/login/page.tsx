"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/AdminContext";

export default function LoginPage() {
  const { login, isAuthenticated, authReady } = useAdmin();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (authReady && isAuthenticated) {
      window.location.href = "/admin/dashboard";
    }
  }, [authReady, isAuthenticated]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "").trim();

    if (!username || !password) {
      setError("Vui lòng điền đầy đủ tài khoản và mật khẩu");
      setLoading(false);
      return;
    }

    try {
      // Gọi hàm login bất đồng bộ và đợi kết quả từ API
      const ok = await login(username, password);
      setLoading(false);
      if (ok) {
        window.location.href = "/admin/dashboard";
      } else {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
      }
    } catch (err) {
      setLoading(false);
      // Hiển thị trực tiếp thông báo lỗi cụ thể từ Server trả về
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f3ea] via-[#ebdcc5] to-[#dfceb0] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] border border-white/40 animate-in fade-in zoom-in-95 duration-500">

        {/* Left Side: Visual Showcase */}
        <div className="md:col-span-5 relative overflow-hidden bg-emerald-950 flex flex-col justify-between p-8 text-white">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80"
              alt="Du lịch Việt Nam"
              className="w-full h-full object-cover opacity-50 scale-105 hover:scale-100 transition-all duration-[8000ms] ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-900/60 to-emerald-950/40"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <img
                src="/vietvista-logo.png"
                alt="VietVista"
                className="w-24 object-contain brightness-0 invert"
              />
              <span className="text-[10px] bg-emerald-700/80 text-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider ml-2">PORTAL</span>
            </div>
          </div>

          <div className="relative z-10 mt-auto">
            <h2 className="text-2xl sm:text-3xl font-black leading-tight text-white mb-3">
              Quản lý hành trình <br />trải nghiệm khách hàng
            </h2>
            <p className="text-sm text-emerald-100/70 leading-relaxed font-medium">
              Chào mừng bạn trở lại! Cổng quản trị nội dung bài viết, tin tức du lịch và gói sản phẩm lữ hành của VietVista.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:col-span-7 flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8 flex justify-center md:justify-start">
              <img
                src="/vietvista-logo.png"
                alt="VietVista"
                className="w-32 object-contain"
              />
            </div>
            <h2 className="text-5xl font-black text-slate-800 tracking-tight" style={{ marginBottom: '1rem' }}>Khu vực quản lý</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">Vui lòng đăng nhập bằng tài khoản quản trị viên của bạn.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl animate-in slide-in-from-top-2 duration-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-bold text-rose-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Tên đăng nhập</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="4" r="4" /></svg>
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="admin"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">Mật khẩu</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:translate-y-0 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/10 hover:shadow-xl hover:shadow-emerald-600/20 hover:-translate-y-0.5 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : null}
                {loading ? "Đang xác thực..." : "Đăng nhập hệ thống"}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

