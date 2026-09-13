"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";

interface Message {
  id: number;
  platform: string;
  sender_id: string;
  content: string;
  category: string | null;
  is_urgent: boolean;
  auto_replied: boolean;
  is_from_store: boolean;
  created_at: string;
}

interface Conversation {
  id: number;
  platform: string;
  sender_id: string;
  converted_to_sale: boolean;
  last_message_at: string;
  messages: Message[];
}

const platformStyles: Record<string, { label: string; dot: string; border: string; tint: string }> = {
  instagram: { label: "اینستاگرام", dot: "bg-instagram", border: "border-instagram", tint: "bg-instagram/10" },
  whatsapp: { label: "واتساپ", dot: "bg-whatsapp", border: "border-whatsapp", tint: "bg-whatsapp/10" },
  telegram: { label: "تلگرام", dot: "bg-telegram", border: "border-telegram", tint: "bg-telegram/10" },
};

function CustomerAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/10">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill="currentColor" className="text-ink/50" />
        <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink/50" />
      </svg>
    </div>
  );
}

function AiAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ai/15">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 2 L14 9 L21 11 L14 13 L12 20 L10 13 L3 11 L10 9 Z" fill="currentColor" className="text-ai" />
      </svg>
    </div>
  );
}

function StoreAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M4 8 L4 19 L20 19 L20 8 L12 4 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="text-primary" />
        <path d="M9 19 L9 13 L15 13 L15 19" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="text-primary" />
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [sendingReply, setSendingReply] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    loadConversations();
  }, [router]);

  function loadConversations() {
    apiFetch("/conversations/")
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت مکالمات");
        return res.json();
      })
      .then((data) => setConversations(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  async function sendReply(conversationId: number) {
    const content = replyDrafts[conversationId];
    if (!content || !content.trim()) return;

    setSendingReply(conversationId);

    try {
      const res = await apiFetch(`/conversations/${conversationId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.detail ?? "خطا در ارسال پاسخ");
        return;
      }

      const updated = await res.json();
      setConversations((prev) => prev.map((c) => (c.id === conversationId ? updated : c)));
      setReplyDrafts((prev) => ({ ...prev, [conversationId]: "" }));
    } finally {
      setSendingReply(null);
    }
  }

  const filteredConversations =
    filter === "all" ? conversations : conversations.filter((c) => c.platform === filter);

  if (loading) {
    return <div className="p-8 text-center text-ink/60">در حال بارگذاری...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">مکالمات شما</h1>

        <div className="flex gap-2">
          <button onClick={() => setFilter("all")} className={filterButtonClass(filter === "all")}>همه</button>
          <button onClick={() => setFilter("telegram")} className={filterButtonClass(filter === "telegram")}>تلگرام</button>
          <button onClick={() => setFilter("whatsapp")} className={filterButtonClass(filter === "whatsapp")}>واتساپ</button>
          <button onClick={() => setFilter("instagram")} className={filterButtonClass(filter === "instagram")}>اینستاگرام</button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredConversations.map((conv) => {
          const platform = platformStyles[conv.platform] ?? { label: conv.platform, dot: "bg-ink/30", border: "border-ink/30", tint: "bg-bg" };
          const hasUrgent = conv.messages.some((m) => m.is_urgent);

          return (
            <div key={conv.id} className={`rounded-2xl border-r-4 bg-white p-5 shadow-sm ${platform.border}`}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${platform.dot}`} />
                  <span className="text-sm font-semibold text-ink/80">{platform.label}</span>
                  <span className="text-xs text-ink/40">·</span>
                  <span className="text-xs text-ink/40">{conv.sender_id}</span>
                </div>

                <div className="flex items-center gap-2">
                  {hasUrgent && (
                    <span className="rounded-full bg-urgent/10 px-3 py-1 text-xs font-medium text-urgent">فوری</span>
                  )}
                  {conv.converted_to_sale && (
                    <span className="rounded-full bg-whatsapp/10 px-3 py-1 text-xs font-medium text-whatsapp">
                      ✓ منجر به خرید شد
                    </span>
                  )}
                </div>
              </div>

              <div className={`space-y-3 rounded-xl p-3 ${platform.tint}`}>
                {conv.messages.map((msg) => (
                  <div key={msg.id} className={`flex items-end gap-2 ${msg.is_from_store ? "flex-row-reverse" : ""}`}>
                    {msg.is_from_store ? (msg.auto_replied ? <AiAvatar /> : <StoreAvatar />) : <CustomerAvatar />}

                    <div className={`max-w-[75%] ${msg.is_from_store ? "text-left" : "text-right"}`}>
                      <span
                        className={
                          msg.is_from_store
                            ? "inline-block rounded-2xl rounded-tl-sm bg-primary px-3.5 py-2 text-sm text-white shadow-sm"
                            : "inline-block rounded-2xl rounded-tr-sm bg-white px-3.5 py-2 text-sm text-ink shadow-sm"
                        }
                      >
                        {msg.content}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={replyDrafts[conv.id] ?? ""}
                  onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [conv.id]: e.target.value }))}
                  placeholder="پاسخ خود را بنویسید..."
                  className="flex-1 rounded-full border border-border px-4 py-2 text-sm text-ink outline-none focus:border-primary"
                />
                <button
                  onClick={() => sendReply(conv.id)}
                  disabled={sendingReply === conv.id}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {sendingReply === conv.id ? "..." : "ارسال"}
                </button>
              </div>
            </div>
          );
        })}

        {filteredConversations.length === 0 && (
          <p className="py-12 text-center text-ink/50">مکالمه‌ای برای نمایش وجود ندارد.</p>
        )}
      </div>
    </div>
  );
}

function filterButtonClass(active: boolean) {
  const base = "rounded-full px-4 py-1.5 text-sm transition";
  const activeStyle = active ? "bg-primary text-white" : "border border-border text-ink/70 hover:bg-bg";
  return base + " " + activeStyle;
}