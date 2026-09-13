"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );
      const data = await res.json();
      setMessage(data.message);
    } catch {
      setMessage("خطایی رخ داد، دوباره تلاش کنید");
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
        <h1 className="mb-1 text-2xl font-bold text-ink">فراموشی رمز عبور</h1>
        <p className="mb-6 text-sm text-ink/60">
          ایمیلت رو وارد کن تا لینک بازیابی رو برات بفرستیم
        </p>

        {message && (
          <div className="mb-4 rounded-lg bg-primary/10 p-3 text-sm text-ink">
            {message}
          </div>
        )}

        <div className="mb-6">
          <label className="mb-1.5 block text-sm text-ink/70">ایمیل</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-border px-3 py-2.5 text-ink outline-none focus:border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary py-2.5 font-medium text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "در حال ارسال..." : "ارسال لینک بازیابی"}
        </button>

        <p className="mt-6 text-center text-sm text-ink/60">
          <a href="/login" className="font-medium text-primary hover:underline">
            بازگشت به ورود
          </a>
        </p>
      </form>
    </div>
  );
}