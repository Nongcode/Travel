import Link from "next/link";

export function PageDisabled({ pageName }: { pageName: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fcf9f2] p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="mx-auto w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-inner">
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Kênh dịch vụ tạm đóng</h1>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            <strong className="text-emerald-700 font-bold">{pageName}</strong> hiện đang tạm đóng để nâng cấp cấu hình hoặc tùy chỉnh nội dung.
          </p>
        </div>
        <Link href="/" className="inline-flex px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 transition-all">
          Quay lại Trang chủ
        </Link>
      </div>
    </main>
  );
}
