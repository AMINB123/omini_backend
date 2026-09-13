"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { apiFetch } from "../../lib/api";

interface Plan {
  id: string;
  name: string;
  price_toman: number;
  duration_days: number;
  features: string[];
}

interface StoreInfo {
  is_subscribed: boolean;
  subscription_plan: string | null;
  subscription_expires_at: string | null;
}

function formatRemaining(ms: number) {
  if (ms <= 0) return null;

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function SubscriptionContent() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([
      apiFetch("/plans").then((res) => res.json()),
      apiFetch("/stores/me").then((res) => res.json()),
    ])
      .then(([plansData, storeData]) => {
        setPlans(plansData);
        setStore(storeData);
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  async function purchasePlan(planId: string) {
    setPurchasingPlan(planId);

    try {
      const res = await apiFetch("/payments/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      window.location.href = data.payment_url;
    } catch {
      alert("خطا در اتصال به درگاه پرداخت");
      setPurchasingPlan(null);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-ink/60">در حال بارگذاری...</div>;
  }

  const remaining = store?.subscription_expires_at
    ? formatRemaining(new Date(store.subscription_expires_at).getTime() - now)
    : null;

  const currentPlanName = plans.find((p) => p.id === store?.subscription_plan)?.name;

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-ink">اشتراک</h1>

      {status === "success" && (
        <div className="mb-6 rounded-xl bg-whatsapp/10 p-4 text-sm text-whatsapp">
          پرداخت با موفقیت انجام شد و اشتراک شما فعال شد.
        </div>
      )}
      {status === "failed" && (
        <div className="mb-6 rounded-xl bg-urgent/10 p-4 text-sm text-urgent">
          پرداخت ناموفق بود یا لغو شد. می‌توانید دوباره تلاش کنید.
        </div>
      )}

      {store?.is_subscribed && remaining && (
        <div className="mb-6 rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm text-ink/60">
            اشتراک فعال: <span className="font-medium text-ink">{currentPlanName ?? store.subscription_plan}</span>
          </p>
          <div className="flex gap-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            <TimeBox label="روز" value={remaining.days} />
            <TimeBox label="ساعت" value={remaining.hours} />
            <TimeBox label="دقیقه" value={remaining.minutes} />
            <TimeBox label="ثانیه" value={remaining.seconds} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-lg font-bold text-ink">{plan.name}</h2>
            <p className="mb-4 text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              {plan.price_toman.toLocaleString("fa-IR")}
              <span className="mr-1 text-sm font-normal text-ink/50">تومان</span>
            </p>

            <ul className="mb-6 flex-1 space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink/70">
                  <span className="mt-1 text-whatsapp">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => purchasePlan(plan.id)}
              disabled={purchasingPlan === plan.id}
              className="rounded-full bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {purchasingPlan === plan.id ? "در حال انتقال..." : "خرید این پلن"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimeBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-bg px-4 py-2 text-center">
      <div className="text-xl font-bold text-ink">{value.toString().padStart(2, "0")}</div>
      <div className="text-xs text-ink/50">{label}</div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-ink/60">در حال بارگذاری...</div>}>
      <SubscriptionContent />
    </Suspense>
  );
}