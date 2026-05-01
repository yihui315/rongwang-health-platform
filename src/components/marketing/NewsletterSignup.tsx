"use client";

import { useState } from "react";
import { trackNewsletterSignup } from "@/components/layout/Analytics";

interface NewsletterSignupProps {
  variant?: "inline" | "footer" | "popup";
  onSuccess?: () => void;
}

export default function NewsletterSignup({ variant = "inline", onSuccess }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("订阅成功，感谢关注荣旺健康。");
        setEmail("");
        trackNewsletterSignup(email);
        onSuccess?.();
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "订阅失败，请稍后重试。");
      }
    } catch {
      setStatus("error");
      setMessage("网络异常，请稍后重试。");
    }
  };

  if (variant === "footer") {
    return (
      <div className="w-full">
        <h4 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">健康资讯订阅</h4>
        <p className="mb-3 text-sm leading-6 text-[var(--text-secondary)]">
          每周精选健康科普、评估提醒和会员服务更新。
        </p>
        {status === "success" ? (
          <p className="text-sm font-medium text-[var(--teal-dark)]">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              required
              className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--ring-focus)]"
            />
            <button type="submit" disabled={status === "loading"} className="btn-primary whitespace-nowrap px-4 py-2">
              {status === "loading" ? "..." : "订阅"}
            </button>
          </form>
        )}
        {status === "error" ? <p className="mt-2 text-xs text-red-600">{message}</p> : null}
      </div>
    );
  }

  if (variant === "popup") {
    return (
      <div className="text-center">
        <h3 className="mb-2 text-xl font-bold text-[var(--text-primary)]">订阅荣旺健康资讯</h3>
        <p className="mb-4 text-sm leading-6 text-[var(--text-secondary)]">
          获取健康科普、新品通知和会员服务更新。
        </p>
        {status === "success" ? (
          <div className="py-4">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#e8f5f1]">
              <svg className="h-6 w-6 text-[var(--teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-medium text-[var(--teal-dark)]">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="请输入邮箱"
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--ring-focus)]"
            />
            <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
              {status === "loading" ? "提交中..." : "订阅健康资讯"}
            </button>
          </form>
        )}
        {status === "error" ? <p className="mt-2 text-xs text-red-600">{message}</p> : null}
        <p className="mt-3 text-xs text-[var(--text-muted)]">我们尊重你的隐私，可随时取消订阅。</p>
      </div>
    );
  }

  return (
    <section className="border-y border-[var(--border-subtle)] bg-[var(--surface)]">
      <div className="section-container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">订阅荣旺健康周刊</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            每周一封，精选健康科普和评估提醒。
          </p>
        </div>
        {status === "success" ? (
          <p className="font-medium text-[var(--teal-dark)]">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full gap-3 md:w-auto">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              required
              className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--ring-focus)] md:w-72"
            />
            <button type="submit" disabled={status === "loading"} className="btn-primary whitespace-nowrap">
              {status === "loading" ? "..." : "免费订阅"}
            </button>
          </form>
        )}
        {status === "error" ? <p className="text-xs text-red-600">{message}</p> : null}
      </div>
    </section>
  );
}
