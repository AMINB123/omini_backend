"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { apiFetch } from "../lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    apiFetch("/stores/me")
      .then((res) => res.json())
      .then((store) => {
        const isSubscriptionPage = pathname === "/dashboard/subscription";
        if (!store.is_subscribed && !isSubscriptionPage) {
          router.push("/dashboard/subscription");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [pathname, router]);

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center text-ink/60">در حال بررسی دسترسی...</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}