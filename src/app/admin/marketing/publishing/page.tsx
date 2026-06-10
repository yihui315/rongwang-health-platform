"use client";
import { useState, useEffect } from "react";

interface Post {
  id: string;
  platform: string;
  title: string;
  status: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  scheduledAt: string | null;
  publishedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

const PLATFORMS = [
  { value: "xiaohongshu", label: "小红书" },
  { value: "douyin", label: "抖音" },
  { value: "zhihu", label: "知乎" },
  { value: "wechat", label: "微信公众号" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
  { value: "pinterest", label: "Pinterest" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  scheduled: "bg-amber-100 text-amber-700",
  publishing: "bg-blue-100 text-blue-700",
  published: "bg-teal-100 text-teal-700",
  failed: "bg-red-100 text-red-700",
};

export default function MarketingPublishingPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  async function fetchPosts() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterPlatform) params.set("platform", filterPlatform);
    if (filterStatus) params.set("status", filterStatus);
    const res = await fetch(`/api/marketing/posts?${params}`);
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }

  useEffect(() => { fetchPosts(); }, [filterPlatform, filterStatus]);

  async function updateStatus(id: string, status: string) {
    const body: Record<string, any> = { status };
    if (status === "published") body.publishedAt = new Date().toISOString();
    await fetch(`/api/marketing/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    fetchPosts();
  }

  async function deletePost(id: string) {
    if (!confirm("确认删除？")) return;
    await fetch(`/api/marketing/posts/${id}`, { method: "DELETE" });
    fetchPosts();
  }

  const platformLabel = (v: string) => PLATFORMS.find(p => p.value === v)?.label || v;

  // Stats
  const stats = {
    total: posts.length,
    draft: posts.filter(p => p.status === "draft").length,
    scheduled: posts.filter(p => p.status === "scheduled").length,
    published: posts.filter(p => p.status === "published").length,
    failed: posts.filter(p => p.status === "failed").length,
  };

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge-teal">Publishing Dashboard</span>
            <h1 className="mt-4 text-slate-900">发布监控</h1>
            <p className="mt-3 text-sm text-slate-500">追踪所有平台内容发布状态，管理自动化发布队列。</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            { key: "total", label: "全部", color: "text-slate-900" },
            { key: "draft", label: "草稿", color: "text-slate-600" },
            { key: "scheduled", label: "待发布", color: "text-amber-600" },
            { key: "published", label: "已发布", color: "text-teal-600" },
            { key: "failed", label: "失败", color: "text-red-600" },
          ].map(s => (
            <div key={s.key} className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
              <p className={`text-3xl font-semibold ${s.color}`}>{(stats as any)[s.key]}</p>
              <p className="mt-1 text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 平台分布 */}
        <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          {PLATFORMS.map(p => {
            const count = posts.filter(post => post.platform === p.value).length;
            return (
              <div key={p.value} className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-center">
                <p className="text-sm font-medium text-slate-700">{p.label}</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{count}</p>
              </div>
            );
          })}
        </div>

        {/* 筛选 */}
        <div className="mt-6 flex flex-wrap gap-3">
          <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="">全部平台</option>
            {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="scheduled">待发布</option>
            <option value="published">已发布</option>
            <option value="failed">失败</option>
          </select>
        </div>

        {/* 列表 */}
        <div className="mt-4 rounded-3xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-6 py-4 font-medium text-slate-500">内容</th>
                <th className="px-6 py-4 font-medium text-slate-500">平台</th>
                <th className="px-6 py-4 font-medium text-slate-500">状态</th>
                <th className="px-6 py-4 font-medium text-slate-500">数据</th>
                <th className="px-6 py-4 font-medium text-slate-500">时间</th>
                <th className="px-6 py-4 font-medium text-slate-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">加载中...</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">暂无内容</td></tr>
              ) : posts.map(post => (
                <tr key={post.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 truncate max-w-[200px]">{post.title}</p>
                    {post.errorMessage && <p className="mt-1 text-xs text-red-500">{post.errorMessage}</p>}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{platformLabel(post.platform)}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[post.status] || "bg-slate-100 text-slate-600"}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <span className="text-xs">👁{post.views} 👍{post.likes} 💬{post.comments}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("zh-CN") :
                     post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString("zh-CN") :
                     new Date(post.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {post.status === "draft" && (
                        <button onClick={() => updateStatus(post.id, "published")} className="text-xs text-teal-600 hover:text-teal-800">发布</button>
                      )}
                      {post.status === "scheduled" && (
                        <button onClick={() => updateStatus(post.id, "draft")} className="text-xs text-amber-600 hover:text-amber-800">取消</button>
                      )}
                      <button onClick={() => deletePost(post.id)} className="text-xs text-red-500 hover:text-red-700">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}