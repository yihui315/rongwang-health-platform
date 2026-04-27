'use client';

import { useState } from 'react';
import { trackNewsletterSignup } from '@/components/layout/Analytics';

interface NewsletterSignupProps {
  variant?: 'inline' | 'footer' | 'popup';
  onSuccess?: () => void;
}

export default function NewsletterSignup({ variant = 'inline', onSuccess }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setMessage('订阅成功！感谢关注荣旺健康');
        setEmail('');
        trackNewsletterSignup(email);
        onSuccess?.();
      } else {
        const data = await res.json();
        setStatus('error');
        setMessage(data.error || '订阅失败，请稍后重试');
      }
    } catch {
      setStatus('error');
      setMessage('网络异常，请稍后重试');
    }
  };

  if (variant === 'footer') {
    return (
      <div className="w-full">
        <h4 className="text-[13px] font-semibold text-slate-900 uppercase tracking-wider mb-3">
          健康资讯订阅
        </h4>
        <p className="text-[13px] text-slate-500 mb-3">
          每周精选健康科普与会员专属优惠
        </p>
        {status === 'success' ? (
          <p className="text-sm text-teal-600 font-medium">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 min-w-0 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {status === 'loading' ? '...' : '订阅'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="mt-2 text-xs text-red-500">{message}</p>
        )}
      </div>
    );
  }

  if (variant === 'popup') {
    return (
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          订阅荣旺健康资讯
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          获取最新健康科普、新品首发通知和会员专属折扣
        </p>
        {status === 'success' ? (
          <div className="py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 mb-3">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-teal-600 font-medium">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              required
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-teal-500 rounded-xl hover:from-teal-700 hover:to-teal-600 transition-all disabled:opacity-50 shadow-sm"
            >
              {status === 'loading' ? '提交中...' : '立即订阅，领取新人9折券'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="mt-2 text-xs text-red-500">{message}</p>
        )}
        <p className="mt-3 text-[11px] text-slate-400">
          我们尊重您的隐私，随时可退订
        </p>
      </div>
    );
  }

  // Default: inline banner
  return (
    <section className="bg-gradient-to-r from-teal-50 to-cyan-50 border-y border-teal-100">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              订阅荣旺健康周刊
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              每周一封，精选健康科普 + 独家优惠，新订阅用户享首单 9 折
            </p>
          </div>
          {status === 'success' ? (
            <p className="text-teal-600 font-medium">{message}</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 md:w-72 px-4 py-2.5 text-sm border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
              >
                {status === 'loading' ? '...' : '免费订阅'}
              </button>
            </form>
          )}
        </div>
        {status === 'error' && (
          <p className="mt-2 text-xs text-red-500">{message}</p>
        )}
      </div>
    </section>
  );
}
