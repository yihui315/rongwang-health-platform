'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: 'err', text: data.error ?? '注册失败' });
        return;
      }
      setMsg({ type: 'ok', text: data.message ?? '注册成功' });
      setTimeout(() => router.push('/auth/login'), 1200);
    } catch {
      setMsg({ type: 'err', text: '网络异常' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50 px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-teal-600">荣旺健康</Link>
          <h1 className="mt-6 text-3xl font-bold text-slate-900">创建账户</h1>
          <p className="mt-2 text-slate-600">3 分钟开启专属健康管理</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-3xl bg-white border border-slate-200 shadow-xl shadow-teal-500/5 p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">邮箱</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">密码</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              placeholder="至少 8 位"
            />
          </div>

          {msg && (
            <div
              className={`rounded-xl text-sm px-4 py-3 ${
                msg.type === 'ok'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-teal-600 to-teal-500 text-white py-3 font-semibold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? '注册中…' : '免费注册'}
          </button>

          <div className="text-center text-sm text-slate-500">
            已有账户？{' '}
            <Link href="/auth/login" className="text-teal-600 font-semibold hover:underline">
              立即登录
            </Link>
          </div>

          <p className="text-xs text-slate-400 text-center leading-relaxed">
            注册即代表同意荣旺健康《服务条款》与《隐私政策》
          </p>
        </form>
      </div>
    </main>
  );
}
