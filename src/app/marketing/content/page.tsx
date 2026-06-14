"use client";

import { useEffect, useState, useCallback } from "react";

interface Post {
  id: string;
  title: string;
  content: string;
  platform: string;
  status: string;
  platformAccountId?: string;
  mediaUrls: string[];
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Account {
  id: string;
  platform: string;
  accountName: string;
  accountId?: string;
}

const platformLabels: Record<string, string> = {
  wechat: "💚 微信公众号",
  xiaohongshu: "🔴 小红书",
  zhihu: "🔵 知乎",
  douyin: "🎵 抖音",
  seo_article: "📄 SEO文章",
  email: "📧 邮件",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  published: { label: "已发布", color: "bg-emerald-100 text-emerald-700" },
  draft: { label: "草稿", color: "bg-slate-100 text-slate-600" },
  scheduled: { label: "定时发布", color: "bg-blue-100 text-blue-700" },
  failed: { label: "失败", color: "bg-rose-100 text-rose-700" },
};

const defaultContentByPlatform: Record<string, string> = {
  wechat: "以下是我为你带来的健康科普内容...\n\n点击下方链接获取 AI 健康评估，定制专属调理方案：\nhttps://rongwang.hk/ai-consult",
  xiaohongshu: "【健康分享】\n\n今天来聊聊一个很多人都关心的话题：如何科学地调理身体？\n\n✨ 关键要点：\n1. 了解自身体质\n2. 选择合适的营养补充\n3. 坚持健康的生活方式\n\n👇 点击链接做 AI 健康评估，找到适合你的方案：\nrongwang.hk/ai-consult",
  zhihu: "作为一个长期关注健康的从业者，我来分享一些科学调理的经验。\n\n很多人问我：如何判断自己需要补充什么营养素？我的建议是：先做一个 AI 健康评估，了解自己的体质和需求，再选择针对性的产品。\n\n推荐一个我最近在用的 AI 健康评估工具：\nhttps://rongwang.hk/ai-consult\n\n评估后会给出一份详细的健康报告和个性化方案，非常专业。",
  douyin: "🎬 健康科普时间！\n\n今天来聊聊 [主题] 👇\n\n\n[核心内容要点]\n\n想知道适合你的调理方案？点击下方链接做 AI 评估 👇",
  email: "",
  seo_article: "",
};

export default function MarketingContentPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
    platform: "wechat",
    platformAccountId: "",
    scheduledAt: "",
  });

  const fetchPosts = useCallback(async () => {
    const url = activeTab === "all" ? "/api/marketing/posts" : `/api/marketing/posts?platform=${activeTab}`;
    const r = await fetch(url);
    const data = await r.json();
    if (!data.error) setPosts(data.posts ?? []);
  }, [activeTab]);

  const fetchAccounts = useCallback(async () => {
    const r = await fetch("/api/marketing/accounts");
    const data = await r.json();
    if (!data.error) setAccounts(data.accounts ?? []);
  }, []);

  useEffect(() => {
    Promise.all([fetchPosts(), fetchAccounts()]).finally(() => setLoading(false));
  }, [fetchPosts, fetchAccounts]);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openCreate(post?: Post) {
    if (post) {
      setEditingPost(post);
      setForm({
        title: post.title,
        content: post.content,
        platform: post.platform,
        platformAccountId: post.platformAccountId ?? "",
        scheduledAt: post.scheduledAt ? post.scheduledAt.slice(0, 16) : "",
      });
    } else {
      setEditingPost(null);
      const defaultContent = defaultContentByPlatform[form.platform] ?? "";
      setForm({ title: "", content: defaultContent, platform: "wechat", platformAccountId: "", scheduledAt: "" });
    }
    setShowCreateModal(true);
  }

  function handlePlatformChange(platform: string) {
    setForm((f) => ({
      ...f,
      platform,
      content: defaultContentByPlatform[platform] ?? "",
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { showToast("请填写标题", "error"); return; }
    setSubmitting(true);
    try {
      const body = {
        title: form.title,
        content: form.content,
        platform: form.platform,
        platformAccountId: form.platformAccountId || undefined,
        scheduledAt: form.scheduledAt || undefined,
        sourceArticleId: undefined,
        mediaUrls: [],
      };

      let res: Response;
      if (editingPost) {
        res = await fetch(`/api/marketing/posts/${editingPost.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/marketing/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "保存失败", "error"); return; }
      showToast(editingPost ? "更新成功" : "创建成功", "success");
      setShowCreateModal(false);
      fetchPosts();
    } catch {
      showToast("网络异常，请稍后重试", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除这条帖子？")) return;
    await fetch(`/api/marketing/posts/${id}`, { method: "DELETE" });
    fetchPosts();
  }

  const tabs = [
    { key: "all", label: "全部" },
    { key: "wechat", label: "💚 公众号" },
    { key: "xiaohongshu", label: "🔴 小红书" },
    { key: "zhihu", label: "🔵 知乎" },
    { key: "douyin", label: "🎵 抖音" },
    { key: "seo_article", label: "📄 SEO文章" },
  ];

  const filteredPosts = activeTab === "all" ? posts : posts.filter((p) => p.platform === activeTab);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Link href="/marketing" className="text-sm text-slate-500 hover:text-slate-700">← 营销中枢</Link>
                <span className="text-slate-300">/</span>
                <h1 className="text-xl font-bold text-slate-900">内容中心</h1>
              </div>
              <p className="mt-1 text-sm text-slate-500">{posts.length} 篇内容 · {accounts.length} 个已配置账号</p>
            </div>
            <button onClick={() => openCreate()} className="btn-primary text-sm">
              + 新建帖子
            </button>
          </div>

          {/* Platform Tabs */}
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
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
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="text-5xl">📭</div>
            <div className="mt-4 text-lg font-medium text-slate-700">还没有{activeTab === "all" ? "任何内容" : platformLabels[activeTab] + "内容"}</div>
            <div className="mt-2 text-sm text-slate-500">创建第一篇内容，开始你的营销工作流</div>
            <button onClick={() => openCreate()} className="btn-primary mt-6">
              + 新建帖子
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPosts.map((post) => {
              const status = statusLabels[post.status as keyof typeof statusLabels] ?? { label: post.status, color: "bg-slate-100 text-slate-600" };
              return (
                <div key={post.id} className="group rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:shadow-md hover:border-slate-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{platformLabels[post.platform] ?? post.platform}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>{status.label}</span>
                      </div>
                      <div className="text-base font-semibold text-slate-900">{post.title}</div>
                      <div className="mt-1 line-clamp-2 text-sm text-slate-500">{post.content}</div>
                      <div className="mt-2 text-xs text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString("zh-CN")} {post.scheduledAt ? `· 定时: ${new Date(post.scheduledAt).toLocaleString("zh-CN")}` : ""}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => openCreate(post)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">编辑</button>
                      <button onClick={() => handleDelete(post.id)} className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50">删除</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">{editingPost ? "编辑帖子" : "新建帖子"}</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Platform */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">发布平台</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(platformLabels).slice(0, 6).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handlePlatformChange(key)}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                        form.platform === key
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account */}
              {accounts.filter((a) => a.platform === form.platform).length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">关联账号</label>
                  <select
                    value={form.platformAccountId}
                    onChange={(e) => setForm((f) => ({ ...f, platformAccountId: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  >
                    <option value="">不关联（使用默认）</option>
                    {accounts.filter((a) => a.platform === form.platform).map((a) => (
                      <option key={a.id} value={a.id}>{a.accountName}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">标题 <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  placeholder="输入帖子标题..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">内容</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={8}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-500 resize-none"
                  placeholder="输入内容..."
                />
                <div className="mt-1.5 text-xs text-slate-400">
                  字数：{form.content.length} · 建议包含 CTA 引导到 /ai-consult
                </div>
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">定时发布（可选）</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">取消</button>
                <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
                  {submitting ? "保存中..." : editingPost ? "更新帖子" : "创建草稿"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
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

// Need Link import for back button
import Link from "next/link";