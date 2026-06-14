"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface HubStats {
  posts_total: number;
  posts_by_platform: Record<string, number>;
  accounts_total: number;
  accounts_by_platform: Record<string, number>;
  wechat_configured: boolean;
  geoflow_configured: boolean;
  recent_posts: Array<{
    id: string;
    title: string;
    platform: string;
    status: string;
    createdAt: string;
  }>;
}

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    label: "内容中心",
    description: "查看、管理和创建所有营销帖子",
    href: "/marketing/content",
    icon: "📝",
    color: "from-teal-500 to-emerald-600",
  },
  {
    label: "AI 营销助手",
    description: "输入产品或场景，AI 生成完整营销文案",
    href: "/marketing/assistant",
    icon: "🤖",
    color: "from-violet-500 to-purple-600",
  },
  {
    label: "平台账号",
    description: "管理微信公众号、小红书、知乎等平台账号",
    href: "/marketing/accounts",
    icon: "🔑",
    color: "from-amber-500 to-orange-600",
  },
];

const platformLabels: Record<string, string> = {
  wechat: "微信公众号",
  xiaohongshu: "小红书",
  zhihu: "知乎",
  douyin: "抖音",
  seo_article: "SEO文章",
  email: "邮件",
};

export default function MarketingHubPage() {
  const [stats, setStats] = useState<HubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/marketing/hub")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError("加载失败");
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">📊</span>
                <h1 className="text-2xl font-bold text-slate-900">营销中枢</h1>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                荣旺健康 · AI 驱动全平台内容营销管理
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/marketing/assistant" className="btn-primary text-sm">
                🤖 AI 生成内容
              </Link>
              <Link href="/marketing/content" className="btn-secondary text-sm">
                + 新建帖子
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Quick Actions */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-700">快捷入口</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-slate-300"
              >
                <div className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${action.color} p-2.5 text-white`}>
                  <span className="text-xl">{action.icon}</span>
                </div>
                <div className="mt-4">
                  <div className="font-semibold text-slate-900 group-hover:text-teal-700">{action.label}</div>
                  <div className="mt-1 text-sm text-slate-500">{action.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* System Status */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-700">系统状态</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatusCard
              label="微信公众号"
              status={stats?.wechat_configured ? "已配置" : "待配置"}
              ready={!!stats?.wechat_configured}
            />
            <StatusCard
              label="GEOFlow CMS"
              status={stats?.geoflow_configured ? "已配置" : "离线模式"}
              ready={!!stats?.geoflow_configured}
            />
            <StatusCard
              label="平台账号"
              value={stats?.accounts_total ?? "—"}
              ready={true}
            />
            <StatusCard
              label="总帖子数"
              value={stats?.posts_total ?? "—"}
              ready={true}
            />
          </div>
        </section>

        {/* Platform Breakdown */}
        {stats && Object.keys(stats.posts_by_platform || {}).length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-700">各平台内容分布</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(stats.posts_by_platform).map(([platform, count]) => (
                <div key={platform} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={platform} />
                    <span className="text-sm font-medium text-slate-700">
                      {platformLabels[platform] ?? platform}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{count} 篇</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Posts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-700">最近帖子</h2>
            <Link href="/marketing/content" className="text-sm text-teal-600 hover:underline">
              查看全部 →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error} — 请检查营销 API 配置
            </div>
          ) : stats?.recent_posts && stats.recent_posts.length > 0 ? (
            <div className="space-y-2">
              {stats.recent_posts.slice(0, 8).map((post) => (
                <div key={post.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <PlatformIcon platform={post.platform} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{post.title}</div>
                      <div className="text-xs text-slate-400">
                        {platformLabels[post.platform] ?? post.platform} · {new Date(post.createdAt).toLocaleDateString("zh-CN")}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={post.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <div className="text-4xl">📭</div>
              <div className="mt-3 font-medium text-slate-700">暂无帖子</div>
              <div className="mt-1 text-sm text-slate-500">去内容中心创建第一篇营销内容</div>
              <Link href="/marketing/content" className="mt-4 inline-block text-sm text-teal-600 hover:underline">
                前往内容中心 →
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatusCard({ label, value, status, ready }: {
  label: string;
  value?: string;
  status?: string;
  ready: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-1 text-xl font-bold ${ready ? "text-slate-900" : "text-amber-600"}`}>
        {value ?? status}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    published: { label: "已发布", color: "bg-emerald-100 text-emerald-700" },
    draft: { label: "草稿", color: "bg-slate-100 text-slate-600" },
    scheduled: { label: "定时", color: "bg-blue-100 text-blue-700" },
    failed: { label: "失败", color: "bg-rose-100 text-rose-700" },
  };
  const style = map[status] ?? { label: status, color: "bg-slate-100 text-slate-600" };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.color}`}>
      {style.label}
    </span>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  const icons: Record<string, string> = {
    wechat: "💚",
    xiaohongshu: "🔴",
    zhihu: "🔵",
    douyin: "🎵",
    seo_article: "📄",
    email: "📧",
  };
  return <span className="text-lg">{icons[platform] ?? "📝"}</span>;
}