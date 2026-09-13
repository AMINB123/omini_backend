"use client";

import { useRouter, usePathname } from "next/navigation";
import Logo from "./Logo";

const navItems = [
  { href: "/dashboard", label: "پیام‌ها", icon: "💬" },
  { href: "/dashboard/analytics", label: "تحلیل و آمار", icon: "📊" },
  { href: "/dashboard/subscription", label: "اشتراک", icon: "💳" },
  { href: "/dashboard/settings", label: "تنظیمات", icon: "⚙️" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-l border-border bg-white">
      <div className="border-b border-border px-6 py-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const baseClass = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition";
          const activeClass = isActive ? "bg-primary text-white" : "text-ink/70 hover:bg-bg hover:text-ink";
          const linkClass = baseClass + " " + activeClass;

          return (
            <a key={item.href} href={item.href} className={linkClass}>
              <span>{item.icon}</span>
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={handleLogout}
          className="w-full rounded-lg px-3 py-2.5 text-right text-sm text-ink/70 hover:bg-bg hover:text-urgent"
        >
          خروج از حساب
        </button>
      </div>
    </aside>
  );
}