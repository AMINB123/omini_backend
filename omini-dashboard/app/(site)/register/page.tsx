"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "خطایی در ثبت‌نام رخ داد");
      }

      router.push("/login");
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
        <h1 className="mb-1 text-2xl font-bold text-ink">ثبت‌نام در Omini</h1>
        <p className="mb-6 text-sm text-ink/60">
          فروشگاهت رو بساز و پیام‌هات رو یه‌جا مدیریت کن
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-urgent/10 p-3 text-sm text-urgent">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1.5 block text-sm text-ink/70">نام فروشگاه</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-border px-3 py-2.5 text-ink outline-none focus:border-primary"
          />
        </div>

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
            minLength={8}
            className="w-full rounded-lg border border-border px-3 py-2.5 text-ink outline-none focus:border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary py-2.5 font-medium text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
        </button>

        <p className="mt-6 text-center text-sm text-ink/60">
          حساب داری؟{" "}
          <a href="/login" className="font-medium text-primary hover:underline">
            وارد شو
          </a>
        </p>
      </form>
    </div>
  );
}