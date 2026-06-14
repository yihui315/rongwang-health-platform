"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function MarketingLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPath = useMemo(() => {
    if (typeof window === "undefined") return "/marketing";
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    return next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/marketing";
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/marketing/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "登录失败");
        return;
      }
      router.push(nextPath);
    } catch {
      setError("网络异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-2xl">📊</span>
            <span className="text-xl font-bold text-white">荣旺健康</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">营销系统登录</h1>
          <p className="mt-2 text-sm text-slate-400">
            仅限内部员工访问
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-7 shadow-xl">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300">
                访问密码
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                placeholder="输入营销系统密码"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-950/50 px-4 py-3 text-sm text-rose-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "登录中..." : "进入营销系统"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          如需开通权限，请联系管理员
        </p>
      </div>
    </main>
  );
}