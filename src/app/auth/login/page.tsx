'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? '登录失败');
        return;
      }
      router.push('/dashboard');
    } catch {
      setError('网络异常');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50 px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-teal-600">荣旺健康</Link>
          <h1 className="mt-6 text-3xl font-bold text-slate-900">登录你的账户</h1>
          <p className="mt-2 text-slate-600">继续你的健康管理旅程</p>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              placeholder="至少 8 位"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-teal-600 to-teal-500 text-white py-3 font-semibold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? '登录中…' : '登录'}
          </button>

          <div className="text-center text-sm text-slate-500">
            还没有账户？{' '}
            <Link href="/auth/signup" className="text-teal-600 font-semibold hover:underline">
              立即注册
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
