"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { apiFetch } from "../../lib/api";

interface AnalyticsSummary {
  total_conversations: number;
  converted_conversations: number;
  conversion_rate: number;
  auto_reply_rate: number;
  urgent_pending_count: number;
  messages_by_platform: { platform: string; count: number }[];
  daily_message_counts: { date: string; count: number }[];
}

const platformColors: Record<string, string> = {
  instagram: "#8134AF",
  whatsapp: "#25D366",
  telegram: "#229ED9",
};

const platformLabels: Record<string, string> = {
  instagram: "اینستاگرام",
  whatsapp: "واتساپ",
  telegram: "تلگرام",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    apiFetch("/analytics/summary")
      .then((res) => res.json())
      .then((result) => setData(result))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <div className="p-8 text-center text-ink/60">در حال بارگذاری...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-ink/60">اطلاعاتی برای نمایش وجود ندارد.</div>;
  }

  const pieData = data.messages_by_platform.map((p) => ({
    name: platformLabels[p.platform] ?? p.platform,
    value: p.count,
    color: platformColors[p.platform] ?? "#999",
  }));

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-ink">تحلیل و آمار</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="کل مکالمات" value={data.total_conversations.toString()} />
        <StatCard label="نرخ تبدیل به خرید" value={`${data.conversion_rate}%`} accent="text-whatsapp" />
        <StatCard label="نرخ پاسخ خودکار" value={`${data.auto_reply_rate}%`} accent="text-ai" />
        <StatCard label="پیام فوری بی‌جواب" value={data.urgent_pending_count.toString()} accent="text-urgent" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-ink/70">پیام‌ها بر اساس پلتفرم</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-ink/40">هنوز داده‌ای ثبت نشده.</p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-ink/70">روند پیام‌ها (۳۰ روز اخیر)</h2>
          {data.daily_message_counts.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.daily_message_counts}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0E7C7A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-ink/40">هنوز داده‌ای ثبت نشده.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <p className="mb-1 text-xs text-ink/50">{label}</p>
      <p className={`text-2xl font-bold ${accent ?? "text-ink"}`} style={{ fontFamily: "var(--font-space-grotesk)" }}>
        {value}
      </p>
    </div>
  );
}