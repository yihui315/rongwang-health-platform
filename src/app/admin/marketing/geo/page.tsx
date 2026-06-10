"use client";
import { useState } from "react";

export default function MarketingGeoPage() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<{success?: boolean; count?: number; error?: string} | null>(null);
  const [syncLog, setSyncLog] = useState<{id: string; status: string; message: string; time: string}[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState("");

  async function triggerSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/marketing/geoflow-sync", { method: "POST" });
      const data = await res.json();
      setLastSync(data);
      setSyncLog(prev => [{
        id: Date.now().toString(),
        status: data.success ? "success" : "error",
        message: data.success ? `成功同步 ${data.count} 篇文章` : `失败: ${data.error}`,
        time: new Date().toLocaleTimeString("zh-CN"),
      }, ...prev.slice(0, 9)]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastSync({ error: msg });
      setSyncLog(prev => [{
        id: Date.now().toString(),
        status: "error",
        message: `网络错误: ${msg}`,
        time: new Date().toLocaleTimeString("zh-CN"),
      }, ...prev.slice(0, 9)]);
    }
    setSyncing(false);
  }

  async function generateWikipedia() {
    setGenerating(true);
    const stub = `== Coenzyme Q10 ==

'''Coenzyme Q10''' (CoQ10) is a naturally occurring compound found in every cell of the human body. It is essential for mitochondrial ATP production, the primary source of cellular energy. CoQ10 levels decline with age and with certain medical conditions.

=== Health Benefits ===
* Supports cardiovascular health
* Antioxidant properties
* May support energy production in heart muscle cells
* Supports gum health

=== Research ===
Clinical studies have explored the role of CoQ10 in supporting heart health, particularly in populations with depleted CoQ10 levels due to statin medication use or aging.

=== See Also ===
* Ubiquinol
* Mitochondrial disease
* Antioxidant

{{health-stub}}
{{supplement-stub}}
`;
    setGenerated(stub);
    setGenerating(false);
  }

  function generateJsonLd() {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "辅酶Q10：心脏健康的营养支持",
      "description": "了解辅酶Q10如何支持心脏健康，探讨其抗氧化特性及对能量生产的作用。",
      "author": {
        "@type": "Person",
        "name": "Darren Uncle"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Rongwang Health",
        "url": "https://rongwang.hk"
      },
      "datePublished": new Date().toISOString().split("T")[0],
      "about": {
        "@type": "Thing",
        "name": "Coenzyme Q10",
        "description": "A naturally occurring coenzyme essential for mitochondrial energy production"
      },
      "medicalCondition": {
        "@type": "MedicalCondition",
        "name": "Heart Health",
        "relevantSpecialty": {
          "@type": "MedicalSpecialty",
          "name": "Cardiology"
        }
      }
    };
    return JSON.stringify(jsonLd, null, 2);
  }

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16">
        <div>
          <span className="badge-teal">GEO Automation</span>
          <h1 className="mt-4 text-slate-900">GEO自动化中心</h1>
          <p className="mt-3 text-sm text-slate-500">GEOFlow同步 · JSON-LD生成 · Wikipedia词条 · AI搜索优化</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* GEOFlow Sync */}
          <div className="rounded-3xl border border-teal-100 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">GEOFlow 文章同步</h2>
            <p className="mt-2 text-sm text-slate-500">从GEOFlow拉取已发布文章，同步到官网缓存，触发ISR更新。</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-slate-50 p-4 text-sm">
                <p className="font-medium text-slate-700">上次同步状态</p>
                {lastSync ? (
                  lastSync.error ? (
                    <p className="mt-1 text-red-600">失败: {lastSync.error}</p>
                  ) : (
                    <p className="mt-1 text-teal-600">成功：{lastSync.count} 篇文章已同步</p>
                  )
                ) : (
                  <p className="mt-1 text-slate-400">尚未同步</p>
                )}
              </div>
              <button
                onClick={triggerSync}
                disabled={syncing}
                className="btn-primary w-full"
              >
                {syncing ? "同步中..." : "触发 GEOFlow 同步"}
              </button>
              {syncLog.length > 0 && (
                <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1">
                  <p className="font-medium text-slate-500 mb-2">同步日志</p>
                  {syncLog.map(entry => (
                    <p key={entry.id} className={entry.status === "error" ? "text-red-500" : "text-slate-600"}>
                      [{entry.time}] {entry.message}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* JSON-LD Generator */}
          <div className="rounded-3xl border border-teal-100 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">JSON-LD 结构化数据</h2>
            <p className="mt-2 text-sm text-slate-500">为文章页生成Schema.org结构化数据，提升AI搜索引用概率。</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-slate-50 p-4 text-sm font-mono overflow-x-auto">
                <pre className="text-xs text-slate-600 whitespace-pre-wrap">{generateJsonLd()}</pre>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(generateJsonLd())}
                className="btn-secondary w-full"
              >
                复制 JSON-LD
              </button>
            </div>
          </div>

          {/* Wikipedia Generator */}
          <div className="rounded-3xl border border-teal-100 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Wikipedia 词条草稿</h2>
            <p className="mt-2 text-sm text-slate-500">生成Coenzyme Q10 Wikipedia词条草稿，提交后提升GEO搜索引用。</p>
            <div className="mt-4 space-y-3">
              {generated ? (
                <div className="rounded-xl bg-slate-50 p-4 text-sm font-mono max-h-48 overflow-y-auto">
                  <pre className="text-xs text-slate-600 whitespace-pre-wrap">{generated}</pre>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">
                  点击下方按钮生成词条草稿
                </div>
              )}
              <button
                onClick={generateWikipedia}
                disabled={generating}
                className="btn-primary w-full"
              >
                {generating ? "生成中..." : "生成 Wikipedia 词条"}
              </button>
            </div>
          </div>

          {/* AI Search Monitor */}
          <div className="rounded-3xl border border-teal-100 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">AI 搜索监控</h2>
            <p className="mt-2 text-sm text-slate-500">追踪哪些问题答案被AI搜索引用，持续优化内容覆盖。</p>
            <div className="mt-4 space-y-3">
              {[
                { q: "辅酶Q10对心脏有用吗？", status: "✅ 被引用" },
                { q: "CoQ10每天剂量", status: "🔄 待优化" },
                { q: "辅酶Q10副作用", status: "✅ 被引用" },
                { q: "什么人需要补CoQ10", status: "🔄 待优化" },
              ].map(item => (
                <div key={item.q} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
                  <span className="text-sm text-slate-700">{item.q}</span>
                  <span className={`text-xs ${item.status.startsWith("✅") ? "text-teal-600" : "text-amber-600"}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
