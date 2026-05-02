"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface WechatStatus {
  configured: boolean;
  missing: string[];
}

function readNextPath() {
  if (typeof window === "undefined") {
    return "/dashboard";
  }

  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wechatStatus, setWechatStatus] = useState<WechatStatus | null>(null);
  const nextPath = useMemo(readNextPath, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryError = params.get("error");
    if (queryError === "wechat_not_configured") {
      setError("微信扫码登录尚未配置真实开放平台参数，可先使用邮箱登录。");
    } else if (queryError === "wechat_state_invalid") {
      setError("微信登录状态已过期，请重新扫码。");
    } else if (queryError === "wechat_login_failed") {
      setError("微信登录未完成，请稍后重试或使用邮箱登录。");
    }

    fetch("/api/auth/wechat/status")
      .then((response) => response.json())
      .then((payload: WechatStatus) => setWechatStatus(payload))
      .catch(() => setWechatStatus({ configured: false, missing: [] }));
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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

  const wechatConfigured = wechatStatus?.configured ?? false;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-center">
          <Link href="/" className="text-2xl font-bold text-teal-700">
            荣旺健康
          </Link>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-slate-950">
            登录后保存 AI 评估报告
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
            匿名评估继续开放。登录只用于保存报告、回看历史、后续打通公众号、小程序和网站身份。
          </p>
          <div className="mt-8 grid gap-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              微信扫码登录启用后，会通过 UNIONID 合并同一用户的多端身份。
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              报告保存为快照，后续推荐规则更新不会改写旧报告。
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="space-y-3">
            {wechatConfigured ? (
              <Link
                href={`/auth/wechat?next=${encodeURIComponent(nextPath)}`}
                className="flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                微信扫码登录
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="w-full rounded-full border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-400"
              >
                微信扫码登录待配置
              </button>
            )}
            {!wechatConfigured && (
              <p className="text-center text-xs text-slate-400">
                需要配置 WECHAT_OPEN_APPID / WECHAT_OPEN_SECRET / 回调地址后开启。
              </p>
            )}
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>或使用邮箱</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                placeholder="至少 8 位"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "登录中..." : "登录"}
            </button>

            <div className="text-center text-sm text-slate-500">
              还没有账号？{" "}
              <Link
                href={`/auth/signup?next=${encodeURIComponent(nextPath)}`}
                className="font-semibold text-teal-700 hover:underline"
              >
                创建账号
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
