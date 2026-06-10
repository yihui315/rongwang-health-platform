"use client";
import { useState, useEffect } from "react";

interface CalendarEvent {
  id: string;
  date: string;
  platform: string;
  contentType: string;
  title: string;
  brief: string | null;
  status: string;
  postId: string | null;
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
];

const CONTENT_TYPES = [
  { value: "article", label: "长文章" },
  { value: "video", label: "视频" },
  { value: "short_form", label: "短视频" },
  { value: "story", label: "Story" },
  { value: "reel", label: "Reel" },
];

const STATUS_COLORS: Record<string, string> = {
  planned: "badge-slate",
  in_progress: "badge-amber",
  published: "badge-teal",
  cancelled: "badge-red",
};

const TYPE_COLORS: Record<string, string> = {
  article: "bg-blue-100 text-blue-700",
  video: "bg-purple-100 text-purple-700",
  short_form: "bg-pink-100 text-pink-700",
  story: "bg-orange-100 text-orange-700",
  reel: "bg-green-100 text-green-700",
};

export default function MarketingCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: "", platform: "xiaohongshu", contentType: "article", title: "", brief: ""
  });

  async function fetchEvents() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterPlatform) params.set("platform", filterPlatform);
    const res = await fetch(`/api/marketing/calendar?${params}`);
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  }

  useEffect(() => { fetchEvents(); }, [filterPlatform]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/marketing/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ date: "", platform: "xiaohongshu", contentType: "article", title: "", brief: "" });
    fetchEvents();
  }

  const grouped = events.reduce((acc, ev) => {
    const d = ev.date.split("T")[0];
    if (!acc[d]) acc[d] = [];
    acc[d].push(ev);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const platformLabel = (v: string) => PLATFORMS.find(p => p.value === v)?.label || v;

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge-teal">Content Calendar</span>
            <h1 className="mt-4 text-slate-900">内容日历</h1>
            <p className="mt-3 text-sm text-slate-500">规划未来30天内容排期，自动化发布队列。</p>
          </div>
          <div className="flex gap-3">
            <select
              value={filterPlatform}
              onChange={e => setFilterPlatform(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">全部平台</option>
              {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
              {showForm ? "取消" : "+ 添加事件"}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-sm font-medium text-slate-700">日期</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">平台</label>
                <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">内容类型</label>
                <select value={form.contentType} onChange={e => setForm({ ...form, contentType: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  {CONTENT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">标题</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                  placeholder="内容标题"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700">简述</label>
              <textarea value={form.brief} onChange={e => setForm({ ...form, brief: e.target.value })}
                placeholder="可选简述"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" rows={2} />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">取消</button>
              <button type="submit" className="btn-primary">添加</button>
            </div>
          </form>
        )}

        <div className="mt-8 space-y-6">
          {loading ? (
            <p className="text-center text-slate-400 py-12">加载中...</p>
          ) : Object.keys(grouped).length === 0 ? (
            <p className="text-center text-slate-400 py-12">暂无排期事件，添加一个吧</p>
          ) : Object.entries(grouped).sort().map(([date, dayEvents]) => (
            <div key={date}>
              <h3 className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wide">{date}</h3>
              <div className="grid gap-3 lg:grid-cols-2">
                {dayEvents.map(ev => (
                  <div key={ev.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{ev.title}</p>
                        {ev.brief && <p className="mt-1 text-sm text-slate-500">{ev.brief}</p>}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {platformLabel(ev.platform)}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${TYPE_COLORS[ev.contentType] || "bg-slate-100 text-slate-600"}`}>
                            {CONTENT_TYPES.find(c => c.value === ev.contentType)?.label || ev.contentType}
                          </span>
                          <span className={`badge-slate ${STATUS_COLORS[ev.status] || "badge-slate"}`}>{ev.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {["planned", "in_progress", "published", "cancelled"].map(s => (
            <div key={s} className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-semibold text-slate-900">{events.filter(e => e.status === s).length}</p>
              <p className="mt-1 text-xs text-slate-500 uppercase">{s}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}