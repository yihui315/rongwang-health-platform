"use client";
import { useState, useEffect } from "react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  category: string;
  author: string;
  published_at: string;
  read_time: string;
  source: string;
}

interface MarketingPost {
  id: string;
  platform: string;
  title: string;
  status: string;
  sourceArticleId: string | null;
  createdAt: string;
}

export default function MarketingContentFactoryPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [posts, setPosts] = useState<MarketingPost[]>();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [createPostLoading, setCreatePostLoading] = useState(false);
  const [created, setCreated] = useState<string[]>([]);

  async function fetchData() {
    setLoading(true);
    const [cmsRes, postsRes] = await Promise.all([
      fetch("/_geoflow_cache/articles.json"),
      fetch("/api/marketing/posts"),
    ]);
    const cms = await cmsRes.json();
    const postsData = await postsRes.json();
    setArticles(cms.articles || []);
    setPosts(postsData.posts || []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  async function createPost(article: Article, platform: string) {
    setCreatePostLoading(true);
    await fetch("/api/marketing/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform,
        title: article.title,
        content: article.content || article.excerpt,
        sourceArticleId: article.id,
      }),
    });
    setCreated(prev => [...prev, `${article.id}-${platform}`]);
    setCreatePostLoading(false);
    fetchData();
  }

  const filtered = articles.filter(a =>
    a.title.includes(filter) || a.category.includes(filter) || a.excerpt.includes(filter)
  );

  const PLATFORMS = ["xiaohongshu", "douyin", "zhihu", "wechat", "facebook", "instagram"];

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge-teal">Content Factory</span>
            <h1 className="mt-4 text-slate-900">内容工厂</h1>
            <p className="mt-3 text-sm text-slate-500">从GEOFlow文章池选择内容，一键生成多平台分发草稿。</p>
          </div>
          <button onClick={fetchData} className="btn-secondary">刷新</button>
        </div>

        <div className="mt-6 flex gap-3">
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="搜索文章标题、分类、内容..."
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm"
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {loading ? (
            <p className="col-span-full text-center text-slate-400 py-12">加载中...</p>
          ) : filtered.length === 0 ? (
            <p className="col-span-full text-center text-slate-400 py-12">无匹配文章</p>
          ) : filtered.map(article => {
            const linkedPosts = (posts || []).filter(p => p.sourceArticleId === article.id);
            const isCreated = (platform: string) => linkedPosts.some(p => p.platform === platform);

            return (
              <div key={article.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{article.title}</p>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">{article.excerpt}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="badge-slate">{article.category}</span>
                      <span className="text-xs text-slate-400">{article.author}</span>
                      <span className="text-xs text-slate-400">{article.read_time}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedArticle(selectedArticle?.id === article.id ? null : article)}
                    className="shrink-0 text-slate-400 hover:text-slate-600 text-sm"
                  >
                    {selectedArticle?.id === article.id ? "收起" : "展开"}
                  </button>
                </div>

                {selectedArticle?.id === article.id && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="text-sm font-medium text-slate-700 mb-3">生成多平台草稿</p>
                    <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
                      {PLATFORMS.map(platform => (
                        <button
                          key={platform}
                          onClick={() => createPost(article, platform)}
                          disabled={isCreated(platform) || createPostLoading}
                          className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                            isCreated(platform)
                              ? "border-teal-200 bg-teal-50 text-teal-600"
                              : "border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                          }`}
                        >
                          {isCreated(platform) ? "✅ " : "+ "}
                          {platform}
                        </button>
                      ))}
                    </div>
                    {linkedPosts.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-slate-500 mb-2">已生成草稿：</p>
                        <div className="flex flex-wrap gap-2">
                          {linkedPosts.map(p => (
                            <span key={p.id} className="rounded-full bg-teal-100 border border-teal-200 px-2 py-0.5 text-xs text-teal-700">
                              {p.platform} · {p.status}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}