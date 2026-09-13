"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body = new URLSearchParams();
      body.append("username", email);
      body.append("password", password);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!response.ok) {
        throw new Error("ایمیل یا رمز عبور اشتباه است");
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-6 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-border bg-white p-8 shadow-sm"
      >
        <h1 className="mb-1 text-2xl font-bold text-ink">ورود به Omini</h1>
        <p className="mb-6 text-sm text-ink/60">
          برای دیدن پیام‌های فروشگاهت وارد شو
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-urgent/10 p-3 text-sm text-urgent">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1.5 block text-sm text-ink/70">ایمیل</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-border px-3 py-2.5 text-ink outline-none focus:border-primary"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-sm text-ink/70">رمز عبور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-border px-3 py-2.5 text-ink outline-none focus:border-primary"
          />
        </div>

        <div className="mb-4 text-left">
          <a href="/forgot-password" className="text-sm text-primary hover:underline">
            رمز عبور را فراموش کرده‌اید؟
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary py-2.5 font-medium text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "در حال ورود..." : "ورود"}
        </button>

        <p className="mt-6 text-center text-sm text-ink/60">
          حساب نداری؟{" "}
          <a href="/register" className="font-medium text-primary hover:underline">
            ثبت‌نام کن
          </a>
        </p>
      </form>
    </div>
  );
}