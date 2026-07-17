"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "../../components/admin/AdminContext";

type TabKey = "posts" | "packages";

type DashboardPost = {
  id: string | number;
  title?: string | null;
  category?: string | null;
  date?: string | null;
  status?: string | null;
};

type DashboardPackage = {
  id: string | number;
  name?: string | null;
  destination?: string | null;
  duration?: string | null;
  price?: string | number | null;
  status?: string | null;
};

type DashboardBooking = {
  id?: string | number;
  bookingDate?: string | null;
  totalPrice?: string | number | null;
  status?: string | null;
};

type MonthlyPoint = {
  label: string;
  bookings: number;
  completed: number;
  revenue: number;
};

type WeeklyPoint = {
  label: string;
  pending: number;
  handled: number;
};

const TXT = {
  page: "Dashboard",
  title: "Tổng quan hệ thống",
  desc: "Theo dõi bài viết, gói tour, booking và doanh thu.",
  post: "Tổng bài viết",
  revenue: "Tổng doanh thu",
  pkg: "Tổng gói tour",
  booking: "Tổng booking",
  published: "Đã xuất bản",
  open: "Đang mở bán",
  pending: "Chờ xử lý",
  conversion: "Chuyển đổi",
  chartTitle: "Doanh thu & booking",
  chartSub: "Từ tháng 1 đến tháng 12",
  sales: "Booking",
  profit: "Hiệu suất tuần này",
  week: "Từ thứ 2 đến chủ nhật",
  content: "Tổng quan nội dung",
  status: "Trạng thái booking",
  tableStatus: "Trạng thái",
  statusCopy:
    "Doanh thu chỉ tính booking Hoàn tất; hiệu suất tuần tách Chờ xử lý và Đã xử lý.",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  waiting: "Chờ xử lý",
  cancelled: "Đã hủy",
  completed: "Hoàn tất",
  handled: "Đã xử lý",
  posts: "Bài viết",
  packages: "Gói du lịch",
  drafts: "Bản nháp",
  recent: "Dữ liệu gần đây",
  search: "Tìm kiếm...",
  category: "Chuyên mục",
  date: "Ngày đăng",
  destination: "Điểm đến",
  duration: "Thời gian",
  price: "Giá",
  tour: "Tour",
  thisWeek: "Tuần này",
  empty: "Không có dữ liệu phù hợp.",
} as const;

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const CHART_WIDTH = 760;
const CHART_HEIGHT = 160;
const CHART_Y_BASE = 220;

function clean(value?: string | number | null) {
  if (value === null || value === undefined) return "";

  let text = String(value);

  // Fix một số chuỗi tiếng Việt bị mojibake khi dữ liệu đi qua sai encoding.
  for (let i = 0; i < 3 && /[\u00c2\u00c3\u00c4]/.test(text); i += 1) {
    try {
      text = new TextDecoder("utf-8").decode(
        Uint8Array.from(Array.from(text, (char) => char.charCodeAt(0) & 255)),
      );
    } catch {
      break;
    }
  }

  return text.replace(/\uFFFD/g, "").trim();
}

function normalizeText(value?: string | number | null) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .toLowerCase();
}

function includesText(value: string | number | null | undefined, keyword: string) {
  return normalizeText(value).includes(keyword);
}

function isPublished(status?: string | null) {
  return includesText(status, "da xuat ban") || includesText(status, "published");
}

function isOpen(status?: string | null) {
  return includesText(status, "dang mo") || includesText(status, "open");
}

function isPending(status?: string | null) {
  return includesText(status, "cho xu ly");
}

function isProcessing(status?: string | null) {
  return includesText(status, "dang xu ly");
}

function isConfirmed(status?: string | null) {
  return includesText(status, "da xac nhan") || includesText(status, "confirmed");
}

function isCompleted(status?: string | null) {
  return includesText(status, "hoan tat") || includesText(status, "completed");
}

function isCancelled(status?: string | null) {
  return includesText(status, "da huy") || includesText(status, "cancelled");
}

function isHandled(status?: string | null) {
  return !isPending(status) && !isCancelled(status);
}

function parseMoney(value?: string | number | null) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  return parseInt(clean(value).replace(/[^0-9]/g, ""), 10) || 0;
}

function parseDate(value?: string | null) {
  const text = clean(value);
  if (!text) return null;

  // Hỗ trợ định dạng dd/mm/yyyy hoặc dd-mm-yyyy từ dữ liệu nhập tay.
  const vietnameseDate = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (vietnameseDate) {
    const [, day, month, year] = vietnameseDate;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function buildMonthlySeries(bookings: DashboardBooking[]): MonthlyPoint[] {
  const currentYear = new Date().getFullYear();
  const points = MONTH_LABELS.map((label) => ({
    label,
    bookings: 0,
    completed: 0,
    revenue: 0,
  }));

  bookings.forEach((booking) => {
    const date = parseDate(booking.bookingDate);
    if (!date || date.getFullYear() !== currentYear) return;

    const point = points[date.getMonth()];
    point.bookings += 1;

    if (isCompleted(booking.status)) {
      point.completed += 1;
      point.revenue += parseMoney(booking.totalPrice);
    }
  });

  return points;
}

function buildWeeklySeries(bookings: DashboardBooking[]): WeeklyPoint[] {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + mondayOffset);

  const points = WEEK_LABELS.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      label,
      key: dateKey(date),
      pending: 0,
      handled: 0,
    };
  });

  const pointByDate = new Map(points.map((point) => [point.key, point]));

  bookings.forEach((booking) => {
    const date = parseDate(booking.bookingDate);
    if (!date) return;

    const point = pointByDate.get(dateKey(date));
    if (!point) return;

    if (isPending(booking.status)) point.pending += 1;
    if (isHandled(booking.status)) point.handled += 1;
  });

  return points.map(({ label, pending, handled }) => ({ label, pending, handled }));
}

function buildLinePath(values: number[], maxValue: number) {
  const max = Math.max(maxValue, 1);

  return values
    .map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * CHART_WIDTH;
      const y = CHART_Y_BASE - (value / max) * CHART_HEIGHT;

      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function StatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14" />
      <path d="M8 17V9M12 17V6M16 17v-4" />
      <path d="M3 19h18" />
    </svg>
  );
}

function StatCard({
  title,
  value,
  sub,
  tone,
  rate,
}: {
  title: string;
  value: string | number;
  sub: string;
  tone: { bg: string; text: string; border: string; glow: string };
  rate: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-300/80">
      <div className={`absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-40 ${tone.glow}`} />
      
      <div className="flex items-start justify-between relative z-10">
        <span className={`grid h-14 w-14 place-items-center rounded-2xl border ${tone.border} bg-gradient-to-br from-white to-${tone.bg} shadow-sm ${tone.text} transition-transform duration-300 group-hover:scale-110`}>
          <StatIcon />
        </span>
        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 shadow-sm border border-emerald-100">
          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          {rate}
        </span>
      </div>

      <div className="relative z-10 mt-6">
        <strong className="block text-4xl font-black tracking-tight text-slate-900">{value}</strong>
        <p className="mt-1.5 text-sm font-bold uppercase tracking-wider text-slate-500">{title}</p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400">
          <span className={`h-1.5 w-1.5 rounded-full ${tone.glow.split(' ')[0]}`} />
          {sub}
        </p>
      </div>
    </article>
  );
}

function LineChart({ data }: { data: MonthlyPoint[] }) {
  const bookingValues = data.map((point) => point.bookings);
  const revenueValues = data.map((point) => point.revenue);
  const maxBookings = Math.max(...bookingValues, 1);
  const maxRevenue = Math.max(...revenueValues, 1);
  const bookingPath = buildLinePath(bookingValues, maxBookings);
  const revenuePath = buildLinePath(revenueValues, maxRevenue);
  const areaPath = `${revenuePath} L${CHART_WIDTH} 230 L0 230 Z`;

  return (
    <div className="mt-6">
      <svg viewBox="0 0 760 260" className="h-[260px] w-full overflow-visible" role="img">
        <title>{TXT.chartTitle}</title>
        {[0, 1, 2, 3, 4].map((index) => (
          <line
            key={index}
            x1="0"
            x2={CHART_WIDTH}
            y1={42 + index * 42}
            y2={42 + index * 42}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />
        ))}

        <path d={areaPath} fill="url(#revenueFill)" />
        <path
          d={revenuePath}
          fill="none"
          stroke="url(#revenueStroke)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
          className="drop-shadow-[0_4px_12px_rgba(56,189,248,0.4)]"
        />
        <path
          d={bookingPath}
          fill="none"
          stroke="#60a5fa"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
          className="drop-shadow-[0_4px_12px_rgba(96,165,250,0.4)]"
        />

        {data.map((point, index) => {
          const x = data.length === 1 ? 0 : (index / (data.length - 1)) * CHART_WIDTH;
          const y = CHART_Y_BASE - (point.revenue / maxRevenue) * CHART_HEIGHT;

          return (
            <circle key={point.label} cx={x} cy={y} r="6" fill="#fff" stroke="#38bdf8" strokeWidth="3" className="drop-shadow-sm cursor-pointer hover:r-[8px] transition-all">
              <title>{`${point.label}: ${formatCurrency(point.revenue)} - ${point.completed} booking hoàn tất`}</title>
            </circle>
          );
        })}

        <defs>
          <linearGradient id="revenueFill" x1="0" x2="0" y1="80" y2="260">
            <stop stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="revenueStroke" x1="0" x2="760" y1="0" y2="0">
            <stop stopColor="#7dd3fc" />
            <stop offset="1" stopColor="#0284c7" />
          </linearGradient>
        </defs>
      </svg>

      <div className="grid grid-cols-12 text-center text-[11px] font-black uppercase tracking-widest text-slate-400 mt-2">
        {data.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }: { data: WeeklyPoint[] }) {
  const maxValue = Math.max(
    ...data.flatMap((point) => [point.pending, point.handled]),
    1,
  );

  return (
    <div className="mt-8 flex h-[240px] items-end justify-between gap-4 rounded-2xl bg-gradient-to-t from-slate-50 to-white border border-slate-100 px-5 py-4 shadow-inner">
      {data.map((point) => {
        const pendingHeight = Math.max(6, (point.pending / maxValue) * 100);
        const handledHeight = Math.max(6, (point.handled / maxValue) * 100);

        return (
          <div key={point.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-3 cursor-pointer">
            <div className="relative flex h-[180px] w-full items-end justify-center gap-1.5">
              <div className="w-1/3 max-w-[12px] rounded-t-md bg-sky-200 shadow-[0_0_12px_rgba(186,230,253,0.6)] transition-all duration-300 group-hover:bg-sky-300" style={{ height: `${pendingHeight}%` }} title={`${point.pending} chờ xử lý`} />
              <div className="w-1/3 max-w-[12px] rounded-t-md bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.6)] transition-all duration-300 group-hover:bg-sky-500" style={{ height: `${handledHeight}%` }} title={`${point.handled} đã xử lý`} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 transition-colors group-hover:text-slate-600">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Donut({
  published,
  drafts,
  packages,
}: {
  published: number;
  drafts: number;
  packages: number;
}) {
  const total = Math.max(published + drafts + packages, 1);
  const publishedPercent = (published / total) * 100;
  const packagePercent = (packages / total) * 100;
  const background = `conic-gradient(from 0deg, #7dd3fc 0 ${publishedPercent}%, #0ea5e9 ${publishedPercent}% ${publishedPercent + packagePercent}%, #e2e8f0 ${publishedPercent + packagePercent}% 100%)`;

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center gap-8">
      <div className="relative grid h-40 w-40 place-items-center rounded-full shadow-[0_0_20px_rgba(0,0,0,0.06)] overflow-hidden" style={{ background }}>
        <div className="absolute inset-0 rounded-full border-4 border-white/30"></div>
        <div className="grid h-[104px] w-[104px] place-items-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
          <span className="text-4xl font-black text-slate-800 tracking-tighter">{total}</span>
        </div>
      </div>

      <div className="space-y-4 w-full sm:w-auto">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100/50 bg-white px-5 py-2.5 shadow-sm hover:shadow-md transition-shadow">
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-sky-300 shadow-[0_0_10px_rgba(125,211,252,0.5)]" />
          <span className="text-sm font-bold text-slate-600">{TXT.posts}</span>
          <span className="ml-auto font-black text-slate-900">{published}</span>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100/50 bg-white px-5 py-2.5 shadow-sm hover:shadow-md transition-shadow">
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
          <span className="text-sm font-bold text-slate-600">{TXT.packages}</span>
          <span className="ml-auto font-black text-slate-900">{packages}</span>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100/50 bg-white px-5 py-2.5 shadow-sm hover:shadow-md transition-shadow">
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-slate-200 shadow-[0_0_10px_rgba(226,232,240,0.5)]" />
          <span className="text-sm font-bold text-slate-600">{TXT.drafts}</span>
          <span className="ml-auto font-black text-slate-900">{drafts}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center font-semibold text-slate-400">
        {TXT.empty}
      </td>
    </tr>
  );
}

function PostsTable({ posts }: { posts: DashboardPost[] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-sm uppercase tracking-[0.14em] text-slate-500">
        <tr>
          <th className="px-6 py-4">{TXT.posts}</th>
          <th className="px-6 py-4">{TXT.category}</th>
          <th className="px-6 py-4">{TXT.date}</th>
          <th className="px-6 py-4">{TXT.tableStatus}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {posts.length === 0 ? (
          <EmptyRow colSpan={4} />
        ) : (
          posts.map((post) => (
            <tr key={post.id} className="hover:bg-slate-50">
              <td className="px-6 py-4">
                <b>{clean(post.title)}</b>
                <span className="mt-1 block text-sm text-slate-400">ID: {post.id}</span>
              </td>
              <td className="px-6 py-4 font-semibold text-slate-600">{clean(post.category)}</td>
              <td className="px-6 py-4 text-slate-500">{clean(post.date)}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wider border ${isPublished(post.status)
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isPublished(post.status) ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                  {clean(post.status)}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function PackagesTable({ packages }: { packages: DashboardPackage[] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-sm uppercase tracking-[0.14em] text-slate-500">
        <tr>
          <th className="px-6 py-4">{TXT.packages}</th>
          <th className="px-6 py-4">{TXT.destination}</th>
          <th className="px-6 py-4">{TXT.duration}</th>
          <th className="px-6 py-4">{TXT.price}</th>
          <th className="px-6 py-4">{TXT.tableStatus}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {packages.length === 0 ? (
          <EmptyRow colSpan={5} />
        ) : (
          packages.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="px-6 py-4">
                <b>{clean(item.name)}</b>
                <span className="mt-1 block text-sm text-slate-400">ID: {item.id}</span>
              </td>
              <td className="px-6 py-4 font-semibold text-slate-600">{clean(item.destination)}</td>
              <td className="px-6 py-4 text-slate-500">{clean(item.duration)}</td>
              <td className="px-6 py-4 font-black text-blue-700">{clean(item.price)}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wider border ${isOpen(item.status)
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isOpen(item.status) ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                  {clean(item.status)}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default function DashboardPage() {
  const admin = useAdmin();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("posts");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const posts = admin.posts as DashboardPost[];
  const packages = admin.packages as DashboardPackage[];
  const bookings = admin.bookings as DashboardBooking[];
  const { isAuthenticated } = admin;

  useEffect(() => {
    if (!isAuthenticated) router.push("/admin/login");
  }, [isAuthenticated, router]);

  const metrics = useMemo(() => {
    const published = posts.filter((post) => isPublished(post.status)).length;
    const completed = bookings.filter((booking) => isCompleted(booking.status)).length;

    return {
      published,
      drafts: posts.length - published,
      open: packages.filter((item) => isOpen(item.status)).length,
      pending: bookings.filter((booking) => isPending(booking.status)).length,
      processing: bookings.filter((booking) => isProcessing(booking.status)).length,
      confirmed: bookings.filter((booking) => isConfirmed(booking.status)).length,
      completed,
      cancelled: bookings.filter((booking) => isCancelled(booking.status)).length,
      revenue: bookings
        .filter((booking) => isCompleted(booking.status))
        .reduce((sum, booking) => sum + parseMoney(booking.totalPrice), 0),
      conversion: bookings.length ? Math.round((completed / bookings.length) * 100) : 0,
      monthly: buildMonthlySeries(bookings),
      weekly: buildWeeklySeries(bookings),
    };
  }, [bookings, packages, posts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [tab, query]);

  const listPosts = useMemo(() => {
    const keyword = normalizeText(query);

    return posts.filter((post) =>
      normalizeText([post.title, post.category, post.status].map(clean).join(" ")).includes(keyword),
    );
  }, [posts, query]);

  const listPackages = useMemo(() => {
    const keyword = normalizeText(query);

    return packages.filter((item) =>
      normalizeText([item.name, item.destination, item.status].map(clean).join(" ")).includes(keyword),
    );
  }, [packages, query]);

  if (!isAuthenticated) return null;

  const revenue = formatCurrency(metrics.revenue);
  const compactRevenue = formatCompactCurrency(metrics.revenue);
  const statusCards = [
    { label: TXT.confirmed, value: metrics.confirmed, color: "bg-emerald-500" },
    { label: TXT.completed, value: metrics.completed, color: "bg-violet-500" },
    { label: TXT.processing, value: metrics.processing, color: "bg-blue-500" },
    { label: TXT.waiting, value: metrics.pending, color: "bg-amber-500" },
    { label: TXT.cancelled, value: metrics.cancelled, color: "bg-rose-500" },
  ];

  const activeList = tab === "posts" ? listPosts : listPackages;
  const totalPages = Math.max(1, Math.ceil(activeList.length / itemsPerPage));
  const currentPosts = listPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const currentPackages = listPackages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="relative min-h-screen pb-12 text-slate-800 bg-slate-50/50 selection:bg-blue-200">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-blue-400 opacity-10 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 space-y-8 px-4 sm:px-6 lg:px-8 pt-8 max-w-[1600px] mx-auto">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-blue-500 opacity-10 blur-3xl"></div>
          <div className="absolute left-0 bottom-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-emerald-500 opacity-10 blur-3xl"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/50 px-3 py-1 text-xs font-black uppercase tracking-widest text-blue-600 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
              </span>
              {TXT.page}
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">{TXT.title}</h2>
            <p className="mt-2 max-w-3xl text-base font-medium leading-relaxed text-slate-500">
              {TXT.desc}
            </p>
          </div>
        </section>
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={TXT.post}
          value={posts.length}
          sub={`${metrics.published} ${TXT.published}`}
          tone={{ bg: "blue-50", border: "border-blue-100", text: "text-blue-600", glow: "bg-blue-400" }}
          rate="0.43%"
        />
        <StatCard
          title={TXT.revenue}
          value={compactRevenue}
          sub={`${metrics.conversion}% ${TXT.conversion}`}
          tone={{ bg: "emerald-50", border: "border-emerald-100", text: "text-emerald-600", glow: "bg-emerald-400" }}
          rate="4.35%"
        />
        <StatCard
          title={TXT.pkg}
          value={packages.length}
          sub={`${metrics.open} ${TXT.open}`}
          tone={{ bg: "indigo-50", border: "border-indigo-100", text: "text-indigo-600", glow: "bg-indigo-400" }}
          rate="2.59%"
        />
        <StatCard
          title={TXT.booking}
          value={bookings.length}
          sub={`${metrics.pending} ${TXT.pending}`}
          tone={{ bg: "amber-50", border: "border-amber-100", text: "text-amber-600", glow: "bg-amber-400" }}
          rate="0.95%"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl xl:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950">{TXT.chartTitle}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-400">{TXT.chartSub}</p>
            </div>
            <div className="flex gap-4 text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <span className="flex items-center gap-2">
                <span className="block h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                {TXT.sales}
              </span>
              <span className="flex items-center gap-2">
                <span className="block h-2.5 w-2.5 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.6)]" />
                {TXT.revenue}
              </span>
            </div>
          </div>
          <LineChart data={metrics.monthly} />
        </article>

        <article className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950">{TXT.profit}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-400">{TXT.week}</p>
            </div>
            <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-wider text-slate-600 shadow-sm">
              {TXT.thisWeek}
            </span>
          </div>
          <BarChart data={metrics.weekly} />
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
          <h2 className="text-xl font-black tracking-tight text-slate-950">{TXT.content}</h2>
          <Donut published={metrics.published} drafts={metrics.drafts} packages={packages.length} />
        </article>

        <article className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl xl:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950">{TXT.status}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-400">{TXT.statusCopy}</p>
            </div>
            <span className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 drop-shadow-sm">{revenue}</span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {statusCards.map((item) => (
              <Link href={`/admin/bookings?status=${encodeURIComponent(item.label)}`} key={item.label} className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300">
                <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-10 transition-transform duration-300 group-hover:scale-150 ${item.color}`} />
                <div className="relative z-10 flex items-center justify-between">
                  <span className={`h-3 w-3 rounded-full shadow-sm ${item.color}`} />
                  <strong className="text-3xl font-black tracking-tight text-slate-900">{item.value}</strong>
                </div>
                <p className="relative z-10 mt-3 text-xs font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-950">{TXT.recent}</h2>
            <div className="mt-4 flex w-fit rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
              <button
                type="button"
                onClick={() => setTab("posts")}
                className={`rounded-lg px-6 py-2 text-sm font-black transition-all ${tab === "posts" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {TXT.posts} <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-400">{posts.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setTab("packages")}
                className={`rounded-lg px-6 py-2 text-sm font-black transition-all ${tab === "packages" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {TXT.tour} <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-400">{packages.length}</span>
              </button>
            </div>
          </div>

          <label className="relative w-full max-w-md group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-blue-500">
              <SearchIcon />
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={TXT.search}
              aria-label={TXT.search}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          {tab === "posts" ? <PostsTable posts={currentPosts} /> : <PackagesTable packages={currentPackages} />}
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
            <span className="text-sm font-semibold text-slate-500">
              Hiển thị <span className="font-black text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-black text-slate-700">{Math.min(currentPage * itemsPerPage, activeList.length)}</span> trong số <span className="font-black text-slate-700">{activeList.length}</span> {tab === "posts" ? "bài viết" : "tour"}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Trước
              </button>
              <div className="flex gap-1 items-center">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`h-9 w-9 rounded-xl text-sm font-black transition-colors ${
                      currentPage === i + 1 ? "bg-blue-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
