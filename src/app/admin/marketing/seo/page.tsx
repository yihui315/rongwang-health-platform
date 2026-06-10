"use client";
import { useState, useEffect } from "react";

interface SeoReport {
  id: string;
  postId: string;
  title: string;
  score: number;
  keywords: string[];
  issues: Array<{ severity: string; message: string; field: string }>;
  suggestions: string[];
  jsonLdStatus: string;
  wikipediaStatus: string;
  createdAt: string;
}

interface MarketingPost {
  id: string;
  title: string;
  platform: string;
  status: string;
  seoScore: number | null;
}

export default function MarketingSeoPage() {
  const [reports, setReports] = useState<SeoReport[]>([]);
  const [posts, setPosts] = useState<MarketingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<SeoReport | null>(null);

  async function fetchData() {
    setLoading(true);
    const [postsRes, reportsRes] = await Promise.all([
      fetch("/api/marketing/posts"),
      fetch("/api/marketing/seo"),
    ]);
    const postsData = await postsRes.json();
    const reportsData = await reportsRes.json();
    setPosts(postsData.posts || []);
    setReports(reportsData.reports || []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  async function generateReport(postId: string) {
    const res = await fetch("/api/marketing/seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    if (res.ok) fetchData();
  }

  const scoreColor = (s: number) => s >= 80 ? "text-teal-600" : s >= 60 ? "text-amber-600" : "text-red-600";
  const scoreBg = (s: number) => s >= 80 ? "bg-teal-50 border-teal-200" : s >= 60 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge-teal">SEO Center</span>
            <h1 className="mt-4 text-slate-900">SEO优化中心</h1>
            <p className="mt-3 text-sm text-slate-500">批量生成SEO报告，追踪所有文章搜索优化状态。</p>
          </div>
         <button onClick={() => fetchData()} className="btn-secondary">刷新数据</button>
        </div>

        {/* 未评分文章 →快速生成 */}
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">待生成SEO报告的文章</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {posts.filter(p => !p.seoScore && p.status !== "draft").map(post => (
              <div key={post.id} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 truncate">{post.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{post.platform} · {post.status}</p>
                </div>
                <button onClick={() => generateReport(post.id)} className="btn-primary shrink-0 text-xs px-3 py-1.5">
                  生成报告
                </button>
              </div>
            ))}
            {posts.filter(p => !p.seoScore && p.status !== "draft").length === 0 && (
              <p className="col-span-full text-center text-slate-400 py-6">所有文章已生成SEO报告</p>
            )}
          </div>
        </div>

        {/* 报告列表 */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-6 py-4 font-medium text-slate-500">标题</th>
                <th className="px-6 py-4 font-medium text-slate-500">SEO评分</th>
                <th className="px-6 py-4 font-medium text-slate-500">JSON-LD</th>
                <th className="px-6 py-4 font-medium text-slate-500">Wikipedia</th>
                <th className="px-6 py-4 font-medium text-slate-500">问题数</th>
               <th className="px-6 py-4 font-medium text-slate-500">时间</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">加载中...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">暂无报告，先为文章生成报告</td></tr>
              ) : reports.map(r => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer"
                  onClick={() => setSelectedReport(r)}>
                  <td className="px-6 py-4 text-slate-900 truncate max-w-[200px]">{r.title}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${scoreColor(r.score)}`}>{r.score}</span>
                    <span className="text-slate-400 text-xs">/100</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge-slate ${r.jsonLdStatus === "present" ? "badge-teal" : "badge-slate"}`}>
                      {r.jsonLdStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge-slate ${r.wikipediaStatus === "done" ? "badge-teal" : "badge-slate"}`}>
                      {r.wikipediaStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{r.issues.length}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(r.createdAt).toLocaleDateString("zh-CN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 报告详情弹窗 */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedReport(null)}>
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">SEO报告详情</h3>
                <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className={`rounded-2xl border p-4 mb-4 text-center ${scoreBg(selectedReport.score)}`}>
                <p className="text-4xl font-bold text-slate-900">{selectedReport.score}</p>
                <p className="mt-1 text-sm text-slate-500">SEO 健康度评分</p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-700 mb-2">关键词</p>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.keywords.map(k => (
                    <span key={k} className="rounded-full bg-teal-50 border border-teal-200 px-3 py-0.5 text-xs text-teal-700">{k}</span>
                  ))}
                </div>
              </div>
              {selectedReport.issues.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">问题 ({selectedReport.issues.length})</p>
                  <div className="space-y-2">
                    {selectedReport.issues.map((issue, i) => (
                      <div key={i} className={`rounded-xl border px-3 py-2 text-sm ${
                        issue.severity === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}>
                        <span className="font-medium">{issue.severity === "error" ?"❌ 错误" : "⚠️ 警告"}</span>
                        <span className="ml-2">{issue.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedReport.suggestions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">优化建议</p>
                  <div className="space-y-2">
                    {selectedReport.suggestions.map((s, i) => (
                      <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        💡 {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}