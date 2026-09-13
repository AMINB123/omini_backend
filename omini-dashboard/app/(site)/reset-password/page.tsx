"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند");
      return;
    }

    if (!token) {
      setError("لینک بازیابی نامعتبر است");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password?token=${encodeURIComponent(token)}&new_password=${encodeURIComponent(password)}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "خطایی رخ داد");
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
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
        <h1 className="mb-1 text-2xl font-bold text-ink">تنظیم رمز جدید</h1>
        <p className="mb-6 text-sm text-ink/60">رمز عبور جدیدت رو وارد کن</p>

        {error && (
          <div className="mb-4 rounded-lg bg-urgent/10 p-3 text-sm text-urgent">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-primary/10 p-3 text-sm text-ink">
            رمز عبور با موفقیت تغییر کرد، در حال انتقال به صفحه ورود...
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1.5 block text-sm text-ink/70">رمز عبور جدید</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-border px-3 py-2.5 text-ink outline-none focus:border-primary"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-sm text-ink/70">تکرار رمز عبور</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-border px-3 py-2.5 text-ink outline-none focus:border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full rounded-full bg-primary py-2.5 font-medium text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "در حال ثبت..." : "تنظیم رمز جدید"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center">در حال بارگذاری...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}