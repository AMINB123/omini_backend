"use client";

import { useState } from "react";
import Logo from "./Logo";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-bg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="/">
          <Logo />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a href="/#features" className="text-sm text-ink/70 hover:text-ink">
            امکانات
          </a>
          <a href="/#pricing" className="text-sm text-ink/70 hover:text-ink">
            تعرفه‌ها
          </a>
          <a href="/login" className="text-sm text-ink/70 hover:text-ink">
            ورود
          </a>

          <a href="/register" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark">
            ثبت‌نام رایگان
          </a>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="باز کردن منو"
        >
          <span className="h-0.5 w-6 bg-ink" />
          <span className="h-0.5 w-6 bg-ink" />
          <span className="h-0.5 w-6 bg-ink" />
        </button>
      </nav>

      {menuOpen && (
        <div className="flex flex-col gap-4 border-t border-border px-6 py-4 md:hidden">
          <a href="/#features" className="text-sm text-ink/70">
            امکانات
          </a>
          <a href="/#pricing" className="text-sm text-ink/70">
            تعرفه‌ها
          </a>
          <a href="/login" className="text-sm text-ink/70">
            ورود
          </a>
          
          <a href="/register" className="rounded-full bg-primary px-5 py-2 text-center text-sm font-medium text-white">
            ثبت‌نام رایگان
          </a>
        </div>
      )}
    </header>
  );
}