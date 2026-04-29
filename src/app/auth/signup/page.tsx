"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function readNextPath() {
  if (typeof window === "undefined") {
    return "/dashboard";
  }

  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const nextPath = useMemo(readNextPath, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage({ type: "err", text: data.error ?? "注册失败" });
        return;
      }
      setMessage({ type: "ok", text: data.message ?? "注册成功" });
      router.push(nextPath);
    } catch {
      setMessage({ type: "err", text: "网络异常，请稍后重试" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-teal-700">
            荣旺健康
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-slate-900">创建健康档案账号</h1>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            用于保存 AI 评估报告和后续多端身份合并。
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-slate-700">邮箱</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">密码</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              placeholder="至少 8 位"
            />
          </div>

          {message && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                message.type === "ok"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
          >
            {loading ? "创建中..." : "创建账号"}
          </button>

          <div className="text-center text-sm text-slate-500">
            已有账号？{" "}
            <Link
              href={`/auth/login?next=${encodeURIComponent(nextPath)}`}
              className="font-semibold text-teal-700 hover:underline"
            >
              去登录
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
