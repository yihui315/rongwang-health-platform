"use client";
import { useState, useEffect } from "react";

interface PlatformAccount {
  id: string;
  platform: string;
  accountName: string;
  accountId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
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
  { value: "brightbean", label: "BrightBean" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "badge-teal",
  inactive: "badge-slate",
  suspended: "badge-red",
  error: "badge-red",
};

export default function MarketingAccountsPage() {
  const [accounts, setAccounts] = useState<PlatformAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ platform: "xiaohongshu", accountName: "", accountId: "" });

  async function fetchAccounts() {
    setLoading(true);
    try {
      const res = await fetch("/api/marketing/accounts");
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { fetchAccounts(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/marketing/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ platform: "xiaohongshu", accountName: "", accountId: "" });
    fetchAccounts();
  }

  async function handleDelete(id: string) {
    if (!confirm("确认删除？")) return;
    await fetch(`/api/marketing/accounts/${id}`, { method: "DELETE" });
    fetchAccounts();
  }

  const platformLabel = (v: string) => PLATFORMS.find(p => p.value === v)?.label || v;

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge-teal">Platform Accounts</span>
            <h1 className="mt-4 text-slate-900">平台账号管理</h1>
            <p className="mt-3 text-sm text-slate-500">管理所有社交平台账号凭证，自动化发布的前提。</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? "取消" : "+ 添加账号"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-slate-700">平台</label>
                <select
                  value={form.platform}
                  onChange={e => setForm({ ...form, platform: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">账号名称</label>
                <input
                  value={form.accountName}
                  onChange={e => setForm({ ...form, accountName: e.target.value })}
                  placeholder="如：荣旺健康官方号"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">平台账号ID</label>
                <input
                  value={form.accountId}
                  onChange={e => setForm({ ...form, accountId: e.target.value })}
                  placeholder="可选"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">取消</button>
              <button type="submit" className="btn-primary">保存</button>
            </div>
          </form>
        )}

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-6 py-4 font-medium text-slate-500">平台</th>
                <th className="px-6 py-4 font-medium text-slate-500">账号名称</th>
                <th className="px-6 py-4 font-medium text-slate-500">账号ID</th>
                <th className="px-6 py-4 font-medium text-slate-500">状态</th>
                <th className="px-6 py-4 font-medium text-slate-500">添加时间</th>
                <th className="px-6 py-4 font-medium text-slate-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">加载中...</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">暂无账号，点击上方添加</td></tr>
              ) : accounts.map(acc => (
                <tr key={acc.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900">{platformLabel(acc.platform)}</td>
                  <td className="px-6 py-4 text-slate-600">{acc.accountName}</td>
                  <td className="px-6 py-4 text-slate-500">{acc.accountId || "-"}</td>
                  <td className="px-6 py-4"><span className={`badge-slate ${STATUS_COLORS[acc.status] || "badge-slate"}`}>{acc.status}</span></td>
                  <td className="px-6 py-4 text-slate-500">{new Date(acc.createdAt).toLocaleDateString("zh-CN")}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(acc.id)} className="text-red-500 hover:text-red-700 text-xs">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {["active", "inactive", "suspended", "error"].map(s => (
            <div key={s} className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-semibold text-slate-900">{accounts.filter(a => a.status === s).length}</p>
              <p className="mt-1 text-xs text-slate-500 uppercase">{s}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}