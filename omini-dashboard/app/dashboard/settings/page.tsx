"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";

export default function SettingsPage() {
  const [businessInfo, setBusinessInfo] = useState("");
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingToken, setSavingToken] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [tokenMessage, setTokenMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    apiFetch("/stores/me")
      .then((res) => res.json())
      .then((data) => {
        setBusinessInfo(data.business_info ?? "");
        setTelegramConnected(data.telegram_connected ?? false);
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function saveBusinessInfo() {
    setSavingInfo(true);
    setInfoMessage("");

    try {
      const res = await apiFetch("/stores/me/business-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_info: businessInfo }),
      });

      if (!res.ok) throw new Error();
      setInfoMessage("اطلاعات کسب‌وکار با موفقیت ذخیره شد");
    } catch {
      setInfoMessage("خطا در ذخیره اطلاعات");
    } finally {
      setSavingInfo(false);
    }
  }

  async function saveTelegramToken() {
    setSavingToken(true);
    setTokenMessage("");

    try {
      const res = await apiFetch("/stores/me/telegram-token", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegram_bot_token: telegramToken }),
      });

      if (!res.ok) throw new Error();
      setTokenMessage("بات تلگرام با موفقیت وصل شد");
      setTelegramConnected(true);
      setTelegramToken("");
    } catch {
      setTokenMessage("خطا در اتصال بات");
    } finally {
      setSavingToken(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-ink/60">در حال بارگذاری...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold text-ink">تنظیمات فروشگاه</h1>

      <section className="mb-8 rounded-xl border border-border bg-white p-6">
        <h2 className="mb-2 text-lg font-bold text-ink">اطلاعات کسب‌وکار</h2>
        <p className="mb-4 text-sm text-ink/60">
          این اطلاعات در اختیار هوش مصنوعی قرار می‌گیرد تا فقط بر اساس واقعیت فروشگاهت به مشتری‌ها جواب بده. ساعت کاری، آدرس، شرایط ارسال و مرجوعی رو کامل بنویس.
          <br />
          میتونی اطلاعات دیگه ای رو هم بدی اگر فکر میکنی میتونه برای هوش مصنوعی مفید باشه.
        </p>
        <textarea value={businessInfo} onChange={(e) => setBusinessInfo(e.target.value)} rows={6} className="w-full rounded-lg border border-border p-3 text-ink outline-none focus:border-primary" />
        <button onClick={saveBusinessInfo} disabled={savingInfo} className="mt-3 rounded-full bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
          {savingInfo ? "در حال ذخیره..." : "ذخیره اطلاعات"}
        </button>

        {infoMessage && (
          <div className="mt-3 rounded-lg bg-primary/10 p-3 text-sm text-ink">{infoMessage}</div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-white p-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">اتصال بات تلگرام</h2>
          {telegramConnected && (
            <span className="flex items-center gap-1.5 rounded-full bg-telegram/10 px-3 py-1 text-xs font-medium text-telegram">
              <span className="h-1.5 w-1.5 rounded-full bg-telegram" />
              متصل
            </span>
          )}
        </div>
        <p className="mb-4 text-sm text-ink/60">
          برای دریافت پیام‌های تلگرام، اول باید یک بات مخصوص فروشگاهت بسازی و توکنش رو اینجا وارد کنی.
        </p>

        <div className="mb-5 space-y-4 rounded-lg bg-bg p-4">
          <div>
            <p className="mb-2 text-sm font-medium text-ink">اگه بات جدید می‌سازی:</p>
            <ol className="list-inside list-decimal space-y-2 text-sm text-ink/70">
              <li>در تلگرام، دنبال کاربر <span className="font-medium text-ink">@BotFather</span> بگرد و چت رو باز کن</li>
              <li>دستور <span className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">/newbot</span> رو بفرست</li>
              <li>یک اسم برای بات انتخاب کن (مثلاً اسم فروشگاهت)</li>
              <li>یک نام کاربری انتخاب کن که به <span className="font-mono text-xs">bot</span> ختم بشه</li>
              <li>BotFather یک توکن برات می‌فرسته، همون رو کپی کن و پایین بچسبون</li>
            </ol>
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-2 text-sm font-medium text-ink">اگه از قبل بات داری:</p>
            <ol className="list-inside list-decimal space-y-2 text-sm text-ink/70">
              <li>در تلگرام، دوباره چت با <span className="font-medium text-ink">@BotFather</span> رو باز کن</li>
              <li>دستور <span className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">/mybots</span> رو بفرست</li>
              <li>از لیست، بات موردنظرت رو انتخاب کن</li>
              <li>روی <span className="font-medium text-ink">API Token</span> بزن</li>
              <li>توکنی که نشون داده می‌شه رو کپی کن و پایین بچسبون</li>
            </ol>
            <p className="mt-3 text-xs text-urgent">
              توجه: اگه این بات از قبل جای دیگه‌ای (مثلاً یک ربات دیگه) استفاده می‌شه، وصل کردنش اینجا ممکنه اون استفاده قبلی رو مختل کنه.
            </p>
          </div>
        </div>

        <input type="text" value={telegramToken} onChange={(e) => setTelegramToken(e.target.value)} placeholder="توکن بات تلگرام" className="w-full rounded-lg border border-border p-3 text-ink outline-none focus:border-primary" dir="ltr" />
        <button onClick={saveTelegramToken} disabled={savingToken || !telegramToken} className="mt-3 rounded-full bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
          {savingToken ? "در حال اتصال..." : telegramConnected ? "بروزرسانی بات" : "اتصال بات"}
        </button>

        {tokenMessage && (
          <div className="mt-3 rounded-lg bg-primary/10 p-3 text-sm text-ink">{tokenMessage}</div>
        )}
      </section>
    </div>
  );
}