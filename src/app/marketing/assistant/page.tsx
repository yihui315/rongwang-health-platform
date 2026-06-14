"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface GenerationRequest {
  channel: string;
  topic: string;
  product?: string;
  audience?: string;
  tone?: string;
  keywords?: string[];
}

interface GenerationResult {
  title: string;
  content: string;
  hashtags: string[];
  suggestedImage: string;
  channel: string;
  tips: string[];
  warnings: string[];
  complianceNotes: string;
}

interface ContentIdea {
  topic: string;
  channel: string;
  angle: string;
  cta: string;
}

const channelOptions = [
  { value: "wechat", label: "💚 微信公众号", desc: "长文科普、干货分享、案例故事" },
  { value: "xiaohongshu", label: "🔴 小红书", desc: "种草笔记、生活方式、真实体验" },
  { value: "zhihu", label: "🔵 知乎", desc: "深度问答、专业分析、科学背书" },
  { value: "douyin", label: "🎵 抖音", desc: "短视频脚本、口播文案、场景化内容" },
  { value: "seo_article", label: "📄 SEO文章", desc: "长尾关键词文章、搜索友好内容" },
  { value: "email", label: "📧 邮件", desc: "营销邮件、评估跟进、教育序列" },
];

const toneOptions = [
  { value: "professional", label: "专业严谨", desc: "适合知乎、SEO文章" },
  { value: "warm", label: "温暖亲和", desc: "适合公众号、小红书" },
  { value: "casual", label: "轻松活泼", desc: "适合抖音、小红书" },
  { value: "authoritative", label: "权威专家", desc: "适合公众号深度文章" },
];

const sampleTopics: ContentIdea[] = [
  { topic: "AKK益生菌改善肠道健康", channel: "wechat", angle: "科学前沿：肠道菌群与代谢健康", cta: "做 AI 评估了解适合你的肠道调理方案" },
  { topic: "熬夜应酬护肝指南", channel: "xiaohongshu", angle: "商务人群健康自救指南", cta: "护肝组合 + AI 评估" },
  { topic: "NAD+抗衰原理解析", channel: "zhihu", angle: "从细胞能量角度解析抗衰", cta: "内调抗衰方案评估" },
  { topic: "女性内分泌调理", channel: "douyin", angle: "女性健康常见的3个误区", cta: "AI 健康评估" },
  { topic: "儿童脑部发育营养", channel: "xiaohongshu", angle: "妈妈们最关心的营养问题", cta: "儿童脑部营养方案" },
];

export default function MarketingAssistantPage() {
  const [step, setStep] = useState<"form" | "generating" | "result">("form");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState<GenerationRequest>({
    channel: "wechat",
    topic: "",
    product: "",
    audience: "",
    tone: "warm",
    keywords: [],
  });

  const [keywordInput, setKeywordInput] = useState("");

  function addKeyword() {
    const kw = keywordInput.trim();
    if (kw && !form.keywords?.includes(kw)) {
      setForm((f) => ({ ...f, keywords: [...(f.keywords ?? []), kw] }));
    }
    setKeywordInput("");
  }

  function removeKeyword(kw: string) {
    setForm((f) => ({ ...f, keywords: (f.keywords ?? []).filter((k) => k !== kw) }));
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.topic.trim()) return;

    setStep("generating");
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/marketing/content-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: form.channel,
          topic: form.topic,
          product: form.product || undefined,
          audience: form.audience || undefined,
          tone: form.tone || undefined,
          keywords: form.keywords?.length ? form.keywords : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "生成失败，请稍后重试");
        setStep("form");
        return;
      }

      setResult(data);
      setStep("result");
    } catch {
      setError("网络异常，请检查 API 配置");
      setStep("form");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function startOver() {
    setStep("form");
    setResult(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center gap-3">
            <Link href="/marketing" className="text-sm text-slate-500 hover:text-slate-700">← 营销中枢</Link>
            <span className="text-slate-300">/</span>
            <h1 className="text-xl font-bold text-slate-900">🤖 AI 营销助手</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">输入产品/场景信息，AI 生成完整的营销文案和配图建议</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Generating State */}
        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl animate-pulse">🤖</div>
            <div className="mt-6 text-lg font-medium text-slate-700">AI 正在生成营销内容...</div>
            <div className="mt-2 text-sm text-slate-500">通常需要 10-30 秒，请稍候</div>
            <div className="mt-4 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <div className="font-medium text-slate-700 mb-2">生成参数</div>
              <div>平台：{channelOptions.find((c) => c.value === form.channel)?.label}</div>
              <div>主题：{form.topic}</div>
              {form.product && <div>产品：{form.product}</div>}
            </div>
          </div>
        )}

        {/* Result State */}
        {step === "result" && result && (
          <div className="space-y-6">
            {/* Compliance Notes */}
            {result.complianceNotes && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <div className="font-semibold mb-1">⚠️ 合规提示</div>
                {result.complianceNotes}
              </div>
            )}

            {/* Warnings */}
            {result.warnings && result.warnings.length > 0 && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <div className="font-semibold mb-1">🚫 需要修改的内容</div>
                <ul className="list-disc list-inside space-y-1">
                  {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}

            {/* Title */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-500 mb-1">推荐标题</div>
                  <div className="text-xl font-bold text-slate-900">{result.title}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(result.title)}
                  className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  {copied ? "已复制 ✓" : "复制"}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-slate-500">生成内容</div>
                <button
                  onClick={() => copyToClipboard(result.content)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  {copied ? "已复制 ✓" : "复制全文"}
                </button>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{result.content}</div>
            </div>

            {/* Hashtags */}
            {result.hashtags && result.hashtags.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="text-sm font-semibold text-slate-500 mb-3">推荐 Hashtags</div>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((tag) => (
                    <span key={tag} className="rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-700">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {result.tips && result.tips.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="text-sm font-semibold text-slate-500 mb-3">内容优化建议</div>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-0.5 text-teal-600">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Image */}
            {result.suggestedImage && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="text-sm font-semibold text-slate-500 mb-3">配图建议</div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                  {result.suggestedImage}
                </div>
              </div>
            )}

            {/* CTA Prompt for Content Center */}
            <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 p-6 text-white">
              <div className="font-semibold mb-2">快速发布</div>
              <p className="text-sm text-teal-100 mb-4">内容已生成，现在可以创建帖子并发布到对应平台</p>
              <div className="flex gap-3">
                <button
                  onClick={startOver}
                  className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
                >
                  重新生成
                </button>
                <Link
                  href="/marketing/content"
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                >
                  前往内容中心 →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Form State */}
        {step === "form" && (
          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Error */}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            )}

            {/* Channel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="font-semibold text-slate-700 mb-3">选择发布平台</div>
              <div className="grid gap-3 md:grid-cols-2">
                {channelOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      form.channel === opt.value
                        ? "border-teal-500 bg-teal-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="channel"
                      value={opt.value}
                      checked={form.channel === opt.value}
                      onChange={() => setForm((f) => ({ ...f, channel: opt.value }))}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-medium text-slate-900">{opt.label}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="font-semibold text-slate-700 mb-3">内容主题 <span className="text-rose-500">*</span></div>
              <textarea
                required
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-500 resize-none"
                placeholder="例如：AKK益生菌如何改善肠道代谢健康，适合久坐办公人群..."
              />

              {/* Sample Topics */}
              <div className="mt-3">
                <div className="text-xs font-medium text-slate-500 mb-2">试试这些选题：</div>
                <div className="flex flex-wrap gap-2">
                  {sampleTopics.map((idea) => (
                    <button
                      key={idea.topic}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, topic: idea.topic, channel: idea.channel }))}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-teal-400 hover:text-teal-700"
                    >
                      {idea.topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Fields */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="font-semibold text-slate-700 mb-3">补充信息（可选）</div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">关联产品</label>
                  <input
                    type="text"
                    value={form.product}
                    onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                    placeholder="如：AKK益生菌、护肝组合"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">目标受众</label>
                  <input
                    type="text"
                    value={form.audience}
                    onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                    placeholder="如：30-45岁商务男性"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">内容调性</label>
                <div className="flex flex-wrap gap-2">
                  {toneOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, tone: opt.value }))}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                        form.tone === opt.value
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">关键词（SEO用，可多选）</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(form.keywords ?? []).map((kw) => (
                    <span key={kw} className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-700">
                      {kw}
                      <button type="button" onClick={() => removeKeyword(kw)} className="ml-1 hover:text-teal-900">✕</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                    placeholder="输入关键词后按回车添加"
                  />
                  <button type="button" onClick={addKeyword} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">添加</button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-4 text-base font-semibold text-white shadow-lg transition hover:shadow-xl"
            >
              🤖 开始生成营销内容
            </button>
          </form>
        )}
      </div>
    </div>
  );
}