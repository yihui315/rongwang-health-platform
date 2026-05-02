"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface UserSummary {
  id: string;
  displayName: string | null;
  email: string | null;
  identityProviders: string[];
}

interface ReportSummary {
  id: string;
  consultationId: string | null;
  title: string;
  riskLevel: string;
  recommendedSolutionType: string | null;
  createdAt: string;
}

const riskLabel: Record<string, string> = {
  low: "低风险",
  medium: "中等风险",
  high: "高风险",
  urgent: "需优先就医",
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");

  const displayName = useMemo(() => {
    if (!user) {
      return "";
    }
    return user.displayName || user.email || "荣旺用户";
  }, [user]);

  async function refreshReports() {
    const response = await fetch("/api/assessment-reports");
    if (response.ok) {
      const payload = await response.json();
      setReports(Array.isArray(payload.reports) ? payload.reports : []);
    }
  }

  useEffect(() => {
    async function loadDashboard() {
      try {
        const me = await fetch("/api/auth/me").then((response) => response.json());
        if (!me.authenticated) {
          setUser(null);
          return;
        }
        setUser(me.user);
        await refreshReports();

        const params = new URLSearchParams(window.location.search);
        const pendingId =
          params.get("saveReport") || window.localStorage.getItem("rw_pending_consultation_id");
        if (pendingId) {
          const saveResponse = await fetch("/api/assessment-reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ consultationId: pendingId }),
          });
          if (saveResponse.ok) {
            window.localStorage.removeItem("rw_pending_consultation_id");
            setSaveMessage("刚刚的 AI 评估报告已保存。");
            await refreshReports();
          } else {
            setSaveMessage("未能自动保存刚刚的报告，请回到评估结果页重试。");
          }
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">
          正在加载健康档案...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="badge-teal">Dashboard</span>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">请先登录健康档案</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            匿名评估无需登录；登录后可以保存和回看 AI 评估报告。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/auth/login?next=/dashboard" className="btn-primary">
              登录
            </Link>
            <Link href="/ai-consult" className="btn-secondary">
              先做 AI 评估
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5">
          <div>
            <span className="badge-teal">Health File</span>
            <h1 className="mt-4 text-3xl font-semibold text-slate-950">{displayName} 的健康档案</h1>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              已接入自建用户库，后续可通过 UNIONID 合并公众号、小程序和网站身份。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/ai-consult" className="btn-primary">
              新 AI 评估
            </Link>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/";
              }}
              className="btn-secondary"
            >
              退出
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[0.7fr_1.3fr]">
        <aside className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">账号身份</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {user.email ?? "微信用户"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {user.identityProviders.map((provider) => (
                <span key={provider} className="badge-slate">
                  {provider}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">服务边界</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              AI 报告用于健康教育和风险提示，不替代医生诊断。高风险和紧急信号会优先提示线下就医，并关闭购买导向。
            </p>
          </div>
        </aside>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">AI 评估报告</h2>
              <p className="mt-1 text-sm text-slate-500">保存后的报告会作为快照留档备查。</p>
            </div>
            <span className="badge-slate">{reports.length} 份</span>
          </div>

          {saveMessage && (
            <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-700">
              {saveMessage}
            </div>
          )}

          <div className="mt-6 space-y-4">
            {reports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-600">还没有保存的评估报告。</p>
                <Link href="/ai-consult" className="mt-5 inline-flex btn-primary">
                  完成一次 AI 评估
                </Link>
              </div>
            ) : (
              reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/dashboard/reports/${report.id}`}
                  className="block rounded-2xl border border-slate-200 p-5 transition hover:border-teal-200 hover:bg-teal-50/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{report.title}</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {new Date(report.createdAt).toLocaleString("zh-CN")}
                      </p>
                    </div>
                    <span className="badge-slate">{riskLabel[report.riskLevel] ?? report.riskLevel}</span>
                  </div>
                  {report.recommendedSolutionType && (
                    <p className="mt-3 text-sm text-slate-600">
                      方向：{report.recommendedSolutionType}
                    </p>
                  )}
                </Link>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
