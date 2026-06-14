"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Account {
  id: string;
  platform: string;
  accountName: string;
  accountId?: string;
  createdAt: string;
}

const platformOptions = [
  { value: "wechat", label: "💚 微信公众号" },
  { value: "xiaohongshu", label: "🔴 小红书" },
  { value: "zhihu", label: "🔵 知乎" },
  { value: "douyin", label: "🎵 抖音" },
  { value: "baidu", label: "🔍 百度SEO" },
  { value: "google", label: "🌐 Google" },
  { value: "email", label: "📧 邮件" },
];

const platformInstructions: Record<string, string[]> = {
  wechat: [
    "登录 mp.weixin.qq.com → 设置与开发 → 基本配置",
    "获取 AppID（18位）和 AppSecret",
    "将 Token 和 EncodingAESKey 填入环境变量",
  ],
  xiaohongshu: [
    "登录 creator.xiaohongshu.com → 创作中心 → 账号设置",
    "获取小红书账号 ID（个人页 URL 中可找到）",
    "如需 API 发布，需申请「号店一体」功能",
  ],
  zhihu: [
    "登录 zhihu.com → 个人主页 → 设置",
    "知乎盐选作者可在创作者中心获取更多信息",
    "API 发布需申请「知乎开放平台」权限",
  ],
  douyin: [
    "登录 creator.douyin.com → 创作中心",
    "抖音企业号获取 CID 用于数据追踪",
    "抖音小程序 AppID 用于跳转配置",
  ],
  baidu: [
    "登录 ziyuan.baidu.com → 用户中心 → 站点管理",
    "添加域名后获取 API Token（主动推送用）",
    "配置 Sitemap 提交地址",
  ],
  google: [
    "登录 search.google.com/search-console",
    "选择「网域」输入 rongwang.hk",
    "通过 DNS TXT 记录完成验证",
  ],
  email: [
    "推荐使用 SendGrid / 邮件鲨 SMTP 服务",
    "获取 SMTP Host、Port、Username、Password",
    "配置 MARKETING_SMTP_* 环境变量",
  ],
};

export default function MarketingAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [expandedInstruction, setExpandedInstruction] = useState<string | null>(null);

  const [form, setForm] = useState({ platform: "wechat", accountName: "", accountId: "" });

  const fetchAccounts = useCallback(async () => {
    const r = await fetch("/api/marketing/accounts");
    const data = await r.json();
    if (!data.error) setAccounts(data.accounts ?? []);
  }, []);

  useEffect(() => {
    fetchAccounts().finally(() => setLoading(false));
  }, [fetchAccounts]);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.accountName.trim()) { showToast("请填写账号名称", "error"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/marketing/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "保存失败", "error"); return; }
      showToast("账号添加成功", "success");
      setShowCreateModal(false);
      setForm({ platform: "wechat", accountName: "", accountId: "" });
      fetchAccounts();
    } catch {
      showToast("网络异常，请稍后重试", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除此账号？相关帖子不会被删除。")) return;
    await fetch(`/api/marketing/accounts/${id}`, { method: "DELETE" });
    fetchAccounts();
  }

  const tabs = [
    { key: "all", label: `全部 (${accounts.length})` },
    ...platformOptions.map((p) => ({
      key: p.value,
      label: p.label,
      count: accounts.filter((a) => a.platform === p.value).length,
    })),
  ];

  const filtered = activeTab === "all" ? accounts : accounts.filter((a) => a.platform === activeTab);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Link href="/marketing" className="text-sm text-slate-500 hover:text-slate-700">← 营销中枢</Link>
                <span className="text-slate-300">/</span>
                <h1 className="text-xl font-bold text-slate-900">平台账号管理</h1>
              </div>
              <p className="mt-1 text-sm text-slate-500">管理各平台账号信息，用于内容发布时的账号关联</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm">
              + 添加账号
            </button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const tabCount = 'count' in tab ? tab.count : undefined;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    activeTab === tab.key
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                  {typeof tabCount === 'number' && tabCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-white/30 px-1.5 py-0.5 text-xs">{tabCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="text-5xl">🔑</div>
            <div className="mt-4 text-lg font-medium text-slate-700">还没有{activeTab === "all" ? "任何账号" : platformOptions.find((p) => p.value === activeTab)?.label}账号</div>
            <div className="mt-2 text-sm text-slate-500">添加平台账号后，可以关联到帖子实现精准发布</div>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary mt-6">+ 添加第一个账号</button>
          </div>
        ) : (
          filtered.map((account) => {
            const platform = platformOptions.find((p) => p.value === account.platform);
            return (
              <div key={account.id} className="group rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm hover:shadow-md hover:border-slate-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{platform?.label.split(" ")[0] ?? "🌐"}</div>
                    <div>
                      <div className="font-semibold text-slate-900">{account.accountName}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                        <span>{platform?.label.split(" ")[1] ?? account.platform}</span>
                        {account.accountId && <span>· ID: {account.accountId}</span>}
                        <span>· 添加于 {new Date(account.createdAt).toLocaleDateString("zh-CN")}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="opacity-0 group-hover:opacity-100 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                  >
                    删除
                  </button>
                </div>

                {/* Instructions expandable */}
                {expandedInstruction === account.id ? (
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
                    <div className="font-medium text-slate-700 mb-2">如何获取 {platform?.label} 账号？</div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                      {(platformInstructions[account.platform] ?? ["暂无说明"]).map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                    <button
                      onClick={() => setExpandedInstruction(null)}
                      className="mt-3 text-xs text-slate-400 hover:text-slate-600"
                    >
                      收起说明
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setExpandedInstruction(account.id)}
                    className="mt-2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    如何获取账号？↓
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">添加平台账号</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">平台</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                >
                  {platformOptions.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">账号名称 <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.accountName}
                  onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  placeholder="例如：荣旺健康官方公众号"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">账号ID（可选）</label>
                <input
                  type="text"
                  value={form.accountId}
                  onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  placeholder="平台提供的账号ID"
                />
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="font-medium text-slate-700 mb-2">💡 获取说明</div>
                <ol className="list-decimal list-inside space-y-1">
                  {(platformInstructions[form.platform] ?? ["暂无说明"]).map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">取消</button>
                <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
                  {submitting ? "保存中..." : "添加账号"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 rounded-xl px-5 py-3 text-sm font-medium shadow-lg ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}